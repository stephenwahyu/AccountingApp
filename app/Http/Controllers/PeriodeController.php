<?php

namespace App\Http\Controllers;

use App\Events\FiscalPeriodClosed;
use App\Events\FiscalPeriodOpened;
use App\Models\Account;
use App\Models\AccountBalance;
use App\Models\FiscalPeriod;
use App\Models\JournalDetail;
use App\Models\JournalEntry;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class PeriodeController extends Controller
{
    private function storeAccountBalances(FiscalPeriod $period)
    {
        // Only monthly periods get snapshots for now as they are the base
        if ($period->period_type !== 'monthly') {
            return;
        }

        DB::transaction(function () use ($period) {
            $accounts = Account::with('accountCategory.accountType')->get();
            $calculationStartDate = Carbon::parse($period->start_date);
            $calculationEndDate = Carbon::parse($period->end_date);

            foreach ($accounts as $account) {
                // 1. Calculate Beginning Balance
                // If it's the first period, use initial_balance.
                // Otherwise, ideally use previous period's ending balance if exists.
                $previousPeriod = FiscalPeriod::where('period_type', 'monthly')
                    ->where('end_date', '<', $period->start_date)
                    ->orderBy('end_date', 'desc')
                    ->first();

                $beginningBalance = 0;
                if ($previousPeriod) {
                    $prevBalance = AccountBalance::where('account_id', $account->id)
                        ->where('fiscal_period_id', $previousPeriod->id)
                        ->first();

                    if ($prevBalance) {
                        $beginningBalance = $prevBalance->ending_balance;
                    } else {
                        // Fallback: calculate from beginning of time if no snapshot exists
                        $beginningBalance = $this->calculateLiveBalance($account, Carbon::parse('1900-01-01'), $calculationStartDate->copy()->subDay());
                    }
                } else {
                    $beginningBalance = (float) $account->initial_balance;
                }

                // 2. Calculate current period movements
                $movement = JournalDetail::join('journal_entries', 'journal_details.journal_entry_id', '=', 'journal_entries.id')
                    ->where('journal_details.account_id', $account->id)
                    ->where('journal_entries.status', 'Posted')
                    ->whereBetween('journal_entries.entry_date', [$calculationStartDate, $calculationEndDate])
                    ->select(
                        DB::raw('SUM(debit) as total_debit'),
                        DB::raw('SUM(credit) as total_credit')
                    )
                    ->first();

                AccountBalance::updateOrCreate(
                    ['account_id' => $account->id, 'fiscal_period_id' => $period->id],
                    [
                        'beginning_balance' => $beginningBalance,
                        'debit_total' => $movement->total_debit ?? 0,
                        'credit_total' => $movement->total_credit ?? 0,
                    ]
                );
            }
        });
    }

    private function calculateLiveBalance(Account $account, Carbon $start, Carbon $end)
    {
        $movement = JournalDetail::join('journal_entries', 'journal_details.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_details.account_id', $account->id)
            ->where('journal_entries.status', 'Posted')
            ->whereBetween('journal_entries.entry_date', [$start, $end])
            ->select(
                DB::raw('SUM(debit) as total_debit'),
                DB::raw('SUM(credit) as total_credit')
            )
            ->first();

        $balance = (float) $account->initial_balance + (float) ($movement->total_debit ?? 0) - (float) ($movement->total_credit ?? 0);

        // Note: The above calculation treats everything as Debit-centered because of the table schema constraint.
        // We will stick to this for consistency with the 'ending_balance' stored column.
        return $balance;
    }

    public function index()
    {
        $periodsCollection = FiscalPeriod::with('closedByUser')->get();

        $getTypeWeight = function ($type) {
            switch ($type) {
                case 'monthly': return 1;
                case 'quarterly': return 2;
                case 'annually': return 3;
                default: return 4;
            }
        };

        $sortedPeriods = $periodsCollection->sortBy(function ($period) use ($getTypeWeight) {
            $endDateKey = Carbon::parse($period->end_date)->format('Ymd');
            $typeWeight = $getTypeWeight($period->period_type);

            return "{$endDateKey}{$typeWeight}";
        })->reverse()->values();

        $periods = $periodsCollection->map(function ($period) use ($periodsCollection) {
            $canBeClosedParent = true;

            if ($period->period_type === 'quarterly' || $period->period_type === 'annually') {
                $childPeriods = $periodsCollection->filter(function ($child) use ($period) {
                    return $child->period_type === 'monthly' &&
                           Carbon::parse($child->start_date)->between(Carbon::parse($period->start_date), Carbon::parse($period->end_date)) &&
                           Carbon::parse($child->end_date)->between(Carbon::parse($period->start_date), Carbon::parse($period->end_date));
                });

                $canBeClosedParent = $childPeriods->every(fn ($child) => $child->status === 'Closed');
            }

            return [
                'id' => $period->id,
                'period_name' => $period->period_name,
                'start_date' => Carbon::parse($period->start_date)->format('d M Y'),
                'end_date' => Carbon::parse($period->end_date)->format('d M Y'),
                'status' => $period->status,
                'period_type' => $period->period_type,
                'closed_at' => $period->closed_at ? Carbon::parse($period->closed_at)->format('d M Y, H:i') : '-',
                'closed_by' => $period->closedByUser?->name,
                'can_reopen' => $period->status === 'Closed',
                'can_be_closed' => $period->status === 'Open' &&
                                   ! JournalEntry::where('fiscal_period_id', $period->id)
                                       ->where('status', 'Draft')
                                       ->exists() &&
                                   $canBeClosedParent,
                'can_be_closed_parent' => $canBeClosedParent,
            ];
        })->sortBy(function ($period) use ($getTypeWeight) {
            $endDateKey = Carbon::parse($period['end_date'])->format('Ymd');
            $typeWeight = $getTypeWeight($period['period_type']);

            return "{$endDateKey}{$typeWeight}";
        })->reverse()->values();

        return Inertia::render('periode/periode', [
            'periods' => $periods,
            'can_create_new' => false,
        ]);
    }

    public function close(Request $request, FiscalPeriod $period)
    {
        if ($period->status === 'Closed') {
            return Redirect::back()->with('error', 'Periode sudah ditutup.');
        }

        // Sequential Check: Ensure previous monthly period is closed
        if ($period->period_type === 'monthly') {
            $previousPeriod = FiscalPeriod::where('period_type', 'monthly')
                ->where('end_date', '<', $period->start_date)
                ->orderBy('end_date', 'desc')
                ->first();

            if ($previousPeriod && $previousPeriod->status === 'Open') {
                return Redirect::back()->with('error', "Harap tutup periode sebelumnya ({$previousPeriod->period_name}) terlebih dahulu.");
            }
        }

        // Additional validation for quarterly and annually periods
        if ($period->period_type === 'quarterly' || $period->period_type === 'annually') {
            $childPeriods = FiscalPeriod::where('period_type', 'monthly')
                ->whereBetween('start_date', [Carbon::parse($period->start_date), Carbon::parse($period->end_date)])
                ->get();

            $openChildCount = $childPeriods->where('status', 'Open')->count();
            if ($openChildCount > 0) {
                return Redirect::back()->with('error', "Tidak dapat menutup periode {$period->period_name}. Masih ada {$openChildCount} periode bulanan yang terbuka di dalamnya.");
            }
            $draftChildJournals = JournalEntry::whereIn('fiscal_period_id', $childPeriods->pluck('id'))
                ->where('status', 'Draft')
                ->count();

            if ($draftChildJournals > 0) {
                return Redirect::back()->with('error', "Tidak dapat menutup periode {$period->period_name}. Masih ada {$draftChildJournals} jurnal berstatus draft di periode bulanan di dalamnya.");
            }
        }

        // Cek apakah ada jurnal draft di periode ini
        $draftJournals = JournalEntry::where('fiscal_period_id', $period->id)
            ->where('status', 'Draft')
            ->count();

        if ($draftJournals > 0) {
            return Redirect::back()->with('error', "Tidak dapat menutup periode. Masih ada {$draftJournals} jurnal berstatus draft.");
        }

        $period->update([
            'status' => 'Closed',
            'closed_at' => now(),
            'closed_by' => Auth::id(),
        ]);

        $this->storeAccountBalances($period);

        FiscalPeriodClosed::dispatch($period);

        return Redirect::route('periode.index')->with('success', 'Periode berhasil ditutup.');
    }

    public function open(Request $request, FiscalPeriod $period)
    {
        if ($period->status === 'Open') {
            return Redirect::back()->with('error', 'Periode sudah terbuka.');
        }

        // Sequential Check: Ensure subsequent monthly period is NOT closed
        if ($period->period_type === 'monthly') {
            $nextPeriod = FiscalPeriod::where('period_type', 'monthly')
                ->where('start_date', '>', $period->end_date)
                ->where('status', 'Closed')
                ->first();

            if ($nextPeriod) {
                return Redirect::back()->with('error', "Tidak dapat membuka periode ini karena periode setelahnya ({$nextPeriod->period_name}) sudah ditutup.");
            }
        }

        // Validation for quarterly and annually periods: Cannot open if any child is open
        if ($period->period_type === 'quarterly' || $period->period_type === 'annually') {
            $openChildCount = FiscalPeriod::where('period_type', 'monthly')
                ->whereBetween('start_date', [Carbon::parse($period->start_date), Carbon::parse($period->end_date)])
                ->where('status', 'Open')
                ->count();

            if ($openChildCount > 0) {
                return Redirect::back()->with('error', "Tidak dapat membuka periode {$period->period_name}. Masih ada {$openChildCount} periode bulanan yang terbuka di dalamnya.");
            }
        }

        $period->update([
            'status' => 'Open',
            'closed_at' => null,
            'closed_by' => null,
        ]);

        // Delete snapshots when reopened to ensure they are recalculated when closed again
        AccountBalance::where('fiscal_period_id', $period->id)->delete();

        FiscalPeriodOpened::dispatch($period);

        return Redirect::route('periode.index')->with('success', 'Periode berhasil dibuka kembali.');
    }
}
