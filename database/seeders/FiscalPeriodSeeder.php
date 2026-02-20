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
        $startYear = 2024; // ⬅ ubah sesuai tahun awal data lama kamu
        $endYear   = 2026; // ⬅ bisa ubah atau pakai now()->year

        for ($year = $startYear; $year <= $endYear; $year++) {

            for ($month = 1; $month <= 12; $month++) {

                $startDate = \Carbon\Carbon::create($year, $month, 1)->startOfMonth();
                $endDate   = \Carbon\Carbon::create($year, $month, 1)->endOfMonth();

                DB::table('fiscal_periods')->insert([
                    'period_name' => $startDate->translatedFormat('F Y'),
                    'start_date'  => $startDate->toDateString(),
                    'end_date'    => $endDate->toDateString(),
                    'fiscal_year' => $year,
                    'status'      => 'Open',
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
            }
        }
    }
}
