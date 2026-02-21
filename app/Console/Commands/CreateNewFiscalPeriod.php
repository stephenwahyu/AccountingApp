<?php

namespace App\Console\Commands;

use App\Models\FiscalPeriod;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CreateNewFiscalPeriod extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-new-fiscal-period {--date=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new fiscal period if no other period is open';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $targetDate = $this->option('date') ? Carbon::parse($this->option('date')) : Carbon::now();
        Carbon::setLocale('id');
        $this->info('Memeriksa dan membuat periode otomatis...');

        $this->createMonthlyPeriods($targetDate);
        $this->createQuarterlyPeriods();
        $this->createAnnualPeriods();

        $this->info('Pemeriksaan periode selesai.');

        return 0;
    }

    private function createMonthlyPeriods(Carbon $targetDate)
    {
        $this->info('-> Memeriksa periode bulanan...');

        $latestMonthly = FiscalPeriod::where('period_type', 'monthly')
            ->orderBy('start_date', 'desc')
            ->first();

        $nextStart = $latestMonthly
            ? Carbon::parse($latestMonthly->end_date)->addDay()->startOfMonth()
            : $targetDate->copy()->startOfMonth();

        $currentMonth = $targetDate->copy()->startOfMonth();

        while ($nextStart->lte($currentMonth)) {

            if (FiscalPeriod::where('period_type', 'monthly')
                ->where('start_date', $nextStart)
                ->doesntExist()
            ) {

                $newPeriod = FiscalPeriod::create([
                    'period_name' => $nextStart->translatedFormat('F Y'),
                    'start_date'  => $nextStart->copy()->startOfMonth(),
                    'end_date'    => $nextStart->copy()->endOfMonth(),
                    'fiscal_year' => $nextStart->year,
                    'status'      => 'Open',
                    'period_type' => 'monthly',
                ]);

                $this->info("   Berhasil membuat periode: {$newPeriod->period_name}");
            }

            $nextStart->addMonth();
        }

        if ($nextStart->gt($currentMonth)) {
            $this->info('   Semua periode bulanan yang relevan sudah ada.');
        }
    }

    private function createQuarterlyPeriods()
    {
        // === 2. Create Quarterly Periods ===
        $this->info('-> Memeriksa periode kuartalan...');
        $firstDate = FiscalPeriod::min('start_date');
        $lastDate = FiscalPeriod::max('start_date');

        if ($firstDate && $lastDate) {
            $quartersToProcess = Carbon::parse($firstDate)->startOfQuarter()
                ->toPeriod(Carbon::parse($lastDate)->startOfQuarter(), 3, 'months');

            foreach ($quartersToProcess as $quarterStartDate) {
                $year = $quarterStartDate->year;
                $quarter = $quarterStartDate->quarter;
                $periodName = "Triwulan {$quarter} {$year}";

                if (FiscalPeriod::where('period_name', $periodName)->doesntExist()) {
                    $monthsInQuarter = [$quarterStartDate->month, $quarterStartDate->copy()->addMonth()->month, $quarterStartDate->copy()->addMonths(2)->month];

                    $existingMonthsCount = FiscalPeriod::where('period_type', 'monthly')
                        ->whereYear('start_date', $year)
                        ->whereIn(DB::raw('MONTH(start_date)'), $monthsInQuarter)
                        ->count();

                    if ($existingMonthsCount === 3) {
                        $newPeriod = FiscalPeriod::create([
                            'period_name' => $periodName,
                            'start_date' => $quarterStartDate->copy()->startOfQuarter(),
                            'end_date' => $quarterStartDate->copy()->endOfQuarter(),
                            'fiscal_year' => $year,
                            'status' => 'Open',
                            'period_type' => 'quarterly',
                        ]);
                        $this->info("   Berhasil membuat periode: {$newPeriod->period_name}");
                    }
                }
            }
        }
    }

    private function createAnnualPeriods()
    {
        // === 3. Create Annual Periods ===
        $this->info('-> Memeriksa periode tahunan...');
        $firstDate = FiscalPeriod::min('start_date');
        $lastDate = FiscalPeriod::max('start_date');
        if ($firstDate && $lastDate) {
            $startYear = (int) Carbon::parse($firstDate)->year;
            $endYear = (int) Carbon::parse($lastDate)->year;

            for ($year = $startYear; $year <= $endYear; $year++) {
                $periodName = "Tahunan {$year}";
                if (FiscalPeriod::where('period_name', $periodName)->doesntExist()) {
                    $existingMonthsCount = FiscalPeriod::where('period_type', 'monthly')
                        ->where('fiscal_year', $year)
                        ->count();

                    if ($existingMonthsCount === 12) {
                        $newPeriod = FiscalPeriod::create([
                            'period_name' => $periodName,
                            'start_date' => Carbon::create($year, 1, 1)->startOfYear(),
                            'end_date' => Carbon::create($year, 1, 1)->endOfYear(),
                            'fiscal_year' => $year,
                            'status' => 'Open',
                            'period_type' => 'annually',
                        ]);
                        $this->info("   Berhasil membuat periode: {$newPeriod->period_name}");
                    }
                }
            }
        }
    }
}
