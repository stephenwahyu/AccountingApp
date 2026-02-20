<?php

namespace App\Http\Controllers;

use App\Models\FiscalPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LaporanKeuanganController extends Controller
{
    // public function semua(): Response
    // {
    //     $periods = FiscalPeriod::orderBy('start_date', 'desc')->get(['id', 'period_name', 'start_date', 'end_date']);

    //     return Inertia::render('laporankeuangan/semua', [
    //         'periods' => $periods,
    //     ]);
    // }

    public function posisiKeuangan(): Response
    {
        $periods = FiscalPeriod::orderBy('start_date', 'desc')->get(['id', 'period_name', 'start_date', 'end_date']);

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

        // Ambil data saldo dari account_balances untuk periode ini
        // Jika belum ada (periode baru belum ada mutasi), fallback ke data accounts
        $balances = DB::table('accounts as a')
            ->join('account_categories as ac', 'a.account_category_id', '=', 'ac.id')
            ->join('account_types as at', 'ac.account_type_id', '=', 'at.id')
            ->leftJoin('account_balances as ab', function($join) use ($request) {
                $join->on('a.id', '=', 'ab.account_id')
                     ->where('ab.fiscal_period_id', '=', $request->period_id);
            })
            ->leftJoin(DB::raw("(SELECT jd.account_id, SUM(jd.debit) as period_debit, SUM(jd.credit) as period_credit 
                                FROM journal_details jd 
                                JOIN journal_entries je ON jd.journal_entry_id = je.id 
                                WHERE je.status = 'Posted' AND je.fiscal_period_id = {$request->period_id}
                                GROUP BY jd.account_id) as period_jd"), 'a.id', '=', 'period_jd.account_id')
            ->select(
                'a.id as account_id',
                'a.account_code',
                'a.account_name',
                'at.name as account_type',
                'at.normal_balance',
                DB::raw("COALESCE(ab.beginning_balance, a.initial_balance) as start_balance"),
                DB::raw("COALESCE(period_jd.period_debit, 0) as total_debit"),
                DB::raw("COALESCE(period_jd.period_credit, 0) as total_credit")
            )
            ->where('a.is_active', 1)
            ->get()
            ->map(function($item) {
                if ($item->normal_balance === 'Debit') {
                    $item->balance = $item->start_balance + $item->total_debit - $item->total_credit;
                } else {
                    $item->balance = $item->start_balance + $item->total_credit - $item->total_debit;
                }
                return $item;
            });

        $assets = $balances->where('account_type', 'Aset')->where('balance', '!=', 0);
        $assetsTotal = $assets->sum('balance');

        $liabilities = $balances->where('account_type', 'Liabilitas')->where('balance', '!=', 0);
        $liabilitiesTotal = $liabilities->sum('balance');

        // Hitung Laba Rugi dinamis untuk periode ini
        $netIncomeReport = $this->getLabaRugi($request);
        $netIncome = $netIncomeReport['net_income'];

        $equity = $balances->where('account_type', 'Ekuitas')->where('balance', '!=', 0)->values();
        
        // Tambahkan Laba Tahun Berjalan ke daftar ekuitas
        if ($netIncome != 0) {
            $equity->push((object)[
                'account_id' => null,
                'account_code' => '3-2002',
                'account_name' => 'Laba Tahun Berjalan',
                'balance' => $netIncome
            ]);
        }
        
        $equityTotal = $equity->sum('balance');

        return [
            'period' => $period,
            'assets' => ['accounts' => $assets->values(), 'total' => $assetsTotal],
            'liabilities' => ['accounts' => $liabilities->values(), 'total' => $liabilitiesTotal],
            'equity' => ['accounts' => $equity, 'total' => $equityTotal],
        ];
    }

    public function labaRugi(): Response
    {
        $periods = FiscalPeriod::orderBy('start_date', 'desc')->get(['id', 'period_name', 'start_date', 'end_date']);

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

        $income = DB::table('v_trial_balance')
            ->where('account_type', 'Pendapatan')
            ->where('final_balance', '!=', 0)
            ->get(['account_id', 'account_code', 'account_name', 'final_balance as balance']);
        $incomeTotal = $income->sum('balance');

        $expenses = DB::table('v_trial_balance')
            ->where('account_type', 'Beban')
            ->where('final_balance', '!=', 0)
            ->get(['account_id', 'account_code', 'account_name', 'final_balance as balance']);
        $expensesTotal = $expenses->sum('balance');

        $netIncome = $incomeTotal - $expensesTotal;

        return [
            'period' => $period,
            'income' => ['accounts' => $income, 'total' => $incomeTotal],
            'expenses' => ['accounts' => $expenses, 'total' => $expensesTotal],
            'net_income' => $netIncome,
        ];
    }

    public function arusKas(): Response
    {
        $periods = FiscalPeriod::orderBy('start_date', 'desc')->get(['id', 'period_name', 'start_date', 'end_date']);

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

        // Ambil saldo awal kas dari initial_balance di tabel accounts
        $beginningCashBalance = DB::table('accounts')
            ->where('is_cash_account', 1)
            ->sum('initial_balance');

        $results = [];
        $categories = [
            'operating' => 1,
            'investing' => 2,
            'financing' => 3
        ];

        foreach ($categories as $key => $activityId) {
            $items = DB::table('journal_details as jd')
                ->join('journal_entries as je', 'jd.journal_entry_id', '=', 'je.id')
                ->join('accounts as a', 'jd.account_id', '=', 'a.id')
                ->where('je.status', 'Posted')
                ->where('je.fiscal_period_id', $request->period_id)
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
                ->map(function($item) {
                    return [
                        'description' => $item->description,
                        'inflow' => $item->balance > 0 ? $item->balance : 0,
                        'outflow' => $item->balance < 0 ? abs($item->balance) : 0,
                        'balance' => $item->balance
                    ];
                });

            $results[$key] = [
                'items' => $items,
                'total' => $items->sum('balance')
            ];
        }

        return [
            'period' => $period,
            'operating' => $results['operating'],
            'investing' => $results['investing'],
            'financing' => $results['financing'],
            'beginning_cash' => $beginningCashBalance,
        ];
    }

    public function perubahanEkuitas(): Response
    {
        $periods = FiscalPeriod::orderBy('start_date', 'desc')->get(['id', 'period_name', 'start_date', 'end_date']);

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

        // Ambil saldo awal ekuitas dari initial_balance di tabel accounts
        $beginningBalance = DB::table('accounts')
            ->join('account_categories', 'accounts.account_category_id', '=', 'account_categories.id')
            ->join('account_types', 'account_categories.account_type_id', '=', 'account_types.id')
            ->where('account_types.name', 'Ekuitas')
            ->sum('accounts.initial_balance');

        // Ambil Laba Rugi untuk periode ini
        $netIncomeReport = $this->getLabaRugi($request);
        $netIncome = $netIncomeReport['net_income'];

        // Ambil mutasi ekuitas lainnya (misal Prive atau Dividen) dari jurnal
        $otherChanges = DB::table('v_trial_balance')
            ->where('account_type', 'Ekuitas')
            ->where('account_code', 'NOT LIKE', '3-2001') // Bukan Laba Ditahan
            ->where('account_code', 'NOT LIKE', '3-2002') // Bukan Laba Tahun Berjalan
            ->get()
            ->sum(function($item) {
                return $item->final_balance - $item->beginning_balance;
            });

        $endingBalance = $beginningBalance + $netIncome + $otherChanges;

        return [
            'period' => $period,
            'beginning_balance' => ['total' => $beginningBalance],
            'changes' => [
                'net_income' => $netIncome,
                'others' => $otherChanges
            ],
            'ending_balance' => ['total' => $endingBalance],
        ];
    }
}
