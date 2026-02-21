<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FiscalPeriodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \Carbon\Carbon::setLocale('id'); // ⬅ set locale ke Indonesia

        $startYear = 2024;
        $currentYear  = now()->year;
        $currentMonth = now()->month;

        for ($year = $startYear; $year <= $currentYear; $year++) {

            $lastMonth = ($year == $currentYear) ? $currentMonth : 12;

            for ($month = 1; $month <= $lastMonth; $month++) {

                $startDate = \Carbon\Carbon::create($year, $month, 1)->startOfMonth();
                $endDate   = \Carbon\Carbon::create($year, $month, 1)->endOfMonth();

                DB::table('fiscal_periods')->updateOrInsert(
                    [
                        'start_date' => $startDate->toDateString()
                    ],
                    [
                        'period_name' => $startDate->translatedFormat('F Y'),
                        'end_date'    => $endDate->toDateString(),
                        'fiscal_year' => $year,
                        'status'      => 'Open',
                        'updated_at'  => now(),
                        'created_at'  => now(),
                    ]
                );
            }
        }
    }
}
