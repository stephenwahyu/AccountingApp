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
        $year = 2025;
        $months = [
            ['name' => 'Januari', 'start' => '01', 'end' => '31'],
            ['name' => 'Februari', 'start' => '01', 'end' => '28'],
            ['name' => 'Maret', 'start' => '01', 'end' => '31'],
            ['name' => 'April', 'start' => '01', 'end' => '30'],
            ['name' => 'Mei', 'start' => '01', 'end' => '31'],
            ['name' => 'Juni', 'start' => '01', 'end' => '30'],
            ['name' => 'Juli', 'start' => '01', 'end' => '31'],
            ['name' => 'Agustus', 'start' => '01', 'end' => '31'],
            ['name' => 'September', 'start' => '01', 'end' => '30'],
            ['name' => 'Oktober', 'start' => '01', 'end' => '31'],
            ['name' => 'November', 'start' => '01', 'end' => '30'],
            ['name' => 'Desember', 'start' => '01', 'end' => '31'],
        ];

        foreach ($months as $index => $month) {
            $monthNum = str_pad($index + 1, 2, '0', STR_PAD_LEFT);

            DB::table('fiscal_periods')->insert([
                'period_name' => $month['name'].' '.$year,
                'start_date' => $year.'-'.$monthNum.'-'.$month['start'],
                'end_date' => $year.'-'.$monthNum.'-'.$month['end'],
                'fiscal_year' => $year,
                'status' => 'Open',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
