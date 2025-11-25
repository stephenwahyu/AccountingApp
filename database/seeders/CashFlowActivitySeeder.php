<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CashFlowActivitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('cash_flow_activities')->insert([
            ['id' => 1, 'name' => 'Aktivitas Operasi'],
            ['id' => 2, 'name' => 'Aktivitas Investasi'],
            ['id' => 3, 'name' => 'Aktivitas Pendanaan'],
        ]);
    }
}