<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('accounts')->insert([
            // 1. ASET LANCAR (1-1xxx)
            ['id' => 1, 'account_code' => '1-1000', 'account_name' => 'ASET LANCAR', 'account_category_id' => 1, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => null, 'initial_balance' => 0.00],
            ['id' => 2, 'account_code' => '1-1100', 'account_name' => 'Kas & Bank', 'account_category_id' => 1, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 1, 'initial_balance' => 0.00],
            ['id' => 3, 'account_code' => '1-1101', 'account_name' => 'Kas Kecil', 'account_category_id' => 1, 'cash_flow_activity_id' => 1, 'is_cash_account' => 1, 'parent_id' => 2, 'initial_balance' => 5000000.00],
            ['id' => 4, 'account_code' => '1-1102', 'account_name' => 'Kas Besar', 'account_category_id' => 1, 'cash_flow_activity_id' => 1, 'is_cash_account' => 1, 'parent_id' => 2, 'initial_balance' => 10000000.00],
            ['id' => 5, 'account_code' => '1-1103', 'account_name' => 'Bank BCA', 'account_category_id' => 1, 'cash_flow_activity_id' => 1, 'is_cash_account' => 1, 'parent_id' => 2, 'initial_balance' => 50000000.00],
            ['id' => 6, 'account_code' => '1-1104', 'account_name' => 'Bank Mandiri', 'account_category_id' => 1, 'cash_flow_activity_id' => 1, 'is_cash_account' => 1, 'parent_id' => 2, 'initial_balance' => 30000000.00],
            ['id' => 7, 'account_code' => '1-1105', 'account_name' => 'Bank BNI', 'account_category_id' => 1, 'cash_flow_activity_id' => 1, 'is_cash_account' => 1, 'parent_id' => 2, 'initial_balance' => 25000000.00],
            ['id' => 8, 'account_code' => '1-1200', 'account_name' => 'Piutang', 'account_category_id' => 1, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 1, 'initial_balance' => 0.00],
            ['id' => 9, 'account_code' => '1-1201', 'account_name' => 'Piutang Usaha', 'account_category_id' => 1, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 8, 'initial_balance' => 75000000.00],
            ['id' => 10, 'account_code' => '1-1202', 'account_name' => 'Piutang Karyawan', 'account_category_id' => 1, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 8, 'initial_balance' => 2000000.00],
            ['id' => 11, 'account_code' => '1-1203', 'account_name' => 'Piutang Lain-Lain', 'account_category_id' => 1, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 8, 'initial_balance' => 1000000.00],
            ['id' => 12, 'account_code' => '1-1204', 'account_name' => 'Cadangan Kerugian Piutang', 'account_category_id' => 1, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 8, 'initial_balance' => -3000000.00],
            ['id' => 13, 'account_code' => '1-1300', 'account_name' => 'Persediaan', 'account_category_id' => 1, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 1, 'initial_balance' => 0.00],
            ['id' => 14, 'account_code' => '1-1301', 'account_name' => 'Persediaan Barang Dagang', 'account_category_id' => 1, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 13, 'initial_balance' => 150000000.00],
            ['id' => 15, 'account_code' => '1-1302', 'account_name' => 'Persediaan Barang Dalam Transit', 'account_category_id' => 1, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 13, 'initial_balance' => 5000000.00],
            ['id' => 16, 'account_code' => '1-1303', 'account_name' => 'Persediaan Bahan Kemasan', 'account_category_id' => 1, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 13, 'initial_balance' => 3000000.00],
            ['id' => 17, 'account_code' => '1-1400', 'account_name' => 'Aset Lancar Lainnya', 'account_category_id' => 1, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 1, 'initial_balance' => 0.00],
            ['id' => 18, 'account_code' => '1-1401', 'account_name' => 'Biaya Dibayar Dimuka', 'account_category_id' => 1, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 17, 'initial_balance' => 6000000.00],
            ['id' => 19, 'account_code' => '1-1402', 'account_name' => 'Asuransi Dibayar Dimuka', 'account_category_id' => 1, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 17, 'initial_balance' => 4000000.00],
            ['id' => 20, 'account_code' => '1-1403', 'account_name' => 'Sewa Dibayar Dimuka', 'account_category_id' => 1, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 17, 'initial_balance' => 12000000.00],
            ['id' => 21, 'account_code' => '1-1404', 'account_name' => 'PPN Masukan', 'account_category_id' => 1, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 17, 'initial_balance' => 8000000.00],
            ['id' => 22, 'account_code' => '1-1405', 'account_name' => 'Uang Muka Pembelian', 'account_category_id' => 1, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 17, 'initial_balance' => 10000000.00],

            // 1.2 ASET TETAP (1-2xxx)
            ['id' => 23, 'account_code' => '1-2000', 'account_name' => 'ASET TETAP', 'account_category_id' => 2, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => null, 'initial_balance' => 0.00],
            ['id' => 24, 'account_code' => '1-2100', 'account_name' => 'Tanah', 'account_category_id' => 2, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 23, 'initial_balance' => 0.00],
            ['id' => 25, 'account_code' => '1-2101', 'account_name' => 'Tanah Kantor', 'account_category_id' => 2, 'cash_flow_activity_id' => 2, 'is_cash_account' => 0, 'parent_id' => 24, 'initial_balance' => 500000000.00],
            ['id' => 26, 'account_code' => '1-2102', 'account_name' => 'Tanah Gudang', 'account_category_id' => 2, 'cash_flow_activity_id' => 2, 'is_cash_account' => 0, 'parent_id' => 24, 'initial_balance' => 300000000.00],
            ['id' => 27, 'account_code' => '1-2200', 'account_name' => 'Bangunan', 'account_category_id' => 2, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 23, 'initial_balance' => 0.00],
            ['id' => 28, 'account_code' => '1-2201', 'account_name' => 'Bangunan Kantor', 'account_category_id' => 2, 'cash_flow_activity_id' => 2, 'is_cash_account' => 0, 'parent_id' => 27, 'initial_balance' => 400000000.00],
            ['id' => 29, 'account_code' => '1-2202', 'account_name' => 'Bangunan Gudang', 'account_category_id' => 2, 'cash_flow_activity_id' => 2, 'is_cash_account' => 0, 'parent_id' => 27, 'initial_balance' => 200000000.00],
            ['id' => 30, 'account_code' => '1-2203', 'account_name' => 'Bangunan Toko', 'account_category_id' => 2, 'cash_flow_activity_id' => 2, 'is_cash_account' => 0, 'parent_id' => 27, 'initial_balance' => 150000000.00],
            ['id' => 31, 'account_code' => '1-2210', 'account_name' => 'Akumulasi Penyusutan Bangunan', 'account_category_id' => 2, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 27, 'initial_balance' => -50000000.00],
            ['id' => 32, 'account_code' => '1-2300', 'account_name' => 'Kendaraan', 'account_category_id' => 2, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 23, 'initial_balance' => 0.00],
            ['id' => 33, 'account_code' => '1-2301', 'account_name' => 'Kendaraan Operasional', 'account_category_id' => 2, 'cash_flow_activity_id' => 2, 'is_cash_account' => 0, 'parent_id' => 32, 'initial_balance' => 200000000.00],
            ['id' => 34, 'account_code' => '1-2302', 'account_name' => 'Kendaraan Pengiriman', 'account_category_id' => 2, 'cash_flow_activity_id' => 2, 'is_cash_account' => 0, 'parent_id' => 32, 'initial_balance' => 150000000.00],
            ['id' => 35, 'account_code' => '1-2310', 'account_name' => 'Akumulasi Penyusutan Kendaraan', 'account_category_id' => 2, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 32, 'initial_balance' => -70000000.00],
            ['id' => 36, 'account_code' => '1-2400', 'account_name' => 'Peralatan & Mesin', 'account_category_id' => 2, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 23, 'initial_balance' => 0.00],
            ['id' => 37, 'account_code' => '1-2401', 'account_name' => 'Peralatan Kantor', 'account_category_id' => 2, 'cash_flow_activity_id' => 2, 'is_cash_account' => 0, 'parent_id' => 36, 'initial_balance' => 50000000.00],
            ['id' => 38, 'account_code' => '1-2402', 'account_name' => 'Komputer & Printer', 'account_category_id' => 2, 'cash_flow_activity_id' => 2, 'is_cash_account' => 0, 'parent_id' => 36, 'initial_balance' => 40000000.00],
            ['id' => 39, 'account_code' => '1-2403', 'account_name' => 'Peralatan Gudang', 'account_category_id' => 2, 'cash_flow_activity_id' => 2, 'is_cash_account' => 0, 'parent_id' => 36, 'initial_balance' => 30000000.00],
            ['id' => 40, 'account_code' => '1-2404', 'account_name' => 'Furniture & Fixture', 'account_category_id' => 2, 'cash_flow_activity_id' => 2, 'is_cash_account' => 0, 'parent_id' => 36, 'initial_balance' => 25000000.00],
            ['id' => 41, 'account_code' => '1-2410', 'account_name' => 'Akumulasi Penyusutan Peralatan', 'account_category_id' => 2, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 36, 'initial_balance' => -35000000.00],

            // 1.3 ASET LAINNYA (1-3xxx)
            ['id' => 42, 'account_code' => '1-3000', 'account_name' => 'ASET LAINNYA', 'account_category_id' => 3, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => null, 'initial_balance' => 0.00],
            ['id' => 43, 'account_code' => '1-3101', 'account_name' => 'Investasi Jangka Panjang', 'account_category_id' => 3, 'cash_flow_activity_id' => 2, 'is_cash_account' => 0, 'parent_id' => 42, 'initial_balance' => 100000000.00],
            ['id' => 44, 'account_code' => '1-3102', 'account_name' => 'Aset Dalam Penyelesaian', 'account_category_id' => 3, 'cash_flow_activity_id' => 2, 'is_cash_account' => 0, 'parent_id' => 42, 'initial_balance' => 20000000.00],
            ['id' => 45, 'account_code' => '1-3103', 'account_name' => 'Goodwill', 'account_category_id' => 3, 'cash_flow_activity_id' => 2, 'is_cash_account' => 0, 'parent_id' => 42, 'initial_balance' => 15000000.00],
            ['id' => 46, 'account_code' => '1-3104', 'account_name' => 'Deposito Jangka Panjang', 'account_category_id' => 3, 'cash_flow_activity_id' => 2, 'is_cash_account' => 0, 'parent_id' => 42, 'initial_balance' => 50000000.00],

            // 2. LIABILITAS (2-xxxx)
            // 2.1 LIABILITAS JANGKA PENDEK (2-1xxx)
            ['id' => 47, 'account_code' => '2-1000', 'account_name' => 'LIABILITAS JANGKA PENDEK', 'account_category_id' => 4, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => null, 'initial_balance' => 0.00],
            ['id' => 48, 'account_code' => '2-1100', 'account_name' => 'Hutang', 'account_category_id' => 4, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 47, 'initial_balance' => 0.00],
            ['id' => 49, 'account_code' => '2-1101', 'account_name' => 'Hutang Usaha', 'account_category_id' => 4, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 48, 'initial_balance' => 80000000.00],
            ['id' => 50, 'account_code' => '2-1102', 'account_name' => 'Hutang Gaji', 'account_category_id' => 4, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 48, 'initial_balance' => 15000000.00],
            ['id' => 51, 'account_code' => '2-1103', 'account_name' => 'Hutang Pajak', 'account_category_id' => 4, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 48, 'initial_balance' => 5000000.00],
            ['id' => 52, 'account_code' => '2-1104', 'account_name' => 'Hutang Lain-Lain', 'account_category_id' => 4, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 48, 'initial_balance' => 2000000.00],
            ['id' => 53, 'account_code' => '2-1200', 'account_name' => 'Hutang Bank Jangka Pendek', 'account_category_id' => 4, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 47, 'initial_balance' => 0.00],
            ['id' => 54, 'account_code' => '2-1201', 'account_name' => 'Hutang Bank BCA - Jangka Pendek', 'account_category_id' => 4, 'cash_flow_activity_id' => 3, 'is_cash_account' => 0, 'parent_id' => 53, 'initial_balance' => 50000000.00],
            ['id' => 55, 'account_code' => '2-1202', 'account_name' => 'Hutang Bank Mandiri - Jangka Pendek', 'account_category_id' => 4, 'cash_flow_activity_id' => 3, 'is_cash_account' => 0, 'parent_id' => 53, 'initial_balance' => 30000000.00],
            ['id' => 56, 'account_code' => '2-1300', 'account_name' => 'Kewajiban Jangka Pendek Lainnya', 'account_category_id' => 4, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 47, 'initial_balance' => 0.00],
            ['id' => 57, 'account_code' => '2-1301', 'account_name' => 'PPN Keluaran', 'account_category_id' => 4, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 56, 'initial_balance' => 12000000.00],
            ['id' => 58, 'account_code' => '2-1302', 'account_name' => 'PPh Pasal 21', 'account_category_id' => 4, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 56, 'initial_balance' => 3000000.00],
            ['id' => 59, 'account_code' => '2-1303', 'account_name' => 'PPh Pasal 23', 'account_category_id' => 4, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 56, 'initial_balance' => 2000000.00],
            ['id' => 60, 'account_code' => '2-1304', 'account_name' => 'PPh Pasal 4 ayat 2', 'account_category_id' => 4, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 56, 'initial_balance' => 1500000.00],
            ['id' => 61, 'account_code' => '2-1305', 'account_name' => 'Biaya Yang Masih Harus Dibayar', 'account_category_id' => 4, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 56, 'initial_balance' => 8000000.00],
            ['id' => 62, 'account_code' => '2-1306', 'account_name' => 'Pendapatan Diterima Dimuka', 'account_category_id' => 4, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 56, 'initial_balance' => 10000000.00],
            ['id' => 63, 'account_code' => '2-1307', 'account_name' => 'Uang Muka Pelanggan', 'account_category_id' => 4, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 56, 'initial_balance' => 20000000.00],

            // 2.2 LIABILITAS JANGKA PANJANG (2-2xxx)
            ['id' => 64, 'account_code' => '2-2000', 'account_name' => 'LIABILITAS JANGKA PANJANG', 'account_category_id' => 5, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => null, 'initial_balance' => 0.00],
            ['id' => 65, 'account_code' => '2-2101', 'account_name' => 'Hutang Bank Jangka Panjang', 'account_category_id' => 5, 'cash_flow_activity_id' => 3, 'is_cash_account' => 0, 'parent_id' => 64, 'initial_balance' => 200000000.00],
            ['id' => 66, 'account_code' => '2-2102', 'account_name' => 'Hutang Obligasi', 'account_category_id' => 5, 'cash_flow_activity_id' => 3, 'is_cash_account' => 0, 'parent_id' => 64, 'initial_balance' => 150000000.00],
            ['id' => 67, 'account_code' => '2-2103', 'account_name' => 'Hutang Sewa Pembiayaan (Leasing)', 'account_category_id' => 5, 'cash_flow_activity_id' => 3, 'is_cash_account' => 0, 'parent_id' => 64, 'initial_balance' => 50000000.00],

            // 3. EKUITAS (3-xxxx)
            ['id' => 68, 'account_code' => '3-0000', 'account_name' => 'EKUITAS', 'account_category_id' => 6, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => null, 'initial_balance' => 0.00],
            ['id' => 69, 'account_code' => '3-1001', 'account_name' => 'Modal Saham', 'account_category_id' => 6, 'cash_flow_activity_id' => 3, 'is_cash_account' => 0, 'parent_id' => 68, 'initial_balance' => 1000000000.00],
            ['id' => 70, 'account_code' => '3-1002', 'account_name' => 'Tambahan Modal Disetor', 'account_category_id' => 6, 'cash_flow_activity_id' => 3, 'is_cash_account' => 0, 'parent_id' => 68, 'initial_balance' => 200000000.00],
            ['id' => 71, 'account_code' => '3-2001', 'account_name' => 'Laba Ditahan', 'account_category_id' => 6, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 68, 'initial_balance' => 629500000.00],
            ['id' => 72, 'account_code' => '3-2002', 'account_name' => 'Laba Tahun Berjalan', 'account_category_id' => 6, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 68, 'initial_balance' => 0.00],
            ['id' => 73, 'account_code' => '3-3001', 'account_name' => 'Prive/Dividen', 'account_category_id' => 6, 'cash_flow_activity_id' => 3, 'is_cash_account' => 0, 'parent_id' => 68, 'initial_balance' => 0.00],

            // 4. PENDAPATAN (4-xxxx)
            // 4.1 PENDAPATAN USAHA (4-1xxx)
            ['id' => 74, 'account_code' => '4-1000', 'account_name' => 'PENDAPATAN USAHA', 'account_category_id' => 7, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => null, 'initial_balance' => 0.00],
            ['id' => 75, 'account_code' => '4-1001', 'account_name' => 'Penjualan', 'account_category_id' => 7, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 74, 'initial_balance' => 0.00],
            ['id' => 76, 'account_code' => '4-1002', 'account_name' => 'Retur Penjualan', 'account_category_id' => 7, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 74, 'initial_balance' => 0.00],
            ['id' => 77, 'account_code' => '4-1003', 'account_name' => 'Potongan Penjualan', 'account_category_id' => 7, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 74, 'initial_balance' => 0.00],
            ['id' => 78, 'account_code' => '4-1004', 'account_name' => 'Diskon Penjualan', 'account_category_id' => 7, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 74, 'initial_balance' => 0.00],

            // 4.2 PENDAPATAN LAIN-LAIN (4-2xxx)
            ['id' => 79, 'account_code' => '4-2000', 'account_name' => 'PENDAPATAN LAIN-LAIN', 'account_category_id' => 8, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => null, 'initial_balance' => 0.00],
            ['id' => 80, 'account_code' => '4-2001', 'account_name' => 'Pendapatan Bunga', 'account_category_id' => 8, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 79, 'initial_balance' => 0.00],
            ['id' => 81, 'account_code' => '4-2002', 'account_name' => 'Keuntungan Selisih Kurs', 'account_category_id' => 8, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 79, 'initial_balance' => 0.00],
            ['id' => 82, 'account_code' => '4-2003', 'account_name' => 'Pendapatan Sewa', 'account_category_id' => 8, 'cash_flow_activity_id' => 2, 'is_cash_account' => 0, 'parent_id' => 79, 'initial_balance' => 0.00],
            ['id' => 83, 'account_code' => '4-2004', 'account_name' => 'Keuntungan Penjualan Aset', 'account_category_id' => 8, 'cash_flow_activity_id' => 2, 'is_cash_account' => 0, 'parent_id' => 79, 'initial_balance' => 0.00],
            ['id' => 84, 'account_code' => '4-2005', 'account_name' => 'Pendapatan Lain-Lain', 'account_category_id' => 8, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 79, 'initial_balance' => 0.00],

            // 5. BEBAN (5-xxxx)
            // 5.1 HARGA POKOK PENJUALAN (5-1xxx)
            ['id' => 85, 'account_code' => '5-1000', 'account_name' => 'HARGA POKOK PENJUALAN', 'account_category_id' => 9, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => null, 'initial_balance' => 0.00],
            ['id' => 86, 'account_code' => '5-1001', 'account_name' => 'Pembelian Barang Dagang', 'account_category_id' => 9, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 85, 'initial_balance' => 0.00],
            ['id' => 87, 'account_code' => '5-1002', 'account_name' => 'Retur Pembelian', 'account_category_id' => 9, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 85, 'initial_balance' => 0.00],
            ['id' => 88, 'account_code' => '5-1003', 'account_name' => 'Potongan Pembelian', 'account_category_id' => 9, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 85, 'initial_balance' => 0.00],
            ['id' => 89, 'account_code' => '5-1004', 'account_name' => 'Biaya Angkut Pembelian', 'account_category_id' => 9, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 85, 'initial_balance' => 0.00],
            ['id' => 90, 'account_code' => '5-1005', 'account_name' => 'Biaya Impor', 'account_category_id' => 9, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 85, 'initial_balance' => 0.00],
            ['id' => 91, 'account_code' => '5-1006', 'account_name' => 'Biaya Bongkar Muat', 'account_category_id' => 9, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 85, 'initial_balance' => 0.00],

            // 5.2 BEBAN PENJUALAN (5-2xxx)
            ['id' => 92, 'account_code' => '5-2000', 'account_name' => 'BEBAN PENJUALAN', 'account_category_id' => 10, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => null, 'initial_balance' => 0.00],
            ['id' => 93, 'account_code' => '5-2100', 'account_name' => 'Beban Gaji & Tunjangan Penjualan', 'account_category_id' => 10, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 92, 'initial_balance' => 0.00],
            ['id' => 94, 'account_code' => '5-2101', 'account_name' => 'Gaji Karyawan Penjualan', 'account_category_id' => 10, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 93, 'initial_balance' => 0.00],
            ['id' => 95, 'account_code' => '5-2102', 'account_name' => 'Komisi Penjualan', 'account_category_id' => 10, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 93, 'initial_balance' => 0.00],
            ['id' => 96, 'account_code' => '5-2103', 'account_name' => 'Bonus Penjualan', 'account_category_id' => 10, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 93, 'initial_balance' => 0.00],
            ['id' => 97, 'account_code' => '5-2104', 'account_name' => 'Tunjangan Karyawan Penjualan', 'account_category_id' => 10, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 93, 'initial_balance' => 0.00],
            ['id' => 98, 'account_code' => '5-2200', 'account_name' => 'Beban Pemasaran & Promosi', 'account_category_id' => 10, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 92, 'initial_balance' => 0.00],
            ['id' => 99, 'account_code' => '5-2201', 'account_name' => 'Beban Iklan & Promosi', 'account_category_id' => 10, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 98, 'initial_balance' => 0.00],
            ['id' => 100, 'account_code' => '5-2202', 'account_name' => 'Beban Marketing Online', 'account_category_id' => 10, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 98, 'initial_balance' => 0.00],
            ['id' => 101, 'account_code' => '5-2203', 'account_name' => 'Beban Pameran & Event', 'account_category_id' => 10, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 98, 'initial_balance' => 0.00],
            ['id' => 102, 'account_code' => '5-2204', 'account_name' => 'Beban Contoh Produk', 'account_category_id' => 10, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 98, 'initial_balance' => 0.00],
            ['id' => 103, 'account_code' => '5-2300', 'account_name' => 'Beban Distribusi & Pengiriman', 'account_category_id' => 10, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 92, 'initial_balance' => 0.00],
            ['id' => 104, 'account_code' => '5-2301', 'account_name' => 'Beban Pengiriman Barang', 'account_category_id' => 10, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 103, 'initial_balance' => 0.00],
            ['id' => 105, 'account_code' => '5-2302', 'account_name' => 'Beban Bahan Bakar Kendaraan', 'account_category_id' => 10, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 103, 'initial_balance' => 0.00],
            ['id' => 106, 'account_code' => '5-2303', 'account_name' => 'Beban Pemeliharaan Kendaraan', 'account_category_id' => 10, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 103, 'initial_balance' => 0.00],
            ['id' => 107, 'account_code' => '5-2304', 'account_name' => 'Beban Tol & Parkir', 'account_category_id' => 10, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 103, 'initial_balance' => 0.00],
            ['id' => 108, 'account_code' => '5-2400', 'account_name' => 'Beban Penjualan Lainnya', 'account_category_id' => 10, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 92, 'initial_balance' => 0.00],
            ['id' => 109, 'account_code' => '5-2401', 'account_name' => 'Beban Kemasan & Packing', 'account_category_id' => 10, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 108, 'initial_balance' => 0.00],
            ['id' => 110, 'account_code' => '5-2402', 'account_name' => 'Beban Kartu Kredit', 'account_category_id' => 10, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 108, 'initial_balance' => 0.00],
            ['id' => 111, 'account_code' => '5-2403', 'account_name' => 'Beban Piutang Tak Tertagih', 'account_category_id' => 10, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 108, 'initial_balance' => 0.00],

            // 5.3 BEBAN ADMINISTRASI & UMUM (5-3xxx)
            ['id' => 112, 'account_code' => '5-3000', 'account_name' => 'BEBAN ADMINISTRASI & UMUM', 'account_category_id' => 11, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => null, 'initial_balance' => 0.00],
            ['id' => 113, 'account_code' => '5-3100', 'account_name' => 'Beban Gaji & Tunjangan Administrasi', 'account_category_id' => 11, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 112, 'initial_balance' => 0.00],
            ['id' => 114, 'account_code' => '5-3101', 'account_name' => 'Gaji Karyawan Administrasi', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 113, 'initial_balance' => 0.00],
            ['id' => 115, 'account_code' => '5-3102', 'account_name' => 'Gaji Direksi & Manajemen', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 113, 'initial_balance' => 0.00],
            ['id' => 116, 'account_code' => '5-3103', 'account_name' => 'Tunjangan Karyawan', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 113, 'initial_balance' => 0.00],
            ['id' => 117, 'account_code' => '5-3104', 'account_name' => 'THR & Bonus Karyawan', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 113, 'initial_balance' => 0.00],
            ['id' => 118, 'account_code' => '5-3105', 'account_name' => 'BPJS & Asuransi Kesehatan', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 113, 'initial_balance' => 0.00],
            ['id' => 119, 'account_code' => '5-3200', 'account_name' => 'Beban Kantor', 'account_category_id' => 11, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 112, 'initial_balance' => 0.00],
            ['id' => 120, 'account_code' => '5-3201', 'account_name' => 'Beban Listrik & Air', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 119, 'initial_balance' => 0.00],
            ['id' => 121, 'account_code' => '5-3202', 'account_name' => 'Beban Telepon & Internet', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 119, 'initial_balance' => 0.00],
            ['id' => 122, 'account_code' => '5-3203', 'account_name' => 'Beban Alat Tulis Kantor (ATK)', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 119, 'initial_balance' => 0.00],
            ['id' => 123, 'account_code' => '5-3204', 'account_name' => 'Beban Kebersihan & Keamanan', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 119, 'initial_balance' => 0.00],
            ['id' => 124, 'account_code' => '5-3205', 'account_name' => 'Beban Konsumsi & Jamuan', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 119, 'initial_balance' => 0.00],
            ['id' => 125, 'account_code' => '5-3206', 'account_name' => 'Beban Perlengkapan Kantor', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 119, 'initial_balance' => 0.00],
            ['id' => 126, 'account_code' => '5-3300', 'account_name' => 'Beban Gedung & Pemeliharaan', 'account_category_id' => 11, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 112, 'initial_balance' => 0.00],
            ['id' => 127, 'account_code' => '5-3301', 'account_name' => 'Beban Sewa Gedung', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 126, 'initial_balance' => 0.00],
            ['id' => 128, 'account_code' => '5-3302', 'account_name' => 'Beban Pemeliharaan Gedung', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 126, 'initial_balance' => 0.00],
            ['id' => 129, 'account_code' => '5-3303', 'account_name' => 'Beban Pemeliharaan Peralatan', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 126, 'initial_balance' => 0.00],
            ['id' => 130, 'account_code' => '5-3304', 'account_name' => 'Beban PBB (Pajak Bumi & Bangunan)', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 126, 'initial_balance' => 0.00],
            ['id' => 131, 'account_code' => '5-3400', 'account_name' => 'Beban Penyusutan', 'account_category_id' => 11, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 112, 'initial_balance' => 0.00],
            ['id' => 132, 'account_code' => '5-3401', 'account_name' => 'Beban Penyusutan Bangunan', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 131, 'initial_balance' => 0.00],
            ['id' => 133, 'account_code' => '5-3402', 'account_name' => 'Beban Penyusutan Kendaraan', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 131, 'initial_balance' => 0.00],
            ['id' => 134, 'account_code' => '5-3403', 'account_name' => 'Beban Penyusutan Peralatan', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 131, 'initial_balance' => 0.00],
            ['id' => 135, 'account_code' => '5-3500', 'account_name' => 'Beban Profesional & Konsultan', 'account_category_id' => 11, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 112, 'initial_balance' => 0.00],
            ['id' => 136, 'account_code' => '5-3501', 'account_name' => 'Beban Jasa Akuntan & Auditor', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 135, 'initial_balance' => 0.00],
            ['id' => 137, 'account_code' => '5-3502', 'account_name' => 'Beban Jasa Hukum & Notaris', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 135, 'initial_balance' => 0.00],
            ['id' => 138, 'account_code' => '5-3503', 'account_name' => 'Beban Konsultan', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 135, 'initial_balance' => 0.00],
            ['id' => 139, 'account_code' => '5-3600', 'account_name' => 'Beban Asuransi', 'account_category_id' => 11, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 112, 'initial_balance' => 0.00],
            ['id' => 140, 'account_code' => '5-3601', 'account_name' => 'Beban Asuransi Kendaraan', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 139, 'initial_balance' => 0.00],
            ['id' => 141, 'account_code' => '5-3602', 'account_name' => 'Beban Asuransi Gedung', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 139, 'initial_balance' => 0.00],
            ['id' => 142, 'account_code' => '5-3603', 'account_name' => 'Beban Asuransi Persediaan', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 139, 'initial_balance' => 0.00],
            ['id' => 143, 'account_code' => '5-3700', 'account_name' => 'Beban Administrasi Lainnya', 'account_category_id' => 11, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => 112, 'initial_balance' => 0.00],
            ['id' => 144, 'account_code' => '5-3701', 'account_name' => 'Beban Perizinan & Retribusi', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 143, 'initial_balance' => 0.00],
            ['id' => 145, 'account_code' => '5-3702', 'account_name' => 'Beban Administrasi Bank', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 143, 'initial_balance' => 0.00],
            ['id' => 146, 'account_code' => '5-3703', 'account_name' => 'Beban Materai & Pos', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 143, 'initial_balance' => 0.00],
            ['id' => 147, 'account_code' => '5-3704', 'account_name' => 'Beban Perjalanan Dinas', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 143, 'initial_balance' => 0.00],
            ['id' => 148, 'account_code' => '5-3705', 'account_name' => 'Beban Pelatihan & Pengembangan', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 143, 'initial_balance' => 0.00],
            ['id' => 149, 'account_code' => '5-3706', 'account_name' => 'Beban Entertainment', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 143, 'initial_balance' => 0.00],
            ['id' => 150, 'account_code' => '5-3707', 'account_name' => 'Beban Denda & Sanksi', 'account_category_id' => 11, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 143, 'initial_balance' => 0.00],

            // 5.4 BEBAN LAIN-LAIN (5-4xxx)
            ['id' => 151, 'account_code' => '5-4000', 'account_name' => 'BEBAN LAIN-LAIN', 'account_category_id' => 12, 'cash_flow_activity_id' => null, 'is_cash_account' => 0, 'parent_id' => null, 'initial_balance' => 0.00],
            ['id' => 152, 'account_code' => '5-4001', 'account_name' => 'Beban Bunga', 'account_category_id' => 12, 'cash_flow_activity_id' => 3, 'is_cash_account' => 0, 'parent_id' => 151, 'initial_balance' => 0.00],
            ['id' => 153, 'account_code' => '5-4002', 'account_name' => 'Kerugian Selisih Kurs', 'account_category_id' => 12, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 151, 'initial_balance' => 0.00],
            ['id' => 154, 'account_code' => '5-4003', 'account_name' => 'Kerugian Penjualan Aset', 'account_category_id' => 12, 'cash_flow_activity_id' => 2, 'is_cash_account' => 0, 'parent_id' => 151, 'initial_balance' => 0.00],
            ['id' => 155, 'account_code' => '5-4004', 'account_name' => 'Beban Pajak Penghasilan', 'account_category_id' => 12, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 151, 'initial_balance' => 0.00],
            ['id' => 156, 'account_code' => '5-4005', 'account_name' => 'Beban Lain-Lain', 'account_category_id' => 12, 'cash_flow_activity_id' => 1, 'is_cash_account' => 0, 'parent_id' => 151, 'initial_balance' => 0.00],
        ]);
    }
}
