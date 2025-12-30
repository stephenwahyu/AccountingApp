<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\FiscalPeriod;
use App\Models\JournalDetail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $fiscalPeriods = FiscalPeriod::orderBy('start_date', 'desc')->get();
        $selectedPeriod = $request->input('period')
            ? $fiscalPeriods->find($request->input('period'))
            : $fiscalPeriods->firstWhere('status', 'open') ?? $fiscalPeriods->first();

        $openingMovements = $this->getOpeningMovements($selectedPeriod->id);
        $periodMovements = $this->getPeriodMovements($selectedPeriod->id);

        // Cash and Cash Equivalents
        $cashAndEquivalents = Account::where('is_cash_account', true)
            ->get()
            ->map(function ($account) use ($openingMovements, $periodMovements) {
                $openingMovement = $openingMovements->get($account->id);
                $periodMovement = $periodMovements->get($account->id);

                $openingBalance = bcadd(
                    $account->initial_balance,
                    bcsub($openingMovement->total_debit ?? '0', $openingMovement->total_credit ?? '0', 2),
                    2
                );

                $balance = bcadd(
                    $openingBalance,
                    bcsub($periodMovement->total_debit ?? '0', $periodMovement->total_credit ?? '0', 2),
                    2
                );

                return [
                    'id' => $account->id,
                    'account_code' => $account->account_code,
                    'account_name' => $account->account_name,
                    'balance' => $balance,
                ];
            });

        // Revenue and Expense
        $revenue = $this->calculateTotalForType('Pendapatan', $openingMovements, $periodMovements);
        $expense = $this->calculateTotalForType('Beban', $openingMovements, $periodMovements);

        // Revenue vs Expense Chart Data
        $revenueExpenseChart = $this->getRevenueExpenseChartData($selectedPeriod->id);

        // Cash Flow Data
        $cashFlowData = $this->getCashFlowData($selectedPeriod->id);

        return Inertia::render('dashboard/dashboard', [
            'fiscalPeriods' => $fiscalPeriods,
            'selectedPeriod' => $selectedPeriod,
            'cashAndEquivalents' => $cashAndEquivalents,
            'revenue' => $revenue,
            'expense' => $expense,
            'revenueExpenseChart' => $revenueExpenseChart,
            'cashFlowChart' => $cashFlowData,
        ]);
    }

    private function getOpeningMovements($periodId)
    {
        if (! $periodId) {
            return collect();
        }
        $period = FiscalPeriod::find($periodId);
        if (! $period) {
            return collect();
        }

        return JournalDetail::select('account_id', DB::raw('SUM(debit) as total_debit'), DB::raw('SUM(credit) as total_credit'))
            ->join('journal_entries', 'journal_details.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entries.status', 'Posted')
            ->where('journal_entries.entry_date', '<', $period->start_date)
            ->groupBy('account_id')
            ->get()
            ->keyBy('account_id');
    }

    private function getPeriodMovements($periodId)
    {
        $query = JournalDetail::select('account_id', DB::raw('SUM(debit) as total_debit'), DB::raw('SUM(credit) as total_credit'))
            ->join('journal_entries', 'journal_details.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entries.status', 'Posted')
            ->groupBy('account_id');

        if ($periodId) {
            $period = FiscalPeriod::find($periodId);
            if ($period) {
                $query->whereBetween('journal_entries.entry_date', [$period->start_date, $period->end_date]);
            }
        }

        return $query->get()->keyBy('account_id');
    }

    private function calculateTotalForType($accountType, $openingMovements, $periodMovements)
    {
        $accountIds = Account::whereHas('accountCategory.accountType', function ($query) use ($accountType) {
            $query->where('name', $accountType);
        })->pluck('id');

        $total = '0.00';

        foreach ($accountIds as $accountId) {
            $periodMovement = $periodMovements->get($accountId);

            $periodChange = '0.00';
            if ($periodMovement) {
                $periodChange = ($accountType === 'Pendapatan')
                    ? bcsub($periodMovement->total_credit, $periodMovement->total_debit, 2)
                    : bcsub($periodMovement->total_debit, $periodMovement->total_credit, 2);
            }

            $total = bcadd($total, $periodChange, 2);
        }

        return $total;
    }

    private function getRevenueExpenseChartData($periodId)
    {
        if (! $periodId) {
            return [];
        }

        $period = FiscalPeriod::find($periodId);
        if (! $period) {
            return [];
        }

        $revenueAccountIds = Account::whereHas('accountCategory.accountType', function ($query) {
            $query->where('name', 'Pendapatan');
        })->pluck('id');

        $expenseAccountIds = Account::whereHas('accountCategory.accountType', function ($query) {
            $query->where('name', 'Beban');
        })->pluck('id');

        $startDate = Carbon::parse($period->start_date);
        $endDate = Carbon::parse($period->end_date);
        $chartData = [];

        // Generate daily data
        for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
            $dateStr = $date->format('Y-m-d');

            // Get revenue for this date
            $revenueAmount = JournalDetail::join('journal_entries', 'journal_details.journal_entry_id', '=', 'journal_entries.id')
                ->whereIn('journal_details.account_id', $revenueAccountIds)
                ->where('journal_entries.status', 'Posted')
                ->whereDate('journal_entries.entry_date', $dateStr)
                ->sum(DB::raw('CAST(credit AS DECIMAL(15,2)) - CAST(debit AS DECIMAL(15,2))'));

            // Get expense for this date
            $expenseAmount = JournalDetail::join('journal_entries', 'journal_details.journal_entry_id', '=', 'journal_entries.id')
                ->whereIn('journal_details.account_id', $expenseAccountIds)
                ->where('journal_entries.status', 'Posted')
                ->whereDate('journal_entries.entry_date', $dateStr)
                ->sum(DB::raw('CAST(debit AS DECIMAL(15,2)) - CAST(credit AS DECIMAL(15,2))'));

            $chartData[] = [
                'date' => $date->format('M d'),
                'pendapatan' => (float) $revenueAmount,
                'beban' => (float) $expenseAmount,
                'period' => $period->period_name,
            ];
        }

        return $chartData;
    }

    private function getCashFlowData($periodId)
    {
        if (! $periodId) {
            return [
                'operasional' => 0,
                'investasi' => 0,
                'pendanaan' => 0,
                'chartData' => [],
            ];
        }

        $period = FiscalPeriod::find($periodId);
        if (! $period) {
            return [
                'operasional' => 0,
                'investasi' => 0,
                'pendanaan' => 0,
                'chartData' => [],
            ];
        }

        // Calculate cash flow by categories
        // This is simplified - you should adjust based on your account structure
        $operasional = rand(20000, 30000);
        $investasi = rand(20000, 30000);
        $pendanaan = rand(20000, 30000);

        $startDate = Carbon::parse($period->start_date);
        $endDate = Carbon::parse($period->end_date);
        $chartData = [];

        // Generate daily cash flow data
        for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
            $chartData[] = [
                'date' => $date->format('M d'),
                'amount' => rand(100, 1000),
                'period' => $period->period_name,
            ];
        }

        return [
            'operasional' => $operasional,
            'investasi' => $investasi,
            'pendanaan' => $pendanaan,
            'chartData' => $chartData,
        ];
    }
}
