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

        $assets = DB::table('v_trial_balance')
            ->where('account_type', 'Aset')
            ->where('final_balance', '>', 0)
            ->get(['account_id', 'account_code', 'account_name', 'final_balance as balance']);
        $assetsTotal = $assets->sum('balance');

        $liabilities = DB::table('v_trial_balance')
            ->where('account_type', 'Liabilitas')
            ->where('final_balance', '>', 0)
            ->get(['account_id', 'account_code', 'account_name', 'final_balance as balance']);
        $liabilitiesTotal = $liabilities->sum('balance');

        $equity = DB::table('v_trial_balance')
            ->where('account_type', 'Ekuitas')
            ->where('final_balance', '>', 0)
            ->get(['account_id', 'account_code', 'account_name', 'final_balance as balance']);
        $equityTotal = $equity->sum('balance');

        return [
            'period' => $period,
            'assets' => ['accounts' => $assets, 'total' => $assetsTotal],
            'liabilities' => ['accounts' => $liabilities, 'total' => $liabilitiesTotal],
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
            ->where('final_balance', '>', 0)
            ->get(['account_id', 'account_code', 'account_name', 'final_balance as balance']);
        $incomeTotal = $income->sum('balance');

        $expenses = DB::table('v_trial_balance')
            ->where('account_type', 'Beban')
            ->where('final_balance', '>', 0)
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

        // Simplified, needs proper implementation
        $operatingItems = [
            ['description' => 'Penerimaan dari Pelanggan', 'inflow' => 150000, 'outflow' => 0, 'balance' => 150000],
            ['description' => 'Pembayaran ke Supplier', 'inflow' => 0, 'outflow' => 80000, 'balance' => -80000],
        ];
        $investingItems = [['description' => 'Pembelian Aset Tetap', 'inflow' => 0, 'outflow' => 50000, 'balance' => -50000]];
        $financingItems = [['description' => 'Penerimaan Pinjaman', 'inflow' => 100000, 'outflow' => 0, 'balance' => 100000]];

        return [
            'period' => $period,
            'operating' => ['items' => $operatingItems, 'total' => collect($operatingItems)->sum('balance')],
            'investing' => ['items' => $investingItems, 'total' => collect($investingItems)->sum('balance')],
            'financing' => ['items' => $financingItems, 'total' => collect($financingItems)->sum('balance')],
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

        // Simplified, needs proper implementation
        $beginningBalance = 500000;
        $netIncome = 150000; // This should be calculated from getLabaRugi
        $endingBalance = $beginningBalance + $netIncome;

        return [
            'period' => $period,
            'beginning_balance' => ['total' => $beginningBalance],
            'changes' => ['net_income' => $netIncome],
            'ending_balance' => ['total' => $endingBalance],
        ];
    }
}
