<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\FiscalPeriod;
use App\Models\JournalDetail;
use App\Services\LaporanKeuanganService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(protected LaporanKeuanganService $laporanService)
    {
    }

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

        // Essential data needed for initial render
        $essentialData = [
            'fiscalPeriods' => $fiscalPeriods,
            'selectedPeriod' => $selectedPeriod,
        ];

        // Cash and Cash Equivalents - Batch calculation
        $cashAccounts = Account::where('is_cash_account', true)
            ->where('is_active', 1)
            ->get();

        $accountIds = $cashAccounts->pluck('id');
        
        $balancesMap = DB::table('account_balances')
            ->whereIn('account_id', $accountIds)
            ->where('fiscal_period_id', $selectedPeriod->id)
            ->pluck('ending_balance', 'account_id');

        $cashAndEquivalents = $cashAccounts->map(function ($account) use ($selectedPeriod, $balancesMap) {
            $balance = $balancesMap->get($account->id);
            
            if ($balance === null) {
                // Fallback to manual calculation if no snapshot exists
                $mutation = DB::table('journal_details as jd')
                    ->join('journal_entries as je', 'jd.journal_entry_id', '=', 'je.id')
                    ->where('je.status', 'Posted')
                    ->where('je.entry_date', '<=', $selectedPeriod->end_date)
                    ->where('jd.account_id', $account->id)
                    ->sum(DB::raw('jd.debit - jd.credit'));
                
                $balance = bcadd($account->initial_balance, $mutation, 2);
            }

            return [
                'id' => $account->id,
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'balance' => (float) $balance,
            ];
        });

        return Inertia::render('dashboard/dashboard', [
            ...$essentialData,
            'cashAndEquivalents' => $cashAndEquivalents,
            
            // Defer heavy calculations
            'stats' => Inertia::defer(function() use ($selectedPeriod) {
                $reportData = $this->laporanService->getPosisiKeuangan($selectedPeriod);
                $pnlData = $this->laporanService->getLabaRugi($selectedPeriod);
                
                return [
                    'revenue' => (float) ($pnlData['sales']['total'] + $pnlData['others']['income']['total']),
                    'expense' => (float) ($pnlData['operating_expenses']['total'] + $pnlData['cogs']['total'] + $pnlData['others']['expenses']['total']),
                    'net_profit' => (float) $pnlData['net_income'],
                    'total_assets' => (float) $reportData['assets']['total'],
                    'total_liabilities' => (float) $reportData['liabilities']['total'],
                    'total_equity' => (float) $reportData['equity']['total'],
                ];
            }),
            
            'revenueExpenseChart' => Inertia::defer(fn() => $this->getRevenueExpenseChartData($selectedPeriod)),
            
            'cashFlowChart' => Inertia::defer(fn() => $this->getCashFlowData($selectedPeriod)),
            
            'recentJournals' => Inertia::defer(fn() => 
                \App\Models\JournalEntry::with(['fiscalPeriod', 'user'])
                    ->where('status', 'Posted')
                    ->orderBy('entry_date', 'desc')
                    ->orderBy('created_at', 'desc')
                    ->take(5)
                    ->get()
                    ->map(fn($journal) => [
                        'id' => $journal->id,
                        'entry_number' => $journal->entry_number,
                        'entry_date' => $journal->entry_date->format('d/m/Y'),
                        'journal_type' => $journal->journal_type,
                        'penerima' => $journal->penerima,
                    ])
            ),
        ]);
    }

    private function getRevenueExpenseChartData($period)
    {
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
        // To avoid performance issues with very long periods, we could aggregate by month if needed, 
        // but for a dashboard usually it's one fiscal period (month).
        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            $dateStr = $date->format('Y-m-d');
            $chartData[] = [
                'date' => $dateStr,
                'pendapatan' => (float) ($revenues->get($dateStr)->amount ?? 0),
                'beban' => (float) ($expenses->get($dateStr)->amount ?? 0),
                'period' => $period->period_name,
            ];
        }

        return $chartData;
    }

    private function getCashFlowData($period)
    {
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

        // Optimized date loop
        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
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
