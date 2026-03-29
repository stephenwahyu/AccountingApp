<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class JournalSeeder extends Seeder
{
    // =========================================================================
    //  FILTER: Hanya memproses jurnal milik SPR TRADA (dep_kode = 'TR')
    //  Digunakan sebagai data initial balance / saldo awal divisi Trada.
    // =========================================================================
    private const FILTER_DEP_KODE = 'TR';

    // =========================================================================
    //  MAPPING: kode rekening lama  →  account_code pada aplikasi baru
    // =========================================================================
    // Format: 'rek_kode_lama' => 'account_code_baru'
    // Berdasarkan pemetaan acc_ifmrekeningcoabu.csv → AccountSeeder.php
    //
    // Kode rekening yang dipakai oleh SPR TRADA (dep_kode = TR):
    //   101.101, 101.211, 101.215, 103.101, 103.102, 103.201,
    //   108.201–108.301, 201.111, 201.112, 202.210, 202.220,
    //   204.010, 204.020, 400.250, 500.420, 500.430,
    //   620.xxx (beban adm & umum), 700.100, 700.200,
    //   800.100, 800.200, 800.300
    // =========================================================================
    private const REK_KODE_MAP = [

        // ── Kas & Bank ──────────────────────────────────────────────────────
        '101.101' => '1-1102', // Kas Besar
        '101.201' => '1-1106', // BRK Syariah AC. 1070801032 (div=SPR CL)
        '101.211' => '1-1107', // Bank BRK Syariah AC. 1200808288 (div=TR) — bukan Mandiri
        '101.212' => '1-1108', // BRK Syariah AC. 1072001615 / 101-05-04909
        '101.213' => '1-1107', // BRK Syariah AC. 120-05-55555
        '101.214' => '1-1109', // BRK Syariah AC. 191-08-00066
        '101.215' => '1-1108', // Bank CIMB Niaga Syariah AC. 860018922700 (div=TR)
        '101.216' => '1-1109', // BSI AC. 4455663372 → dipetakan ke 1-1109
        '101.301' => '1-3104', // Deposito BRK Syariah

        // ── Piutang Usaha ────────────────────────────────────────────────────
        '103.101' => '1-1201', // Koperasi Karyawan SPR
        '103.102' => '1-1201', // LPHD Rantau Kasih
        '103.103' => '1-1201', // Perumdam Tirta Siak
        '103.104' => '1-1201', // Perumdam Tirta Kampar
        '103.201' => '1-1201', // PT Sarana Pembangunan Riau
        '103.210' => '1-1201', // PT Sarana Pembangunan Riau
        '103.220' => '1-1201', // PT SPR Trada
        '103.231' => '1-1201', // Piutang Lain PT SPR Langgak
        '103.240' => '1-1201', // Piutang PT SPR Trada
        '103.260' => '1-1201', // Piutang PT SPR Cipta Lestari

        // ── Piutang Karyawan ─────────────────────────────────────────────────
        '103.301' => '1-1202', // Fuady Noor
        '103.303' => '1-1202', // Karyawan Lainnya

        // ── Piutang Lain-Lain ─────────────────────────────────────────────
        '103.401' => '1-1203', // Koperasi Karyawan SPR (pinjaman)
        '105.100' => '1-1203', // Piutang IFG Life (Imbalan Kerja)

        // ── Uang Muka / Panjar Kerja ──────────────────────────────────────
        '108.201' => '1-1405', // Hazairin Hamid
        '108.202' => '1-1405', // Salfian Daliandi
        '108.203' => '1-1405', // Rudiyanto
        '108.205' => '1-1405', // Panjar Kerja Kary. Lain
        '108.301' => '1-1405', // Bemi Hendrias

        // ── Aset Tetap ────────────────────────────────────────────────────
        '112.104' => '1-2401', // Inventaris Kantor → Peralatan Kantor

        // ── Aset Lainnya / Biaya Ditangguhkan ─────────────────────────────
        '113.201' => '1-3102', // Uang Muka Amdal → Aset Dalam Penyelesaian
        '115.100' => '1-1401', // Biaya Bunga Xenia → Biaya Dibayar Dimuka
        '115.200' => '1-1401', // Biaya Bunga Innova
        '115.300' => '1-1401', // Biaya Bunga Xpander

        // ── Hutang Usaha & Hutang Lain ────────────────────────────────────
        '201.111' => '2-1101', // SPR Langgak
        '201.112' => '2-1101', // SPR Cipta Lestari
        '201.140' => '2-1101', // PT PP Tirta Riau
        '201.160' => '2-1104', // Lain-lain → Hutang Lain-Lain
        '201.172' => '2-1101', // Aktuaria
        '201.173' => '2-1101', // Konsultan Hukum
        '201.210' => '2-1104', // Hutang PT SPR Trada
        '201.221' => '2-1104', // Hutang Cashcall PT SPR Langgak
        '201.222' => '2-1104', // Hutang Lain PT SPR Langgak
        '202.100' => '2-1104', // Pemerintah Provinsi Riau
        '202.200' => '2-1104', // Hutang Lain-Lain
        '202.210' => '2-1104', // Lain-lain
        '202.220' => '2-1104', // Utang ke Koperasi Rantau Kasih

        // ── Biaya Masih Harus Dibayar ─────────────────────────────────────
        '203.001' => '2-1305', // Listrik
        '203.002' => '2-1305', // Telepon & Internet
        '203.003' => '2-1305', // Gaji Karyawan
        '203.004' => '2-1305', // Biaya Perjalanan Dinas
        '203.008' => '2-1305', // Zakat
        '203.009' => '2-1305', // Biaya Lain yang Masih Harus Dibayar

        // ── Hutang Pajak ──────────────────────────────────────────────────
        '204.001' => '2-1301', // Hutang PPN
        '204.002' => '2-1302', // Hutang PPh 21
        '204.003' => '2-1303', // Hutang PPh 23
        '204.010' => '2-1302', // Hutang PPh 21
        '204.020' => '2-1303', // Hutang PPh 23

        // ── Hutang Leasing / Pembiayaan ───────────────────────────────────
        '207.101' => '2-2103', // Pembiayaan Xenia
        '207.102' => '2-2103', // Pembiayaan Innova
        '207.103' => '2-2103', // Pembiayaan Xpander

        // ── Liabilitas Lainnya ────────────────────────────────────────────
        '210.200' => '2-1307', // Jasa Produksi → Uang Muka Pelanggan
        '210.300' => '2-2101', // Kewajiban Imbalan Kerja → Hutang JK Panjang

        // ── Ekuitas ───────────────────────────────────────────────────────
        '300.500' => '3-2001', // Cadangan Umum → Laba Ditahan
        '300.610' => '3-2001', // Laba/Rugi s/d Tahun Lalu
        '300.630' => '3-2001', // Koreksi Laba/Rugi Ditahan

        // ── Pendapatan ────────────────────────────────────────────────────
        '400.110' => '4-1001', // Pendapatan Equity Share Langgak → Penjualan
        '400.120' => '4-1001', // DMO Fee Langgak
        '400.130' => '5-4004', // Corporate & Dividend Tax → Beban Pajak
        '400.250' => '4-1001', // Pendapatan Komoditas Pangan
        '400.300' => '4-2005', // Pengujian Kualitas Air Limbah → Pendapatan Lain

        // ── HPP & Beban Operasional Khusus (500.xxx) ─────────────────────
        '500.100' => '5-1001', // Beban Cost Recovery Langgak → HPP
        '500.202' => '5-3101', // Gaji Karyawan
        '500.203' => '5-3503', // Beban Konsultan
        '500.204' => '5-3707', // Denda Pajak → Beban Denda & Sanksi
        '500.205' => '5-4005', // Beban Lain-Lain
        '500.206' => '5-3205', // Beban Rapat → Beban Konsumsi & Jamuan
        '500.208' => '5-3704', // Beban Perjalanan Dinas
        '500.209' => '5-3706', // Beban Representatif → Entertainment
        '500.210' => '5-3205', // Beban Pengobatan → Beban Konsumsi
        '500.211' => '5-2301', // Beban Transportasi → Pengiriman Barang
        '500.212' => '5-4005', // Beban Sumbangan → Beban Lain-Lain
        '500.213' => '5-3202', // Beban Telepon/Fax
        '500.300' => '5-1001', // Sharing Cost → HPP
        '500.420' => '5-1001', // Biaya Tenaga Kerja → HPP
        '500.430' => '5-1001', // Biaya Overhead → HPP

        // ── Beban Administrasi & Umum (620.xxx) ──────────────────────────
        '620' => '5-3000', // Group header beban (dilewati jika saldo 0)
        '620.011' => '5-3101', // Gaji Direksi & Komisaris → Gaji Adm
        '620.012' => '5-3104', // THR/Tunjangan → THR & Bonus
        '620.014' => '5-3103', // Lembur → Tunjangan Karyawan
        '620.015' => '5-3103', // Tunjangan Cuti
        '620.016' => '5-3103', // Tunjangan Cuti
        '620.017' => '5-3103', // Tunjangan Pesangon
        '620.021' => '5-3206', // Computer Supplies → Perlengkapan Kantor (baterai, hardisk, mouse pad — bukan ATK)
        '620.031' => '5-3203', // Alat Tulis Kantor
        '620.032' => '5-3206', // Cetakan → Perlengkapan Kantor
        '620.033' => '5-3203', // Fotocopy → ATK
        '620.040' => '5-3201', // Beban Listrik
        '620.050' => '5-3202', // Beban Telepon/Fax
        '620.061' => '5-3302', // Beban Pemeliharaan Bangunan
        '620.062' => '5-3303', // Beban Pemeliharaan Inventaris → Peralatan
        '620.070' => '5-3704', // Beban Perjalanan Dinas
        '620.081' => '5-3701', // Beban Perizinan → Perizinan & Retribusi (pajak STNK kendaraan — bukan konsultan)
        '620.082' => '5-3503', // Beban Konsultan
        '620.083' => '5-3503', // Beban Pengembangan Usaha
        '620.090' => '5-3105', // Beban Asuransi → seluruh transaksi TR adalah iuran BPJS
        '620.101' => '5-3205', // Beban Konsumsi
        '620.102' => '5-3705', // Beban Pendidikan & Latihan
        '620.103' => '5-3703', // Beban Pengiriman Dokumen → Materai & Pos
        '620.104' => '5-3206', // Beban Majalah → Perlengkapan
        '620.105' => '5-3704', // Beban Transportasi → Perjalanan Dinas (travel darat, feri — bukan entertainment)
        '620.106' => '5-3706', // Beban Entertaint
        '620.107' => '5-4005', // Sumbangan → Beban Lain-Lain (kado pernikahan, bantuan dana, jenguk sakit — bukan parkir)
        '620.108' => '5-2304', // Parkir & Toll
        '620.109' => '5-3205', // Beban Rapat → Konsumsi
        '620.110' => '5-2201', // Iklan & Promosi
        '620.111' => '5-4005', // Beban Umum Lain-Lain
        '620.112' => '5-3206', // Papan Bunga → Perlengkapan
        '620.113' => '5-3103', // Pengobatan → Tunjangan Karyawan (biaya pengobatan komisaris & karyawan — bukan kebersihan)
        '620.114' => '5-3205', // Pengobatan → Konsumsi
        '620.170' => '5-3102', // Beban Imbalan Kerja → Jasa Pengabdian Komisaris → Gaji Direksi & Manajemen
        '620.181' => '5-2302', // Beban BBM
        '620.182' => '5-2303', // Beban Pemeliharaan Kendaraan
        '620.191' => '5-4004', // PPh Pasal 21 (beban) → Beban Pajak Penghasilan
        '620.194' => '5-4004', // PPN (beban)
        '620.195' => '5-3707', // Denda Pajak → Beban Denda & Sanksi
        '620.210' => '5-3206', // Perlengkapan Kantor
        '620.211' => '5-3206', // Seragam Kantor
        '620.212' => '5-3206', // Perlengkapan Kantor Lainnya

        // ── Pendapatan Lain (700.xxx) ─────────────────────────────────────
        '700.100' => '4-2005', // Fee Kerjasama → Pendapatan Lain-Lain (fee tegakan kayu, fee LPHD — bukan bunga)
        '700.200' => '4-2001', // Jasa Giro
        '700.410' => '4-2005', // Pendapatan Lain-Lainnya

        // ── Beban Keuangan / Bank (800.xxx) ──────────────────────────────
        '800.100' => '5-3702', // Administrasi Umum → Administrasi Bank
        '800.200' => '5-3702', // Materai Bank → Administrasi Bank (buku cek CIMB Niaga — bukan materai & pos)
        '800.300' => '5-4004', // Pajak Jasa Giro → Beban Pajak Penghasilan
        '800.400' => '5-4001', // Beban Bunga Pinjaman
    ];

    // Mapping jur_type lama → journal_type baru
    private const TYPE_MAP = [
        'BM' => 'Bank Masuk',
        'BK' => 'Bank Keluar',
        'KM' => 'Kas Masuk',
        'KK' => 'Kas Keluar',
        'JM' => 'Umum',
    ];

    // =========================================================================

    /** Cache account_code → id agar tidak query berulang */
    private array $accountCache = [];

    /** Cache 'YYYY-MM' → fiscal_period_id */
    private array $periodCache = [];

    /** Statistik untuk laporan akhir */
    private array $stats = [
        'entries_inserted' => 0,
        'entries_skipped' => 0,
        'details_inserted' => 0,
        'details_skipped' => 0,
        'unmapped_codes' => [],
    ];

    // =========================================================================

    public function run(): void
    {
        $this->command->info('═══════════════════════════════════════════════════════');
        $this->command->info('  Journal Seeder — Initial Balance SPR TRADA (dep_kode = TR)');
        $this->command->info('═══════════════════════════════════════════════════════');

        // ── 1. Muat CSV ──────────────────────────────────────────────────────
        $allHeaders = $this->loadCsv(database_path('seeders/data/acc_iftjurnalhdr.csv'));
        $allDetails = $this->loadCsv(database_path('seeders/data/acc_iftjurnaldtl.csv'));

        $this->command->info('  Header jurnal (total)  : '.count($allHeaders).' baris');
        $this->command->info('  Detail jurnal (total)  : '.count($allDetails).' baris');

        // ── 2. Filter hanya SPR TRADA (dep_kode = TR) ───────────────────────
        $headers = array_filter(
            $allHeaders,
            fn ($row) => strtoupper(trim($row['dep_kode'])) === self::FILTER_DEP_KODE
        );
        $headers = array_values($headers);

        // Kumpulkan nobkt milik Trada agar filter detail lebih cepat
        $tradaNobktSet = array_flip(array_column($headers, 'jur_nobkt'));

        $details = array_filter(
            $allDetails,
            fn ($row) => isset($tradaNobktSet[trim($row['jur_nobkt'])])
        );
        $details = array_values($details);

        $this->command->info('  Header jurnal (Trada)  : '.count($headers).' baris');
        $this->command->info('  Detail jurnal (Trada)  : '.count($details).' baris');

        // ── 3. Bangun cache ──────────────────────────────────────────────────
        $this->buildAccountCache();
        $this->command->info('  Account cache : '.count($this->accountCache).' akun dimuat');

        // ── 4. Kelompokkan detail berdasarkan jur_nobkt ──────────────────────
        $detailsByNobkt = [];
        foreach ($details as $row) {
            $detailsByNobkt[$row['jur_nobkt']][] = $row;
        }

        // ── 5. Ambil default user_id ─────────────────────────────────────────
        $defaultUserId = DB::table('users')->value('id');
        if (! $defaultUserId) {
            $this->command->error('  Tabel users kosong. Jalankan UserSeeder terlebih dahulu.');

            return;
        }

        // ── 6. Proses per chunk ──────────────────────────────────────────────
        $chunks = array_chunk($headers, 100);
        $total = count($chunks);

        DB::disableQueryLog();

        foreach ($chunks as $idx => $chunk) {
            DB::beginTransaction();
            try {
                foreach ($chunk as $hdr) {
                    $this->processEntry($hdr, $detailsByNobkt, $defaultUserId);
                }
                DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();
                $this->command->error('  Chunk '.($idx + 1).' GAGAL: '.$e->getMessage());
                throw $e;
            }

            if (($idx + 1) % 5 === 0 || ($idx + 1) === $total) {
                $this->command->info(sprintf(
                    '  [%d/%d] Entry: %d insert, %d lewati | Detail: %d insert, %d lewati',
                    $idx + 1,
                    $total,
                    $this->stats['entries_inserted'],
                    $this->stats['entries_skipped'],
                    $this->stats['details_inserted'],
                    $this->stats['details_skipped'],
                ));
            }
        }

        $this->printSummary();
    }

    // =========================================================================
    //  PROSES SATU ENTRY
    // =========================================================================

    private function processEntry(array $hdr, array &$detailsByNobkt, int $defaultUserId): void
    {
        $nobkt = trim($hdr['jur_nobkt']);

        // Idempoten: lewati jika entry_number sudah ada
        if (DB::table('journal_entries')->where('entry_number', $nobkt)->exists()) {
            $this->stats['entries_skipped']++;

            return;
        }

        $entryDate = $this->parseDate($hdr['jur_tgl']);
        $journalType = self::TYPE_MAP[strtoupper(trim($hdr['jur_type']))] ?? 'Umum';
        $isPosted = strtoupper(trim($hdr['jur_post'])) === 'T';
        $fiscalId = $this->getFiscalPeriodId($entryDate);

        // Tentukan penerima: utamakan jur_pihak1, fallback ke jur_pihak2
        $penerima = $this->cleanString($hdr['jur_pihak1'])
            ?? $this->cleanString($hdr['jur_pihak2']);

        $entryId = DB::table('journal_entries')->insertGetId([
            'entry_date' => $entryDate,
            'entry_number' => $nobkt,
            'penerima' => $penerima,
            'journal_type' => $journalType,
            'status' => $isPosted ? 'Posted' : 'Draft',
            'fiscal_period_id' => $fiscalId,
            'user_id' => $defaultUserId,
            'posted_at' => $isPosted ? $this->parseTimestamp($hdr['jur_tglpos'], '00:00:00') : null,
            'posted_by' => $isPosted ? $defaultUserId : null,
            'created_at' => $this->parseTimestamp($hdr['tgl_c'], $hdr['time_c']),
            'updated_at' => $this->parseTimestamp($hdr['tgl_m'], $hdr['time_m']),
        ]);

        $this->stats['entries_inserted']++;

        // Proses detail milik header ini — NET per rek_kode terlebih dahulu
        // agar nilai negatif dari sistem lama (potongan gaji, koreksi) tidak
        // menghasilkan posisi bank/beban yang terbalik (bank debet di BK, dsb).
        $rawDetails = $detailsByNobkt[$nobkt] ?? [];
        $this->processDetails($rawDetails, $entryId);
    }

    // =========================================================================
    //  PROSES DETAIL — NET PER AKUN SEBELUM INSERT
    // =========================================================================
    //
    //  Sistem lama menyimpan potongan (mis. BPJS karyawan, angsuran) sebagai
    //  nilai NEGATIF pada kolom jur_debet atau jur_kredit, bukan sebagai baris
    //  terpisah dengan posisi yang benar.  Jika langsung di-swap (negatif →
    //  sisi lain), hasilnya bank muncul di DEBET pada jurnal Bank Keluar dan
    //  beban muncul di KREDIT — keduanya terbalik secara akuntansi.
    //
    //  Solusi: NET semua baris per rek_kode dalam satu jurnal terlebih dahulu.
    //  Formula: net = Σ jur_debet − Σ jur_kredit
    //    net > 0  → INSERT sebagai DEBIT
    //    net < 0  → INSERT sebagai KREDIT (abs value)
    //    net = 0  → SKIP (saling hapus)
    //
    // =========================================================================

    private function processDetails(array $rawDetails, int $entryId): void
    {
        // ── 1. Net per rek_kode ─────────────────────────────────────────────
        // Struktur: rek_kode → ['net' => float, 'ket' => string, 'tgl_c' => ..., ...]
        $netMap = [];

        foreach ($rawDetails as $dtl) {
            $rekKode = trim($dtl['rek_kode']);
            $debit = (float) $dtl['jur_debet'];
            $credit = (float) $dtl['jur_kredit'];

            if (! isset($netMap[$rekKode])) {
                $netMap[$rekKode] = [
                    'net' => 0.0,
                    'ket' => '',
                    'tgl_c' => $dtl['tgl_c'],
                    'time_c' => $dtl['time_c'],
                    'tgl_m' => $dtl['tgl_m'],
                    'time_m' => $dtl['time_m'],
                ];
            }

            // net positif = DEBIT, net negatif = KREDIT
            $netMap[$rekKode]['net'] += $debit - $credit;

            // Ambil keterangan pertama yang tidak kosong
            if ($netMap[$rekKode]['ket'] === '') {
                $ket = trim($dtl['jur_ket']);
                if ($ket !== '') {
                    $netMap[$rekKode]['ket'] = $ket;
                }
            }
        }

        // ── 2. Insert satu baris per akun ───────────────────────────────────
        foreach ($netMap as $rekKode => $data) {
            $net = round($data['net'], 2);

            if ($net === 0.0) {
                // Saling hapus — skip (mis. transfer yang dikoreksi penuh)
                $this->stats['details_skipped']++;

                continue;
            }

            $debit = $net > 0 ? $net : 0.0;
            $credit = $net < 0 ? abs($net) : 0.0;

            $accountId = $this->resolveAccountId($rekKode);

            if ($accountId === null) {
                $this->stats['details_skipped']++;
                if (! in_array($rekKode, $this->stats['unmapped_codes'], true)) {
                    $this->stats['unmapped_codes'][] = $rekKode;
                }

                continue;
            }

            DB::table('journal_details')->insert([
                'journal_entry_id' => $entryId,
                'account_id' => $accountId,
                'description' => $this->cleanString($data['ket']),
                'debit' => $debit,
                'credit' => $credit,
                'created_at' => $this->parseTimestamp($data['tgl_c'], $data['time_c']),
                'updated_at' => $this->parseTimestamp($data['tgl_m'], $data['time_m']),
            ]);

            $this->stats['details_inserted']++;
        }
    }

    // =========================================================================
    //  HELPERS
    // =========================================================================

    /**
     * Resolve account_id:
     *  1. Cari via REK_KODE_MAP (old_code → new account_code → id)
     *  2. Fallback: cari old_code langsung di accountCache
     *     (berguna jika account_code di DB masih memakai format lama)
     */
    private function resolveAccountId(string $rekKode): ?int
    {
        $newCode = self::REK_KODE_MAP[$rekKode] ?? null;
        if ($newCode) {
            return $this->accountCache[$newCode] ?? null;
        }

        return $this->accountCache[$rekKode] ?? null;
    }

    /** Muat semua account_code → id ke dalam cache. */
    private function buildAccountCache(): void
    {
        $accounts = DB::table('accounts')->select('id', 'account_code')->get();
        foreach ($accounts as $acc) {
            $this->accountCache[$acc->account_code] = $acc->id;
        }
    }

    /**
     * Dapatkan fiscal_period_id, dengan dua strategi:
     *  - Strategi 1: kolom year (int) + month (int)
     *  - Strategi 2: start_date <= date <= end_date
     */
    private function getFiscalPeriodId(string $date): int
    {
        $key = substr($date, 0, 7);

        if (! isset($this->periodCache[$key])) {

            $id = DB::table('fiscal_periods')
                ->where('start_date', '<=', $date)
                ->where('end_date', '>=', $date)
                ->value('id');

            if (! $id) {
                throw new \RuntimeException(
                    "Fiscal period untuk {$key} tidak ditemukan."
                );
            }

            $this->periodCache[$key] = $id;
        }

        return $this->periodCache[$key];
    }

    /** Parse tanggal; fallback ke hari ini jika kosong / zero date. */
    private function parseDate(string $val): string
    {
        if (empty($val) || $val === '0000-00-00') {
            return now()->toDateString();
        }

        return Carbon::parse($val)->toDateString();
    }

    /** Parse timestamp dari kolom tgl + time CSV. */
    private function parseTimestamp(string $tgl, string $time): string
    {
        if (empty($tgl) || $tgl === '0000-00-00') {
            return now()->toDateTimeString();
        }
        $t = (! empty($time) && $time !== '00:00:00') ? $time : '00:00:00';
        try {
            return Carbon::parse("{$tgl} {$t}")->toDateTimeString();
        } catch (\Throwable) {
            return now()->toDateTimeString();
        }
    }

    /** Trim string dan return null jika kosong. */
    private function cleanString(?string $val): ?string
    {
        $val = trim((string) $val);

        return $val !== '' ? $val : null;
    }

    /** Baca CSV dan kembalikan array asosiatif. */
    private function loadCsv(string $path): array
    {
        if (! file_exists($path)) {
            throw new \RuntimeException("File CSV tidak ditemukan: {$path}");
        }

        $rows = [];
        $handle = fopen($path, 'r');
        $header = null;

        while (($line = fgetcsv($handle, 0, ',', '"')) !== false) {
            if ($header === null) {
                $header = $line;

                continue;
            }
            while (count($line) < count($header)) {
                $line[] = '';
            }
            $rows[] = array_combine($header, $line);
        }

        fclose($handle);

        return $rows;
    }

    /** Tampilkan ringkasan setelah proses selesai. */
    private function printSummary(): void
    {
        $this->command->info('');
        $this->command->info('═══════════════════════════════════════════════════════');
        $this->command->info('  SELESAI — Ringkasan Hasil (SPR TRADA / dep_kode = TR)');
        $this->command->info('───────────────────────────────────────────────────────');
        $this->command->info('  Journal Entries diinsert : '.$this->stats['entries_inserted']);
        $this->command->info('  Journal Entries dilewati : '.$this->stats['entries_skipped'].' (sudah ada / duplikat)');
        $this->command->info('  Journal Details diinsert : '.$this->stats['details_inserted']);
        $this->command->info('  Journal Details dilewati : '.$this->stats['details_skipped']);

        if (! empty($this->stats['unmapped_codes'])) {
            $this->command->warn('');
            $this->command->warn('  ⚠  Kode rekening TIDAK TERPETAKAN ('.count($this->stats['unmapped_codes']).' kode):');
            foreach ($this->stats['unmapped_codes'] as $code) {
                $this->command->warn("     - {$code}");
            }
            $this->command->warn('  Tambahkan kode tersebut ke const REK_KODE_MAP');
            $this->command->warn('  atau buat akun baru di AccountSeeder.');
        }

        $this->command->info('═══════════════════════════════════════════════════════');
    }
}
