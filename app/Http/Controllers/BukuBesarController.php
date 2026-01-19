<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\FiscalPeriod;
use App\Models\JournalDetail;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BukuBesarController extends Controller
{
    public function index(Request $request)
    {
        $accounts = Account::orderBy('account_code')->get();
        $periods = $this->getPeriods();

        $selectedAccountId = $request->input('account');
        $selectedPeriodId = $request->input('period');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if (! $selectedPeriodId && $periods->isNotEmpty()) {
            $selectedPeriodId = $periods->first()->id;
        }

        $transactions = collect();
        $openingBalance = 0;
        $totalDebit = 0;
        $totalCredit = 0;
        $endingBalance = 0;
        $selectedAccount = null;
        $period = null;

        if ($selectedPeriodId) {
            $period = FiscalPeriod::find($selectedPeriodId);
        }

        if ($selectedAccountId && $period) {
            $selectedAccount = Account::with('accountCategory.accountType')->find($selectedAccountId);

            $calculationStartDate = $startDate ? Carbon::parse($startDate) : Carbon::parse($period->start_date);

            $openingBalance = $this->calculateOpeningBalance($selectedAccount, $calculationStartDate);
            $transactions = $this->getTransactions($selectedAccount, $calculationStartDate, $endDate ? Carbon::parse($endDate) : Carbon::parse($period->end_date));

            $totalDebit = (float) $transactions->sum('debit');
            $totalCredit = (float) $transactions->sum('credit');

            $normalBalance = $selectedAccount->accountCategory->accountType->normal_balance;
            if ($normalBalance === 'Debit') {
                $endingBalance = $openingBalance + $totalDebit - $totalCredit;
            } else {
                $endingBalance = $openingBalance + $totalCredit - $totalDebit;
            }
        }

        return Inertia::render('bukubesar/bukubesar', [
            'transactions' => $transactions,
            'accounts' => $accounts,
            'periods' => $periods,
            'selectedAccount' => $selectedAccount ? [
                'id' => $selectedAccount->id,
                'account_name' => $selectedAccount->account_name,
                'account_code' => $selectedAccount->account_code,
                'normal_balance' => $selectedAccount->accountCategory->accountType->normal_balance,
            ] : null,
            'selectedPeriod' => $selectedPeriodId,
            'initialFilters' => $request->only(['account', 'period', 'start_date', 'end_date']),
            'openingBalance' => $openingBalance,
            'totalDebit' => $totalDebit,
            'totalCredit' => $totalCredit,
            'endingBalance' => $endingBalance,
        ]);
    }

    private function getPeriods()
    {
        $periodsCollection = FiscalPeriod::get();
        $getTypeWeight = fn ($type) => match ($type) {
            'monthly' => 1,
            'quarterly' => 2,
            'annually' => 3,
            default => 4,
        };

        return $periodsCollection->sortBy(function ($period) use ($getTypeWeight) {
            $endDateKey = Carbon::parse($period->end_date)->format('Ymd');
            $typeWeight = $getTypeWeight($period->period_type);

            return "{$endDateKey}{$typeWeight}";
        })->reverse()->values();
    }

    private function calculateOpeningBalance(Account $account, Carbon $startDate)
    {
        $openingBalanceQuery = JournalDetail::join('journal_entries', 'journal_details.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_details.account_id', $account->id)
            ->where('journal_entries.status', 'Posted')
            ->where('journal_entries.entry_date', '<', $startDate);

        $openingDebits = (float) $openingBalanceQuery->clone()->sum('journal_details.debit');
        $openingCredits = (float) $openingBalanceQuery->sum('journal_details.credit');

        $openingBalance = (float) $account->initial_balance;
        $normalBalance = $account->accountCategory->accountType->normal_balance;

        if ($normalBalance === 'Debit') {
            return $openingBalance + $openingDebits - $openingCredits;
        }

        return $openingBalance + $openingCredits - $openingDebits;
    }

    private function getTransactions(Account $account, Carbon $startDate, Carbon $endDate)
    {
        $query = JournalDetail::with(['journalEntry'])
            ->join('journal_entries', 'journal_details.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_details.account_id', $account->id)
            ->where('journal_entries.status', 'Posted')
            ->whereBetween('journal_entries.entry_date', [$startDate, $endDate])
            ->select('journal_details.*');

        return $query
            ->orderBy('journal_entries.entry_date')
            ->orderBy('journal_details.created_at')
            ->get()
            ->map(function ($detail) {
                return [
                    'id' => $detail->id,
                    'entry_number' => $detail->journalEntry->entry_number,
                    'entry_date' => $detail->journalEntry->entry_date->format('d/m/Y'),
                    'journal_type' => $detail->journalEntry->journal_type,
                    'debit' => (float) $detail->debit,
                    'credit' => (float) $detail->credit,
                    'detail_description' => $detail->description,
                    'journal_description' => $detail->journalEntry->description,
                ];
            });
    }

    public function export(Request $request)
    {
        $selectedAccountId = $request->input('account');
        $selectedPeriodId = $request->input('period');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if (! $selectedAccountId) {
            abort(400, 'Account not selected');
        }

        $account = Account::with('accountCategory.accountType')->findOrFail($selectedAccountId);
        $period = $selectedPeriodId ? FiscalPeriod::find($selectedPeriodId) : null;

        if (!$period) {
            abort(400, 'Fiscal period not found.');
        }

        $calculationStartDate = $startDate ? Carbon::parse($startDate) : Carbon::parse($period->start_date);
        $calculationEndDate = $endDate ? Carbon::parse($endDate) : Carbon::parse($period->end_date);

        // Get normal balance type
        $normalBalance = $account->accountCategory->accountType->normal_balance;

        // Opening Balance
        $openingBalance = $this->calculateOpeningBalance($account, $calculationStartDate);
        
        // Transactions
        $transactions = $this->getTransactions($account, $calculationStartDate, $calculationEndDate);

        $totalDebit = (float) $transactions->sum('debit');
        $totalCredit = (float) $transactions->sum('credit');

        // Hitung ending balance
        if ($normalBalance === 'Debit') {
            $endingBalance = $openingBalance + $totalDebit - $totalCredit;
        } else {
            $endingBalance = $openingBalance + $totalCredit - $totalDebit;
        }

        $data = [
            'account' => (object) [
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'normal_balance' => $normalBalance,
            ],
            'transactions' => $transactions,
            'openingBalance' => $openingBalance,
            'totalDebit' => $totalDebit,
            'totalCredit' => $totalCredit,
            'endingBalance' => $endingBalance,
            'periodName' => $period->period_name,
            'companyName' => config('app.name', 'Akuntansiku'),
            'dateRange' => $calculationStartDate->format('d/m/Y').' - '.$calculationEndDate->format('d/m/Y'),
        ];

        $pdf = Pdf::loadView('pdf.buku-besar', $data);
        $filename = 'buku-besar-'.str_replace(' ', '-', strtolower($account->account_name)).'.pdf';

        return $pdf->download($filename);
    }
}

