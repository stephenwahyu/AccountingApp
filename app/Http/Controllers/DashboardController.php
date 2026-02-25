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
        $periodsCollection = FiscalPeriod::get();
        $getTypeWeight = function ($type) {
            switch ($type) {
                case 'monthly': return 1;
                case 'quarterly': return 2;
                case 'annually': return 3;
                default: return 4;
            }
        };
        $fiscalPeriods = $periodsCollection->sortBy(function ($period) use ($getTypeWeight) {
            $endDateKey = Carbon::parse($period->end_date)->format('Ymd');
            $typeWeight = $getTypeWeight($period->period_type);

            return "{$endDateKey}{$typeWeight}";
        })->reverse()->values();

        $selectedPeriod = $request->input('period')
            ? $fiscalPeriods->find($request->input('period'))
            : $fiscalPeriods->firstWhere('status', 'Open') ?? $fiscalPeriods->first();

        if (! $selectedPeriod) {
            $selectedPeriod = $fiscalPeriods->first();
        }

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

        // Financial KPIs
        $netProfit = bcsub($revenue, $expense, 2);

        // Calculate Assets, Liabilities, Equity (Adapting logic from LaporanKeuanganController)
        $balances = $this->calculateBalancesForPeriod($selectedPeriod);
        $totalAssets = $balances->where('account_type', 'Aset')->sum('balance');
        $totalLiabilities = $balances->where('account_type', 'Liabilitas')->sum('balance');

        // Equity needs cumulative net income
        $cumulativeNetIncome = $this->calculateCumulativeNetIncome($selectedPeriod);
        $totalEquity = $balances->where('account_type', 'Ekuitas')->sum('balance') + $cumulativeNetIncome;

        // Revenue vs Expense Chart Data
        $revenueExpenseChart = $this->getRevenueExpenseChartData($selectedPeriod->id);

        // Cash Flow Data
        $cashFlowData = $this->getCashFlowData($selectedPeriod->id);

        // Recent Transactions
        $recentJournals = \App\Models\JournalEntry::with(['fiscalPeriod', 'user'])
            ->where('status', 'Posted')
            ->orderBy('entry_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($journal) {
                return [
                    'id' => $journal->id,
                    'entry_number' => $journal->entry_number,
                    'entry_date' => $journal->entry_date->format('d/m/Y'),
                    'journal_type' => $journal->journal_type,
                    'penerima' => $journal->penerima,
                ];
            });

        return Inertia::render('dashboard/dashboard', [
            'fiscalPeriods' => $fiscalPeriods,
            'selectedPeriod' => $selectedPeriod,
            'cashAndEquivalents' => $cashAndEquivalents,
            'stats' => [
                'revenue' => (float) $revenue,
                'expense' => (float) $expense,
                'net_profit' => (float) $netProfit,
                'total_assets' => (float) $totalAssets,
                'total_liabilities' => (float) $totalLiabilities,
                'total_equity' => (float) $totalEquity,
            ],
            'revenueExpenseChart' => $revenueExpenseChart,
            'cashFlowChart' => $cashFlowData,
            'recentJournals' => $recentJournals,
        ]);
    }

    private function calculateBalancesForPeriod($period)
    {
        return DB::table('accounts as a')
            ->join('account_categories as ac', 'a.account_category_id', '=', 'ac.id')
            ->join('account_types as at', 'ac.account_type_id', '=', 'at.id')
            ->leftJoin(DB::raw("(SELECT jd.account_id, SUM(jd.debit) as cumulative_debit, SUM(jd.credit) as cumulative_credit 
                                FROM journal_details jd 
                                JOIN journal_entries je ON jd.journal_entry_id = je.id 
                                WHERE je.status = 'Posted' AND je.entry_date <= '{$period->end_date}'
                                GROUP BY jd.account_id) as period_jd"), 'a.id', '=', 'period_jd.account_id')
            ->select(
                'a.id as account_id',
                'at.name as account_type',
                'at.normal_balance',
                'a.initial_balance as start_balance',
                DB::raw('COALESCE(period_jd.cumulative_debit, 0) as total_debit'),
                DB::raw('COALESCE(period_jd.cumulative_credit, 0) as total_credit')
            )
            ->where('a.is_active', 1)
            ->get()
            ->map(function ($item) {
                if ($item->normal_balance === 'Debit') {
                    $item->balance = (float) $item->start_balance + (float) $item->total_debit - (float) $item->total_credit;
                } else {
                    $item->balance = (float) $item->start_balance + (float) $item->total_credit - (float) $item->total_debit;
                }

                return $item;
            });
    }

    private function calculateCumulativeNetIncome($period)
    {
        return DB::table('journal_details as jd')
            ->join('journal_entries as je', 'jd.journal_entry_id', '=', 'je.id')
            ->join('accounts as a', 'jd.account_id', '=', 'a.id')
            ->join('account_categories as ac', 'a.account_category_id', '=', 'ac.id')
            ->join('account_types as at', 'ac.account_type_id', '=', 'at.id')
            ->where('je.status', 'Posted')
            ->where('je.entry_date', '<=', $period->end_date)
            ->whereIn('at.name', ['Pendapatan', 'Beban'])
            ->select(
                DB::raw('SUM(jd.credit - jd.debit) as net_balance')
            )
            ->first()->net_balance ?? 0;
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

        $revenues = JournalDetail::join('journal_entries', 'journal_details.journal_entry_id', '=', 'journal_entries.id')
            ->whereIn('journal_details.account_id', $revenueAccountIds)
            ->where('journal_entries.status', 'Posted')
            ->whereBetween('journal_entries.entry_date', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(journal_entries.entry_date) as date'),
                DB::raw('SUM(CAST(credit AS DECIMAL(15,2)) - CAST(debit AS DECIMAL(15,2))) as amount')
            )
            ->groupBy('date')
            ->get()
            ->keyBy(fn ($item) => $item->date);

        $expenses = JournalDetail::join('journal_entries', 'journal_details.journal_entry_id', '=', 'journal_entries.id')
            ->whereIn('journal_details.account_id', $expenseAccountIds)
            ->where('journal_entries.status', 'Posted')
            ->whereBetween('journal_entries.entry_date', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(journal_entries.entry_date) as date'),
                DB::raw('SUM(CAST(debit AS DECIMAL(15,2)) - CAST(credit AS DECIMAL(15,2))) as amount')
            )
            ->groupBy('date')
            ->get()
            ->keyBy(fn ($item) => $item->date);

        $chartData = [];
        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            $dateStr = $date->format('Y-m-d');
            $chartData[] = [
                'date' => $date->format('Y-m-d'),
                'pendapatan' => (float) ($revenues->get($dateStr)->amount ?? 0),
                'beban' => (float) ($expenses->get($dateStr)->amount ?? 0),
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
                'chartData' => ['operasional' => [], 'investasi' => [], 'pendanaan' => []],
            ];
        }

        $period = FiscalPeriod::find($periodId);
        if (! $period) {
            return [
                'operasional' => 0,
                'investasi' => 0,
                'pendanaan' => 0,
                'chartData' => ['operasional' => [], 'investasi' => [], 'pendanaan' => []],
            ];
        }

        $startDate = Carbon::parse($period->start_date);
        $endDate = Carbon::parse($period->end_date);
        $cashAccountIds = Account::where('is_cash_account', true)->pluck('id');

        $activityMap = [
            'Aktivitas Operasi' => 'operasional',
            'Aktivitas Investasi' => 'investasi',
            'Aktivitas Pendanaan' => 'pendanaan',
        ];

        $dailySummary = DB::table('journal_details as jd')
            ->join('journal_entries as je', 'jd.journal_entry_id', '=', 'je.id')
            ->join('accounts as a', 'jd.account_id', '=', 'a.id')
            ->leftJoin('cash_flow_activities as cfa', 'a.cash_flow_activity_id', '=', 'cfa.id')
            ->where('je.status', 'Posted')
            ->whereBetween('je.entry_date', [$startDate, $endDate])
            ->whereIn('jd.journal_entry_id', function ($query) use ($cashAccountIds) {
                $query->select('journal_entry_id')->from('journal_details')->whereIn('account_id', $cashAccountIds);
            })
            ->whereNotIn('jd.account_id', $cashAccountIds)
            ->whereNotNull('cfa.name')
            ->select(
                DB::raw('DATE(je.entry_date) as date'),
                'cfa.name as activity_type',
                DB::raw('SUM(jd.credit) - SUM(jd.debit) as amount')
            )
            ->groupBy('date', 'cfa.name')
            ->get();

        $chartData = ['operasional' => [], 'investasi' => [], 'pendanaan' => []];
        $totals = ['operasional' => 0, 'investasi' => 0, 'pendanaan' => 0];

        $dateRange = collect(new \DatePeriod($startDate, new \DateInterval('P1D'), $endDate->copy()->addDay()));

        foreach ($dateRange as $date) {
            foreach ($activityMap as $activity => $keyName) {
                $chartData[$keyName][$date->format('Y-m-d')] = [
                    'date' => $date->format('Y-m-d'),
                    'amount' => 0,
                    'period' => $period->period_name,
                ];
            }
        }

        foreach ($dailySummary as $summary) {
            $keyName = $activityMap[$summary->activity_type] ?? null;
            if ($keyName) {
                $dateStr = $summary->date;
                if (isset($chartData[$keyName][$dateStr])) {
                    $chartData[$keyName][$dateStr]['amount'] = (float) $summary->amount;
                }
                $totals[$keyName] += $summary->amount;
            }
        }

        // Flatten the chart data arrays
        foreach ($chartData as $key => $data) {
            $chartData[$key] = array_values($data);
        }

        return [
            'operasional' => $totals['operasional'],
            'investasi' => $totals['investasi'],
            'pendanaan' => $totals['pendanaan'],
            'chartData' => $chartData,
        ];
    }
}
