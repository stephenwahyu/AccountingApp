<?php

namespace App\Listeners;

use App\Events\FiscalPeriodOpened;
use App\Models\FiscalPeriod;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ReopenParentPeriod
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(FiscalPeriodOpened $event): void
    {
        $openedPeriod = $event->period;
        Log::info("Handling FiscalPeriodOpened event for period: {$openedPeriod->period_name}");

        if ($openedPeriod->period_type === 'quarterly') {
            $this->reopenAnnualPeriod($openedPeriod);
        }

        if ($openedPeriod->period_type === 'monthly') {
            $quarterly = $this->reopenQuarterlyPeriod($openedPeriod);
            // After reopening a quarter, we don't need to explicitly reopen the annual,
            // as the logic will handle it based on child quarters.
            // But for safety and directness, if a month is opened, the year it belongs to must also be open.
            $this->reopenAnnualPeriod($openedPeriod);
        }
    }

    /**
     * Reopens the parent quarterly period if it was closed.
     */
    private function reopenQuarterlyPeriod(FiscalPeriod $monthlyPeriod): ?FiscalPeriod
    {
        $startDate = Carbon::parse($monthlyPeriod->start_date);
        $year = $startDate->year;
        $quarter = $startDate->quarter;

        $quarterlyPeriod = FiscalPeriod::where('period_type', 'quarterly')
            ->where('fiscal_year', $year)
            ->whereRaw('QUARTER(start_date) = ?', [$quarter])
            ->first();

        if ($quarterlyPeriod && $quarterlyPeriod->status === 'Closed') {
            $quarterlyPeriod->update(['status' => 'Open', 'closed_at' => null, 'closed_by' => null]);
            Log::info("Automatically reopened quarterly period: {$quarterlyPeriod->period_name}");
            // Dispatch an event for the quarterly period reopening to handle the annual period
            FiscalPeriodOpened::dispatch($quarterlyPeriod);

            return $quarterlyPeriod;
        }

        return $quarterlyPeriod;
    }

    /**
     * Reopens the parent annual period if it was closed.
     */
    private function reopenAnnualPeriod(FiscalPeriod $childPeriod)
    {
        $year = $childPeriod->fiscal_year;

        $annualPeriod = FiscalPeriod::where('period_type', 'annually')
            ->where('fiscal_year', $year)
            ->first();

        if ($annualPeriod && $annualPeriod->status === 'Closed') {
            $annualPeriod->update(['status' => 'Open', 'closed_at' => null, 'closed_by' => null]);
            Log::info("Automatically reopened annual period: {$annualPeriod->period_name}");
        }
    }
}
