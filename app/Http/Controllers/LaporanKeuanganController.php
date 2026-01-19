<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\FiscalPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LaporanKeuanganController extends Controller
{
    public function index(Request $request): Response
    {
        $periods = FiscalPeriod::orderBy('start_date', 'desc')->get(['id', 'period_name', 'start_date', 'end_date']);

        return Inertia::render('laporankeuangan/index', [
            'periods' => $periods,
        ]);
    }

    // Posisi Keuangan (Neraca)
    public function posisiKeuangan(Request $request)
    {
        $period = FiscalPeriod::findOrFail($request->period_id);

        // Get Assets (Aset - Type 1)
        $assets = DB::table('v_trial_balance')
            ->where('account_type', 'Aset')
            ->where('final_balance', '>', 0)
            ->get(['account_id', 'account_code', 'account_name', 'final_balance as balance']);

        $assetsTotal = $assets->sum('balance');

        // Get Liabilities (Liabilitas - Type 2)
        $liabilities = DB::table('v_trial_balance')
            ->where('account_type', 'Liabilitas')
            ->where('final_balance', '>', 0)
            ->get(['account_id', 'account_code', 'account_name', 'final_balance as balance']);

        $liabilitiesTotal = $liabilities->sum('balance');

        // Get Equity (Ekuitas - Type 3)
        $equity = DB::table('v_trial_balance')
            ->where('account_type', 'Ekuitas')
            ->where('final_balance', '>', 0)
            ->get(['account_id', 'account_code', 'account_name', 'final_balance as balance']);

        $equityTotal = $equity->sum('balance');

        return response()->json([
            'report' => [
                'period' => $period,
                'assets' => [
                    'accounts' => $assets,
                    'total' => $assetsTotal,
                ],
                'liabilities' => [
                    'accounts' => $liabilities,
                    'total' => $liabilitiesTotal,
                ],
                'equity' => [
                    'accounts' => $equity,
                    'total' => $equityTotal,
                ],
            ],
        ]);
    }

    // Laba Rugi
    public function labaRugi(Request $request)
    {
        $period = FiscalPeriod::findOrFail($request->period_id);
        
        // Get Income (Pendapatan - Type 4)
        $income = DB::table('v_trial_balance')
            ->where('account_type', 'Pendapatan')
            ->where('final_balance', '>', 0)
            ->get(['account_id', 'account_code', 'account_name', 'final_balance as balance']);

        $incomeTotal = $income->sum('balance');

        // Get Expenses (Beban - Type 5)
        $expenses = DB::table('v_trial_balance')
            ->where('account_type', 'Beban')
            ->where('final_balance', '>', 0)
            ->get(['account_id', 'account_code', 'account_name', 'final_balance as balance']);

        $expensesTotal = $expenses->sum('balance');

        $netIncome = $incomeTotal - $expensesTotal;

        return response()->json([
            'report' => [
                'period' => $period,
                'income' => [
                    'accounts' => $income,
                    'total' => $incomeTotal,
                ],
                'expenses' => [
                    'accounts' => $expenses,
                    'total' => $expensesTotal,
                ],
                'net_income' => $netIncome,
            ],
        ]);
    }

    // Arus Kas
    public function arusKas(Request $request)
    {
        $period = FiscalPeriod::findOrFail($request->period_id);

        // Simplified cash flow calculation
        // In a real system, this would be more complex and based on actual cash transactions
        
        // Operating Activities
        $operatingItems = [
            ['description' => 'Penerimaan dari Pelanggan', 'inflow' => 150000, 'outflow' => 0, 'balance' => 150000],
            ['description' => 'Pembayaran ke Supplier', 'inflow' => 0, 'outflow' => 80000, 'balance' => -80000],
        ];
        $operatingTotal = collect($operatingItems)->sum('balance');

        // Investing Activities
        $investingItems = [
            ['description' => 'Pembelian Aset Tetap', 'inflow' => 0, 'outflow' => 50000, 'balance' => -50000],
        ];
        $investingTotal = collect($investingItems)->sum('balance');

        // Financing Activities
        $financingItems = [
            ['description' => 'Penerimaan Pinjaman', 'inflow' => 100000, 'outflow' => 0, 'balance' => 100000],
        ];
        $financingTotal = collect($financingItems)->sum('balance');

        return response()->json([
            'report' => [
                'period' => $period,
                'operating' => [
                    'items' => $operatingItems,
                    'total' => $operatingTotal,
                ],
                'investing' => [
                    'items' => $investingItems,
                    'total' => $investingTotal,
                ],
                'financing' => [
                    'items' => $financingItems,
                    'total' => $financingTotal,
                ],
            ],
        ]);
    }

    // Perubahan Ekuitas
    public function perubahanEkuitas(Request $request)
    {
        $period = FiscalPeriod::findOrFail($request->period_id);

        // Simplified equity change calculation
        // In a real system, this would track actual equity changes

        $beginningBalanceItems = [
            [
                'id' => 1,
                'period_name' => $period->period_name,
                'start_date' => $period->start_date,
                'end_date' => $period->end_date,
                'balance' => 500000,
            ],
        ];
        $beginningBalanceTotal = collect($beginningBalanceItems)->sum('balance');

        $changesItems = [
            [
                'id' => 1,
                'period_name' => $period->period_name,
                'start_date' => $period->start_date,
                'end_date' => $period->end_date,
                'balance' => 150000,
            ],
        ];
        $changesTotal = collect($changesItems)->sum('balance');

        $endingBalanceItems = [
            [
                'id' => 1,
                'period_name' => $period->period_name,
                'start_date' => $period->start_date,
                'end_date' => $period->end_date,
                'balance' => $beginningBalanceTotal + $changesTotal,
            ],
        ];
        $endingBalanceTotal = collect($endingBalanceItems)->sum('balance');

        return response()->json([
            'report' => [
                'period' => $period,
                'beginning_balance' => [
                    'items' => $beginningBalanceItems,
                    'total' => $beginningBalanceTotal,
                ],
                'changes' => [
                    'items' => $changesItems,
                    'total' => $changesTotal,
                ],
                'ending_balance' => [
                    'items' => $endingBalanceItems,
                    'total' => $endingBalanceTotal,
                ],
            ],
        ]);
    }
}
