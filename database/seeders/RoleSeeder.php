<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('roles')->insert([
            [
                'name' => 'Akuntan',
                'description' => 'Accountant with access to accounting features and reports',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Pemimpin',
                'description' => 'Leader with access to view reports and dashboard',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // [
            //     'name' => 'Admin',
            //     'description' => 'Administrator with full access',
            //     'created_at' => now(),
            //     'updated_at' => now(),
            // ],
        ]);
    }
}
