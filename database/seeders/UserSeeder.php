<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            [
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
                'role_id' => 3, //'Admin' role has id 3
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Muhammad Irsal',
                'email' => 'akuntan@example.com',
                'password' => Hash::make('password'),
                'role_id' => 1, // 'Akuntan' role has id 1
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Bemi Hendrias',
                'email' => 'direktur@example.com',
                'password' => Hash::make('password'),
                'role_id' => 2, // 'Direktur' role has id 2
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
