<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AccountTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('account_types')->insert([
            ['id' => 1, 'name' => 'Aset', 'normal_balance' => 'Debit'],
            ['id' => 2, 'name' => 'Liabilitas', 'normal_balance' => 'Kredit'],
            ['id' => 3, 'name' => 'Ekuitas', 'normal_balance' => 'Kredit'],
            ['id' => 4, 'name' => 'Pendapatan', 'normal_balance' => 'Kredit'],
            ['id' => 5, 'name' => 'Beban', 'normal_balance' => 'Debit'],
        ]);
    }
}
