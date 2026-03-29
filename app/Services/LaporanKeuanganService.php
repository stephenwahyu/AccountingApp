<?php

namespace App\Services;

use App\Models\FiscalPeriod;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class LaporanKeuanganService
{
    public function getPosisiKeuangan(FiscalPeriod $period)
    {
        $balances = $this->calculateBalancesForPeriod($period, true);

        $startOfFiscalYear = $period->fiscal_year . '-01-01';
        $profitPreviousYears = $this->getNetIncomeByDates(null, Carbon::parse($startOfFiscalYear)->subDay()->toDateString());
        $profitCurrentYear = $this->getNetIncomeByDates($startOfFiscalYear, $period->end_date);

        // Map balances to add previous years' profit to Laba Ditahan (3-2001)
        // and ensure Laba Tahun Berjalan (3-2002) is handled manually
        $balances = $balances->map(function ($item) use ($profitPreviousYears) {
            if ($item->account_code === '3-2001') {
                $item->balance = (float) $item->balance + (float) $profitPreviousYears;
            }

            return $item;
        })->filter(function ($item) {
            // Filter out 3-2002 from default equity balances to avoid double counting
            // as we will add it manually as calculated current year profit
            return $item->account_code !== '3-2002';
        });

        $groupByCategory = function ($typeBalances) {
            return $typeBalances->groupBy('category_name')->map(function ($items, $categoryName) {
                return [
                    'category_name' => $categoryName,
                    'accounts' => $items->values()->map(fn ($item) => (array) $item)->toArray(),
                    'total' => $items->sum('balance'),
                ];
            })->values()->toArray();
        };

        $assetsBalances = $balances->where('account_type', 'Aset')->where('balance', '!=', 0);
        $assetsGrouped = $groupByCategory($assetsBalances);
        $assetsTotal = $assetsBalances->sum('balance');

        $liabilitiesBalances = $balances->where('account_type', 'Liabilitas')->where('balance', '!=', 0);
        $liabilitiesGrouped = $groupByCategory($liabilitiesBalances);
        $liabilitiesTotal = $liabilitiesBalances->sum('balance');

        $equityBalances = $balances->where('account_type', 'Ekuitas')->where('balance', '!=', 0);
        $equityGrouped = $groupByCategory($equityBalances);

        if ($profitCurrentYear != 0) {
            $found = false;
            foreach ($equityGrouped as &$group) {
                if ($group['category_name'] === 'Laba (Rugi)' || $group['category_name'] === 'Modal') {
                    $group['accounts'][] = [
                        'account_id' => null,
                        'account_code' => '3-2002',
                        'account_name' => 'Laba Tahun Berjalan',
                        'balance' => (float) $profitCurrentYear,
                    ];
                    $group['total'] += (float) $profitCurrentYear;
                    $found = true;
                    break;
                }
            }
            if (! $found) {
                $equityGrouped[] = [
                    'category_name' => 'Laba (Rugi)',
                    'accounts' => [[
                        'account_id' => null,
                        'account_code' => '3-2002',
                        'account_name' => 'Laba Tahun Berjalan',
                        'balance' => (float) $profitCurrentYear,
                    ]],
                    'total' => (float) $profitCurrentYear,
                ];
            }
        }

        $equityTotal = collect($equityGrouped)->sum('total');

        return [
            'period' => $period->toArray(),
            'assets' => [
                'categories' => $assetsGrouped,
                'total' => $assetsTotal,
            ],
            'liabilities' => [
                'categories' => $liabilitiesGrouped,
                'total' => $liabilitiesTotal,
            ],
            'equity' => [
                'categories' => $equityGrouped,
                'total' => $equityTotal,
            ],
        ];
    }

    private function getNetIncomeByDates(?string $startDate, string $endDate): float
    {
        $query = DB::table('journal_details as jd')
            ->join('journal_entries as je', 'jd.journal_entry_id', '=', 'je.id')
            ->join('accounts as a', 'jd.account_id', '=', 'a.id')
            ->join('account_categories as ac', 'a.account_category_id', '=', 'ac.id')
            ->join('account_types as at', 'ac.account_type_id', '=', 'at.id')
            ->where('je.status', 'Posted')
            ->whereIn('at.name', ['Pendapatan', 'Beban']);

        if ($startDate) {
            $query->where('je.entry_date', '>=', $startDate);
        }

        $query->where('je.entry_date', '<=', $endDate);

        return (float) ($query->select(DB::raw('SUM(jd.credit - jd.debit) as net_balance'))
            ->first()->net_balance ?? 0);
    }

    public function getLabaRugi(FiscalPeriod $period)
    {
        // For Profit & Loss, we only want the movements within the period (not cumulative from start)
        $balances = $this->calculateBalancesForPeriod($period, false);

        $getGroup = function ($categoryNames) use ($balances) {
            $names = is_array($categoryNames) ? $categoryNames : [$categoryNames];
            $items = $balances->whereIn('category_name', $names)->where('balance', '!=', 0);

            return [
                'categories' => $items->groupBy('category_name')->map(function ($accounts, $name) {
                    return [
                        'category_name' => $name,
                        'accounts' => $accounts->values()->map(fn ($a) => (array) $a)->toArray(),
                        'total' => $accounts->sum('balance'),
                    ];
                })->values()->toArray(),
                'total' => $items->sum('balance'),
            ];
        };

        $sales = $getGroup('Pendapatan Usaha');
        $cogs = $getGroup('Harga Pokok Penjualan');
        $grossProfit = $sales['total'] - $cogs['total'];
        $operatingExpenses = $getGroup(['Beban Penjualan', 'Beban Administrasi & Umum']);
        $operatingProfit = $grossProfit - $operatingExpenses['total'];
        $otherIncome = $getGroup('Pendapatan Lain-Lain');
        $otherExpenses = $getGroup('Beban Lain-Lain');
        $otherNet = $otherIncome['total'] - $otherExpenses['total'];
        $netIncome = $operatingProfit + $otherNet;

        return [
            'period' => $period->toArray(),
            'sales' => $sales,
            'cogs' => $cogs,
            'gross_profit' => $grossProfit,
            'operating_expenses' => $operatingExpenses,
            'operating_profit' => $operatingProfit,
            'others' => [
                'income' => $otherIncome,
                'expenses' => $otherExpenses,
                'net' => $otherNet,
            ],
            'net_income' => $netIncome,
        ];
    }

    public function getArusKas(FiscalPeriod $period)
    {
        $beginningCashBalance = DB::table('accounts')
            ->where('is_cash_account', 1)
            ->sum('initial_balance');

        $previousCashMutation = DB::table('journal_details as jd')
            ->join('journal_entries as je', 'jd.journal_entry_id', '=', 'je.id')
            ->join('accounts as a', 'jd.account_id', '=', 'a.id')
            ->where('je.status', 'Posted')
            ->where('je.entry_date', '<', $period->start_date)
            ->where('a.is_cash_account', 1)
            ->sum(DB::raw('jd.debit - jd.credit'));

        $currentBeginningCash = $beginningCashBalance + $previousCashMutation;

        $results = [];
        $categories = [
            'operating' => 1,
            'investing' => 2,
            'financing' => 3,
        ];

        foreach ($categories as $key => $activityId) {
            $items = DB::table('journal_details as jd')
                ->join('journal_entries as je', 'jd.journal_entry_id', '=', 'je.id')
                ->join('accounts as a', 'jd.account_id', '=', 'a.id')
                ->where('je.status', 'Posted')
                ->whereBetween('je.entry_date', [$period->start_date, $period->end_date])
                ->where('a.cash_flow_activity_id', $activityId)
                ->where('a.is_cash_account', 0)
                ->whereExists(function ($query) {
                    $query->select(DB::raw(1))
                        ->from('journal_details as jd2')
                        ->join('accounts as a2', 'jd2.account_id', '=', 'a2.id')
                        ->whereRaw('jd2.journal_entry_id = jd.journal_entry_id')
                        ->where('a2.is_cash_account', 1);
                })
                ->select(
                    'a.account_name as description',
                    DB::raw('SUM(jd.credit - jd.debit) as balance')
                )
                ->groupBy('a.id', 'a.account_name')
                ->get()
                ->map(function ($item) {
                    return [
                        'description' => $item->description,
                        'inflow' => $item->balance > 0 ? $item->balance : 0,
                        'outflow' => $item->balance < 0 ? abs($item->balance) : 0,
                        'balance' => $item->balance,
                    ];
                });

            $results[$key] = [
                'items' => $items,
                'total' => $items->sum('balance'),
            ];
        }

        return [
            'period' => $period->toArray(),
            'operating' => $results['operating'],
            'investing' => $results['investing'],
            'financing' => $results['financing'],
            'beginning_cash' => $currentBeginningCash,
        ];
    }

    public function getPerubahanEkuitas(FiscalPeriod $period)
    {
        $initialMigrationBalance = DB::table('accounts')
            ->join('account_categories as ac', 'accounts.account_category_id', '=', 'ac.id')
            ->join('account_types as at', 'ac.account_type_id', '=', 'at.id')
            ->where('at.name', 'Ekuitas')
            ->sum('accounts.initial_balance');

        $previousEquityMutation = DB::table('journal_details as jd')
            ->join('journal_entries as je', 'jd.journal_entry_id', '=', 'je.id')
            ->join('accounts as a', 'jd.account_id', '=', 'a.id')
            ->join('account_categories as ac', 'a.account_category_id', '=', 'ac.id')
            ->join('account_types as at', 'ac.account_type_id', '=', 'at.id')
            ->where('je.status', 'Posted')
            ->where('at.name', 'Ekuitas')
            ->where('je.entry_date', '<', $period->start_date)
            ->sum(DB::raw('jd.credit - jd.debit'));

        // Also include accumulated profit (Net Income) from all previous periods up to start_date
        $previousNetIncome = $this->getNetIncomeByDates(null, Carbon::parse($period->start_date)->subDay()->toDateString());

        $beginningBalance = (float) $initialMigrationBalance + (float) $previousEquityMutation + (float) $previousNetIncome;

        $netIncomeReport = $this->getLabaRugi($period);
        $netIncome = $netIncomeReport['net_income'];

        $otherChanges = DB::table('journal_details as jd')
            ->join('journal_entries as je', 'jd.journal_entry_id', '=', 'je.id')
            ->join('accounts as a', 'jd.account_id', '=', 'a.id')
            ->join('account_categories as ac', 'a.account_category_id', '=', 'ac.id')
            ->join('account_types as at', 'ac.account_type_id', '=', 'at.id')
            ->where('je.status', 'Posted')
            ->where('at.name', 'Ekuitas')
            ->where('a.account_code', 'NOT LIKE', '3-2001')
            ->where('a.account_code', 'NOT LIKE', '3-2002')
            ->whereBetween('je.entry_date', [$period->start_date, $period->end_date])
            ->sum(DB::raw('jd.credit - jd.debit'));

        $endingBalance = $beginningBalance + $netIncome + $otherChanges;

        return [
            'period' => $period->toArray(),
            'beginning_balance' => ['total' => $beginningBalance],
            'changes' => [
                'net_income' => $netIncome,
                'others' => $otherChanges,
            ],
            'ending_balance' => ['total' => $endingBalance],
        ];
    }

    private function calculateBalancesForPeriod(FiscalPeriod $period, bool $cumulative = true)
    {
        $snapshotBalances = DB::table('account_balances as ab')
            ->join('accounts as a', 'ab.account_id', '=', 'a.id')
            ->join('account_categories as ac', 'a.account_category_id', '=', 'ac.id')
            ->join('account_types as at', 'ac.account_type_id', '=', 'at.id')
            ->where('ab.fiscal_period_id', $period->id)
            ->select(
                'a.id as account_id',
                'a.account_code',
                'a.account_name',
                'at.name as account_type',
                'at.normal_balance',
                'ac.id as category_id',
                'ac.name as category_name',
                'ab.beginning_balance as start_balance',
                'ab.debit_total as total_debit',
                'ab.credit_total as total_credit',
                'ab.ending_balance as raw_ending_balance'
            )
            ->where('a.is_active', 1)
            ->get();

        if ($snapshotBalances->isNotEmpty()) {
            return $snapshotBalances->map(function ($item) use ($cumulative) {
                if ($cumulative) {
                    $rawBalance = (float) $item->raw_ending_balance;
                } else {
                    // Non-cumulative calculation: strictly period movement
                    $rawBalance = (float) $item->total_debit - (float) $item->total_credit;
                }

                if ($item->normal_balance === 'Debit') {
                    $item->balance = $rawBalance;
                } else {
                    $item->balance = -$rawBalance;
                }

                return $item;
            });
        }

        // Fallback for periods without snapshots (like Quarterly/Annually)
        $dateFilter = $cumulative
            ? "je.entry_date <= '{$period->end_date}'"
            : "je.entry_date BETWEEN '{$period->start_date}' AND '{$period->end_date}'";

        return DB::table('accounts as a')
            ->join('account_categories as ac', 'a.account_category_id', '=', 'ac.id')
            ->join('account_types as at', 'ac.account_type_id', '=', 'at.id')
            ->leftJoin(DB::raw("(SELECT jd.account_id, SUM(jd.debit) as period_debit, SUM(jd.credit) as period_credit 
                                FROM journal_details jd 
                                JOIN journal_entries je ON jd.journal_entry_id = je.id 
                                WHERE je.status = 'Posted' AND {$dateFilter}
                                GROUP BY jd.account_id) as period_jd"), 'a.id', '=', 'period_jd.account_id')
            ->select(
                'a.id as account_id',
                'a.account_code',
                'a.account_name',
                'at.name as account_type',
                'at.normal_balance',
                'ac.id as category_id',
                'ac.name as category_name',
                'a.initial_balance as initial_migration_balance',
                DB::raw('COALESCE(period_jd.period_debit, 0) as total_debit'),
                DB::raw('COALESCE(period_jd.period_credit, 0) as total_credit')
            )
            ->where('a.is_active', 1)
            ->get()
            ->map(function ($item) use ($cumulative) {
                $start = $cumulative ? (float) $item->initial_migration_balance : 0;

                if ($item->normal_balance === 'Debit') {
                    $item->balance = $start + (float) $item->total_debit - (float) $item->total_credit;
                } else {
                    $item->balance = $start + (float) $item->total_credit - (float) $item->total_debit;
                }

                return $item;
            });
    }
}
