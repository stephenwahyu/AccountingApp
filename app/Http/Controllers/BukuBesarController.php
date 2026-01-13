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

        if (! $selectedPeriodId || $selectedPeriodId === 'all') {
            $latestPeriod = FiscalPeriod::orderByDesc('end_date')->first();
            $selectedPeriodId = $latestPeriod ? $latestPeriod->id : null;
        }

        $transactions = collect();
        $openingBalance = 0;
        $totalDebit = 0;
        $totalCredit = 0;
        $endingBalance = 0;
        $selectedAccount = null;

        if ($selectedAccountId && $selectedAccountId !== 'all') {
            $selectedAccount = Account::with('accountCategory.accountType')->find($selectedAccountId);
            $period = $selectedPeriodId && $selectedPeriodId !== 'all'
                ? FiscalPeriod::find($selectedPeriodId)
                : null;

            $openingBalance = $this->calculateOpeningBalance($selectedAccount, $period);
            $transactions = $this->getTransactions($selectedAccount, $period);

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

    private function calculateOpeningBalance(Account $account, ?FiscalPeriod $period)
    {
        $openingBalanceQuery = JournalDetail::join('journal_entries', 'journal_details.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_details.account_id', $account->id)
            ->where('journal_entries.status', 'Posted');

        if ($period) {
            $openingBalanceQuery->where('journal_entries.entry_date', '<', $period->start_date);
        }

        $openingDebits = (float) $openingBalanceQuery->clone()->sum('journal_details.debit');
        $openingCredits = (float) $openingBalanceQuery->sum('journal_details.credit');

        $openingBalance = (float) $account->initial_balance;
        $normalBalance = $account->accountCategory->accountType->normal_balance;

        if ($normalBalance === 'Debit') {
            return $openingBalance + $openingDebits - $openingCredits;
        }

        return $openingBalance + $openingCredits - $openingDebits;
    }

    private function getTransactions(Account $account, ?FiscalPeriod $period)
    {
        $query = JournalDetail::with(['journalEntry'])
            ->join('journal_entries', 'journal_details.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_details.account_id', $account->id)
            ->where('journal_entries.status', 'Posted')
            ->select('journal_details.*');

        if ($period) {
            $query->whereBetween('journal_entries.entry_date', [$period->start_date, $period->end_date]);
        }

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

        if (! $selectedAccountId || $selectedAccountId === 'all') {
            abort(400, 'Account not selected');
        }

        // If no period or 'all' is selected, default to the latest fiscal period
        if (! $selectedPeriodId || $selectedPeriodId === 'all') {
            $latestPeriod = FiscalPeriod::orderByDesc('end_date')->first();
            if ($latestPeriod) {
                $selectedPeriodId = $latestPeriod->id;
            } else {
                abort(400, 'No fiscal periods available for export.');
            }
        }

        $account = Account::with('accountCategory.accountType')->findOrFail($selectedAccountId);
        $period = ($selectedPeriodId && $selectedPeriodId !== 'all')
            ? FiscalPeriod::find($selectedPeriodId)
            : null;

        // Get normal balance type
        $normalBalance = $account->accountCategory->accountType->normal_balance;

        // Opening Balance
        $openingBalanceQuery = JournalDetail::join('journal_entries', 'journal_details.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_details.account_id', $selectedAccountId)
            ->where('journal_entries.status', 'Posted')
            ->when($period, fn ($q) => $q->where('journal_entries.entry_date', '<', $period->start_date));

        $openingDebits = (float) $openingBalanceQuery->clone()->sum('journal_details.debit');
        $openingCredits = (float) $openingBalanceQuery->sum('journal_details.credit');

        $openingBalance = (float) $account->initial_balance;

        if ($normalBalance === 'Debit') {
            // Untuk akun DEBIT: initial + debit - credit
            $openingBalance = $openingBalance + $openingDebits - $openingCredits;
        } else {
            // Untuk akun KREDIT: initial + credit - debit
            $openingBalance = $openingBalance + $openingCredits - $openingDebits;
        }

        // Transactions
        $transactionsQuery = JournalDetail::with('journalEntry')
            ->join('journal_entries', 'journal_details.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_details.account_id', $selectedAccountId)
            ->where('journal_entries.status', 'Posted')
            ->select('journal_details.*')
            ->when($period, fn ($q) => $q->whereBetween('journal_entries.entry_date', [$period->start_date, $period->end_date]))
            ->orderBy('journal_entries.entry_date')
            ->orderBy('journal_details.created_at');

        $transactions = $transactionsQuery->get()->map(fn ($detail) => [
            'entry_date' => $detail->journalEntry->entry_date->format('d/m/Y'),
            'entry_number' => $detail->journalEntry->entry_number,
            'detail_description' => $detail->description,
            'journal_description' => $detail->journalEntry->description,
            'debit' => (float) $detail->debit,
            'credit' => (float) $detail->credit,
        ]);

        $totalDebit = (float) $transactions->sum('debit');
        $totalCredit = (float) $transactions->sum('credit');

        // Hitung ending balance dengan benar
        if ($normalBalance === 'Debit') {
            // Untuk akun DEBIT: opening + debit - credit
            $endingBalance = $openingBalance + $totalDebit - $totalCredit;
        } else {
            // Untuk akun KREDIT: opening + credit - debit
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
            'periodName' => $period ? $period->period_name : 'Semua Periode',
            'companyName' => config('app.name', 'Akuntansiku'),
        ];

        $pdf = Pdf::loadView('pdf.buku-besar', $data);
        $filename = 'buku-besar-'.str_replace(' ', '-', strtolower($account->account_name)).'.pdf';

        return $pdf->download($filename);
    }
}
