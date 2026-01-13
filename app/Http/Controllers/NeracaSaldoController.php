<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\FiscalPeriod;
use App\Models\JournalDetail;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NeracaSaldoController extends Controller
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
        $periods = $periodsCollection->sortBy(function ($period) use ($getTypeWeight) {
            $endDateKey = Carbon::parse($period->end_date)->format('Ymd');
            $typeWeight = $getTypeWeight($period->period_type);

            return "{$endDateKey}{$typeWeight}";
        })->reverse()->values();

        $selectedPeriodId = $request->input('period');
        if (! $selectedPeriodId) {
            $selectedPeriodId = $periods->first()->id ?? null;
        }

        $accountsData = Account::with('accountCategory.accountType')
            ->orderBy('account_code')
            ->get();

        $openingMovements = $this->getOpeningMovements($selectedPeriodId);
        $periodMovements = $this->getPeriodMovements($selectedPeriodId);

        $accounts = $this->buildAccountHierarchy($accountsData, $openingMovements, $periodMovements);

        $totals = [
            'opening_debit' => $accounts->sum('opening_debit'),
            'opening_credit' => $accounts->sum('opening_credit'),
            'debit_movement' => $accounts->sum('debit_movement'),
            'credit_movement' => $accounts->sum('credit_movement'),
            'closing_debit' => $accounts->sum('closing_debit'),
            'closing_credit' => $accounts->sum('closing_credit'),
        ];

        return Inertia::render('neracasaldo/neracasaldo', [
            'accounts' => $accounts,
            'periods' => $periods,
            'selectedPeriod' => $selectedPeriodId,
            'totals' => $totals,
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

    private function buildAccountHierarchy($accounts, $openingMovements, $periodMovements, $parentId = null)
    {
        $hierarchy = collect();

        foreach ($accounts->where('parent_id', $parentId) as $account) {
            $isCreditNormal = $account->accountCategory->accountType->normal_balance === 'credit';

            $openingMovement = $openingMovements->get($account->id);
            $periodMovement = $periodMovements->get($account->id);

            $agg = [
                'initial' => (string) ($account->initial_balance ?? 0),
                'opening_debit' => (string) ($openingMovement->total_debit ?? 0),
                'opening_credit' => (string) ($openingMovement->total_credit ?? 0),
                'period_debit' => (string) ($periodMovement->total_debit ?? 0),
                'period_credit' => (string) ($periodMovement->total_credit ?? 0),
            ];

            $children = $this->buildAccountHierarchy($accounts, $openingMovements, $periodMovements, $account->id);
            foreach ($children as $child) {
                $agg['initial'] = bcadd($agg['initial'], (string) $child['initial_raw'], 2);
                $agg['opening_debit'] = bcadd($agg['opening_debit'], (string) $child['opening_debit_raw'], 2);
                $agg['opening_credit'] = bcadd($agg['opening_credit'], (string) $child['opening_credit_raw'], 2);
                $agg['period_debit'] = bcadd($agg['period_debit'], (string) $child['debit_movement'], 2);
                $agg['period_credit'] = bcadd($agg['period_credit'], (string) $child['credit_movement'], 2);
            }

            // Calculate Balances
            $openingBalance = $isCreditNormal
                ? bcadd(bcadd($agg['initial'], $agg['opening_credit'], 2), bcmul($agg['opening_debit'], (string) -1, 2), 2)
                : bcadd(bcadd($agg['initial'], $agg['opening_debit'], 2), bcmul($agg['opening_credit'], (string) -1, 2), 2);

            $closingBalance = $isCreditNormal
                ? bcadd(bcadd($openingBalance, $agg['period_credit'], 2), bcmul($agg['period_debit'], (string) -1, 2), 2)
                : bcadd(bcadd($openingBalance, $agg['period_debit'], 2), bcmul($agg['period_credit'], (string) -1, 2), 2);

            // Split balances into debit/credit columns
            $opening_debit = '0.00';
            $opening_credit = '0.00';
            $closing_debit = '0.00';
            $closing_credit = '0.00';

            if ($isCreditNormal) {
                if (bccomp($openingBalance, '0', 2) >= 0) { // openingBalance >= 0
                    $opening_credit = $openingBalance;
                } else { // openingBalance < 0
                    $opening_debit = bcmul($openingBalance, (string) -1, 2);
                }
                if (bccomp($closingBalance, '0', 2) >= 0) { // closingBalance >= 0
                    $closing_credit = $closingBalance;
                } else { // closingBalance < 0
                    $closing_debit = bcmul($closingBalance, (string) -1, 2);
                }
            } else { // Debit Normal
                if (bccomp($openingBalance, '0', 2) >= 0) { // openingBalance >= 0
                    $opening_debit = $openingBalance;
                } else { // openingBalance < 0
                    $opening_credit = bcmul($openingBalance, (string) -1, 2);
                }
                if (bccomp($closingBalance, '0', 2) >= 0) { // closingBalance >= 0
                    $closing_debit = $closingBalance;
                } else { // closingBalance < 0
                    $closing_credit = bcmul($closingBalance, (string) -1, 2);
                }
            }

            $hierarchy->push([
                'account_id' => $account->id,
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,

                'initial_raw' => $agg['initial'],
                'opening_debit_raw' => $agg['opening_debit'],
                'opening_credit_raw' => $agg['opening_credit'],

                'opening_debit' => $opening_debit,
                'opening_credit' => $opening_credit,
                'debit_movement' => $agg['period_debit'],
                'credit_movement' => $agg['period_credit'],
                'closing_debit' => $closing_debit,
                'closing_credit' => $closing_credit,

                'children' => $children,
            ]);
        }

        return $hierarchy;
    }

    public function export(Request $request)
    {
        $selectedPeriodId = $request->input('period');
        $period = $selectedPeriodId ? FiscalPeriod::find($selectedPeriodId) : null;

        $accountsData = Account::with('accountCategory.accountType')
            ->orderBy('account_code')
            ->get();

        $openingMovements = $this->getOpeningMovements($selectedPeriodId);
        $periodMovements = $this->getPeriodMovements($selectedPeriodId);

        $accounts = $this->buildAccountHierarchy($accountsData, $openingMovements, $periodMovements);

        $totals = [
            'opening_debit' => $accounts->sum('opening_debit'),
            'opening_credit' => $accounts->sum('opening_credit'),
            'debit_movement' => $accounts->sum('debit_movement'),
            'credit_movement' => $accounts->sum('credit_movement'),
            'closing_debit' => $accounts->sum('closing_debit'),
            'closing_credit' => $accounts->sum('closing_credit'),
        ];

        $data = [
            'accounts' => $accounts,
            'totals' => $totals,
            'periodName' => $period ? $period->period_name : 'Semua Periode',
            'companyName' => config('app.name', 'Akuntansiku'),
        ];

        $pdf = Pdf::loadView('pdf.neraca-saldo', $data);
        $filename = 'neraca-saldo-'.($period ? str_replace(' ', '-', strtolower($period->period_name)) : 'semua').'.pdf';

        return $pdf->download($filename);
    }
}
