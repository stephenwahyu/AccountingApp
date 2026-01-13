<?php

namespace App\Listeners;

use App\Events\FiscalPeriodClosed;
use App\Models\FiscalPeriod;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CheckParentPeriodStatus
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
    public function handle(FiscalPeriodClosed $event): void
    {
        $closedPeriod = $event->period;
        Log::info("Handling FiscalPeriodClosed event for period: {$closedPeriod->period_name}");

        if ($closedPeriod->period_type === 'monthly') {
            $this->checkAndCloseParentQuarter($closedPeriod);
        }

        if ($closedPeriod->period_type === 'quarterly') {
            $this->checkAndCloseParentYear($closedPeriod);
        }
    }

    private function checkAndCloseParentQuarter(FiscalPeriod $monthlyPeriod)
    {
        $startDate = Carbon::parse($monthlyPeriod->start_date);
        $year = $startDate->year;
        $quarter = $startDate->quarter;

        $quarterlyPeriod = FiscalPeriod::where('period_type', 'quarterly')
            ->where('fiscal_year', $year)
            ->whereRaw('QUARTER(start_date) = ?', [$quarter])
            ->first();

        if ($quarterlyPeriod && $quarterlyPeriod->status === 'Open') {
            $startOfQuarter = Carbon::parse($quarterlyPeriod->start_date);
            $monthsInQuarter = [$startOfQuarter->month, $startOfQuarter->copy()->addMonth()->month, $startOfQuarter->copy()->addMonths(2)->month];

            $closedMonthsCount = FiscalPeriod::where('period_type', 'monthly')
                ->where('fiscal_year', $year)
                ->whereIn(DB::raw('MONTH(start_date)'), $monthsInQuarter)
                ->where('status', 'Closed')
                ->count();

            if ($closedMonthsCount === 3) {
                $quarterlyPeriod->update(['status' => 'Closed', 'closed_at' => now(), 'closed_by' => Auth::id() ?? null]);
                Log::info("Automatically closed quarterly period: {$quarterlyPeriod->period_name}");
                FiscalPeriodClosed::dispatch($quarterlyPeriod);
            }
        }
    }

    private function checkAndCloseParentYear(FiscalPeriod $quarterlyPeriod)
    {
        $year = $quarterlyPeriod->fiscal_year;

        $annualPeriod = FiscalPeriod::where('period_type', 'annually')
            ->where('fiscal_year', $year)
            ->first();

        if ($annualPeriod && $annualPeriod->status === 'Open') {
            $closedQuartersCount = FiscalPeriod::where('period_type', 'quarterly')
                ->where('fiscal_year', $year)
                ->where('status', 'Closed')
                ->count();

            if ($closedQuartersCount === 4) {
                $annualPeriod->update(['status' => 'Closed', 'closed_at' => now(), 'closed_by' => Auth::id() ?? null]);
                Log::info("Automatically closed annual period: {$annualPeriod->period_name}");
            }
        }
    }
}
