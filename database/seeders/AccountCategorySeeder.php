<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AccountCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('account_categories')->insert([
            // Aset
            ['id' => 1, 'name' => 'Aset Lancar', 'account_type_id' => 1],
            ['id' => 2, 'name' => 'Aset Tetap', 'account_type_id' => 1],
            ['id' => 3, 'name' => 'Aset Lainnya', 'account_type_id' => 1],

            // Liabilitas
            ['id' => 4, 'name' => 'Liabilitas Jangka Pendek', 'account_type_id' => 2],
            ['id' => 5, 'name' => 'Liabilitas Jangka Panjang', 'account_type_id' => 2],

            // Ekuitas
            ['id' => 6, 'name' => 'Modal', 'account_type_id' => 3],

            // Pendapatan
            ['id' => 7, 'name' => 'Pendapatan Usaha', 'account_type_id' => 4],
            ['id' => 8, 'name' => 'Pendapatan Lain-Lain', 'account_type_id' => 4],

            // Beban
            ['id' => 9, 'name' => 'Harga Pokok Penjualan', 'account_type_id' => 5],
            ['id' => 10, 'name' => 'Beban Penjualan', 'account_type_id' => 5],
            ['id' => 11, 'name' => 'Beban Administrasi & Umum', 'account_type_id' => 5],
            ['id' => 12, 'name' => 'Beban Lain-Lain', 'account_type_id' => 5],
        ]);
    }
}