<?php

namespace App\Http\Controllers;

use App\Models\FiscalPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LaporanKeuanganController extends Controller
{
    public function semua(): Response
    {
        $periods = FiscalPeriod::orderBy('end_date', 'desc')
            ->orderByRaw("FIELD(period_type, 'annually', 'quarterly', 'monthly') ASC")
            ->get(['id', 'period_name', 'start_date', 'end_date', 'status']);

        return Inertia::render('laporankeuangan/semua', [
            'periods' => $periods,
        ]);
    }

    public function posisiKeuangan(): Response
    {
        $periods = FiscalPeriod::orderBy('end_date', 'desc')
            ->orderByRaw("FIELD(period_type, 'annually', 'quarterly', 'monthly') ASC")
            ->get(['id', 'period_name', 'start_date', 'end_date', 'status']);

        return Inertia::render('laporankeuangan/posisikeuangan', [
            'periods' => $periods,
        ]);
    }

    public function showPosisiKeuangan(Request $request, $id): Response
    {
        $request->merge(['period_id' => $id]);
        $report = $this->getPosisiKeuangan($request);

        return Inertia::render('laporankeuangan/view/posisikeuangan', [
            'report' => $report,
        ]);
    }

    public function getPosisiKeuangan(Request $request)
    {
        $period = FiscalPeriod::findOrFail($request->period_id);

        // Fetch balances logic
        $balances = $this->calculateBalancesForPeriod($period);

        // Define a function to group by category
        $groupByCategory = function ($typeBalances) {
            return $typeBalances->groupBy('category_name')->map(function ($items, $categoryName) {
                return [
                    'category_name' => $categoryName,
                    'accounts' => $items->values()->map(fn($item) => (array) $item)->toArray(),
                    'total' => $items->sum('balance')
                ];
            })->values()->toArray();
        };

        // Assets
        $assetsBalances = $balances->where('account_type', 'Aset')->where('balance', '!=', 0);
        $assetsGrouped = $groupByCategory($assetsBalances);
        $assetsTotal = $assetsBalances->sum('balance');

        // Liabilities
        $liabilitiesBalances = $balances->where('account_type', 'Liabilitas')->where('balance', '!=', 0);
        $liabilitiesGrouped = $groupByCategory($liabilitiesBalances);
        $liabilitiesTotal = $liabilitiesBalances->sum('balance');

        // Equity Calculation
        $cumulativeNetIncome = $this->calculateCumulativeNetIncome($period);
        $equityBalances = $balances->where('account_type', 'Ekuitas')->where('balance', '!=', 0);
        $equityGrouped = $groupByCategory($equityBalances);
        
        // Handle Net Income separately if not 0
        if ($cumulativeNetIncome != 0) {
            $found = false;
            foreach ($equityGrouped as &$group) {
                if ($group['category_name'] === 'Laba (Rugi)' || $group['category_name'] === 'Modal') {
                    $group['accounts'][] = [
                        'account_id' => null,
                        'account_code' => '3-2002',
                        'account_name' => 'Laba Tahun Berjalan',
                        'balance' => (float) $cumulativeNetIncome,
                    ];
                    $group['total'] += (float) $cumulativeNetIncome;
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $equityGrouped[] = [
                    'category_name' => 'Laba (Rugi)',
                    'accounts' => [[
                        'account_id' => null,
                        'account_code' => '3-2002',
                        'account_name' => 'Laba Tahun Berjalan',
                        'balance' => (float) $cumulativeNetIncome,
                    ]],
                    'total' => (float) $cumulativeNetIncome
                ];
            }
        }

        $equityTotal = collect($equityGrouped)->sum('total');

        return [
            'period' => $period->toArray(),
            'assets' => [
                'categories' => $assetsGrouped,
                'total' => $assetsTotal
            ],
            'liabilities' => [
                'categories' => $liabilitiesGrouped,
                'total' => $liabilitiesTotal
            ],
            'equity' => [
                'categories' => $equityGrouped,
                'total' => $equityTotal
            ],
        ];
    }

    private function calculateBalancesForPeriod($period)
    {
        // Try to get snapshots first
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
            return $snapshotBalances->map(function ($item) {
                if ($item->normal_balance === 'Debit') {
                    $item->balance = (float) $item->raw_ending_balance;
                } else {
                    $item->balance = (float) $item->start_balance + (float) $item->total_credit - (float) $item->total_debit;
                }
                return $item;
            });
        }

        // Fallback to live calculation
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
                'a.account_code',
                'a.account_name',
                'at.name as account_type',
                'at.normal_balance',
                'ac.id as category_id',
                'ac.name as category_name',
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

    public function labaRugi(): Response
    {
        $periods = FiscalPeriod::orderBy('end_date', 'desc')
            ->orderByRaw("FIELD(period_type, 'annually', 'quarterly', 'monthly') ASC")
            ->get(['id', 'period_name', 'start_date', 'end_date', 'status']);

        return Inertia::render('laporankeuangan/labarugi', [
            'periods' => $periods,
        ]);
    }

    public function showLabaRugi(Request $request, $id): Response
    {
        $request->merge(['period_id' => $id]);
        $report = $this->getLabaRugi($request);

        return Inertia::render('laporankeuangan/view/labarugi', [
            'report' => $report,
        ]);
    }

    public function getLabaRugi(Request $request)
    {
        $period = FiscalPeriod::findOrFail($request->period_id);
        $balances = $this->calculateBalancesForPeriod($period);

        // Helper to get group data
        $getGroup = function ($categoryNames) use ($balances) {
            $names = is_array($categoryNames) ? $categoryNames : [$categoryNames];
            $items = $balances->whereIn('category_name', $names)->where('balance', '!=', 0);
            return [
                'categories' => $items->groupBy('category_name')->map(function ($accounts, $name) {
                    return [
                        'category_name' => $name,
                        'accounts' => $accounts->values()->map(fn($a) => (array)$a)->toArray(),
                        'total' => $accounts->sum('balance')
                    ];
                })->values()->toArray(),
                'total' => $items->sum('balance')
            ];
        };

        // 1. Pendapatan Usaha (Category ID 7)
        $sales = $getGroup('Pendapatan Usaha');

        // 2. Harga Pokok Penjualan (Category ID 9)
        $cogs = $getGroup('Harga Pokok Penjualan');

        // 3. Laba Kotor
        $grossProfit = $sales['total'] - $cogs['total'];

        // 4. Beban Operasional (Category ID 10 & 11)
        $operatingExpenses = $getGroup(['Beban Penjualan', 'Beban Administrasi & Umum']);

        // 5. Laba Operasional
        $operatingProfit = $grossProfit - $operatingExpenses['total'];

        // 6. Pendapatan & Beban Lain-lain (Category ID 8 & 12)
        $otherIncome = $getGroup('Pendapatan Lain-Lain');
        $otherExpenses = $getGroup('Beban Lain-Lain');
        
        $otherNet = $otherIncome['total'] - $otherExpenses['total'];

        // 7. Laba Bersih
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
                'net' => $otherNet
            ],
            'net_income' => $netIncome,
        ];
    }

    public function arusKas(): Response
    {
        $periods = FiscalPeriod::orderBy('end_date', 'desc')
            ->orderByRaw("FIELD(period_type, 'annually', 'quarterly', 'monthly') ASC")
            ->get(['id', 'period_name', 'start_date', 'end_date', 'status']);

        return Inertia::render('laporankeuangan/aruskas', [
            'periods' => $periods,
        ]);
    }

    public function showArusKas(Request $request, $id): Response
    {
        $request->merge(['period_id' => $id]);
        $report = $this->getArusKas($request);

        return Inertia::render('laporankeuangan/view/aruskas', [
            'report' => $report,
        ]);
    }

    public function getArusKas(Request $request)
    {
        $period = FiscalPeriod::findOrFail($request->period_id);

        $beginningCashBalance = DB::table('accounts')
            ->where('is_cash_account', 1)
            ->sum('initial_balance');

        // Tambahkan mutasi kas dari awal sistem sampai sebelum tanggal mulai periode ini
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

    public function perubahanEkuitas(): Response
    {
        $periods = FiscalPeriod::orderBy('end_date', 'desc')
            ->orderByRaw("FIELD(period_type, 'annually', 'quarterly', 'monthly') ASC")
            ->get(['id', 'period_name', 'start_date', 'end_date', 'status']);

        return Inertia::render('laporankeuangan/perubahanekuitas', [
            'periods' => $periods,
        ]);
    }

    public function showPerubahanEkuitas(Request $request, $id): Response
    {
        $request->merge(['period_id' => $id]);
        $report = $this->getPerubahanEkuitas($request);

        return Inertia::render('laporankeuangan/view/perubahanekuitas', [
            'report' => $report,
        ]);
    }

    public function getPerubahanEkuitas(Request $request)
    {
        $period = FiscalPeriod::findOrFail($request->period_id);

        // Saldo awal migrasi
        $initialMigrationBalance = DB::table('accounts')
            ->join('account_categories as ac', 'accounts.account_category_id', '=', 'ac.id')
            ->join('account_types as at', 'ac.account_type_id', '=', 'at.id')
            ->where('at.name', 'Ekuitas')
            ->sum('accounts.initial_balance');

        // Mutasi ekuitas (Posted) dari awal sampai SEBELUM periode ini
        $previousEquityMutation = DB::table('journal_details as jd')
            ->join('journal_entries as je', 'jd.journal_entry_id', '=', 'je.id')
            ->join('accounts as a', 'jd.account_id', '=', 'a.id')
            ->join('account_categories as ac', 'a.account_category_id', '=', 'ac.id')
            ->join('account_types as at', 'ac.account_type_id', '=', 'at.id')
            ->where('je.status', 'Posted')
            ->where('at.name', 'Ekuitas')
            ->where('je.entry_date', '<', $period->start_date)
            ->sum(DB::raw('jd.credit - jd.debit'));

        $beginningBalance = $initialMigrationBalance + $previousEquityMutation;

        // Laba Rugi periode ini
        $netIncomeReport = $this->getLabaRugi($request);
        $netIncome = $netIncomeReport['net_income'];

        // Mutasi ekuitas lainnya (Prive/Dividen/Modal Tambahan) dalam periode ini
        $otherChanges = DB::table('journal_details as jd')
            ->join('journal_entries as je', 'jd.journal_entry_id', '=', 'je.id')
            ->join('accounts as a', 'jd.account_id', '=', 'a.id')
            ->join('account_categories as ac', 'a.account_category_id', '=', 'ac.id')
            ->join('account_types as at', 'ac.account_type_id', '=', 'at.id')
            ->where('je.status', 'Posted')
            ->where('at.name', 'Ekuitas')
            ->where('a.account_code', 'NOT LIKE', '3-2001') // Bukan Laba Ditahan (karena laba ditahan adalah saldo awal)
            ->where('a.account_code', 'NOT LIKE', '3-2002') // Bukan Laba Tahun Berjalan (karena dihitung terpisah)
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
}
