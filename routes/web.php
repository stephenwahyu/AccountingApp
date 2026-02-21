<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BaganPerkiraanController;
use App\Http\Controllers\BukuBesarController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\JurnalController;
use App\Http\Controllers\LaporanKeuanganController;
use App\Http\Controllers\NeracaSaldoController;
use App\Http\Controllers\PenggunaController;
use App\Http\Controllers\PeriodeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [AuthController::class, 'showLogin'])->middleware('guest')->name('login');
Route::post('/', [AuthController::class, 'storeLogin'])->middleware('guest');

Route::get('/forgot-password', [AuthController::class, 'showForgotPassword'])->middleware('guest')->name('password.request');
Route::post('/forgot-password', [AuthController::class, 'sendOtp'])->middleware('guest')->name('password.email');
Route::get('/reset-password', [AuthController::class, 'showResetPassword'])->middleware('guest')->name('password.reset');
Route::post('/reset-password', [AuthController::class, 'storeResetPassword'])->middleware('guest')->name('password.store');
Route::put('/reset-password', [AuthController::class, 'updatePassword'])->middleware('guest')->name('password.update');
Route::post('/resend-otp', [AuthController::class, 'resendOtp'])->middleware('guest')->name('password.resend');

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Jurnal Routes
    Route::prefix('jurnal')->name('jurnal.')->group(function () {
        // Semua Jurnal
        Route::get('/', [JurnalController::class, 'index'])->name('index');

        // Jurnal Umum
        Route::get('/umum', [JurnalController::class, 'umum'])->name('umum');
        Route::get('/umum/create', [JurnalController::class, 'umumCreate'])->name('umum.create');
        Route::post('/umum', [JurnalController::class, 'umumStore'])->name('umum.store');
        Route::get('/umum/{journal}/edit', [JurnalController::class, 'umumEdit'])->name('umum.edit');
        Route::put('/umum/{journal}', [JurnalController::class, 'umumUpdate'])->name('umum.update');

        // Jurnal Kas
        Route::get('/kas', [JurnalController::class, 'kas'])->name('kas');
        Route::get('/kas/pemasukan/create', [JurnalController::class, 'kasPemasukanCreate'])->name('kas.pemasukan.create');
        Route::post('/kas/pemasukan', [JurnalController::class, 'kasPemasukanStore'])->name('kas.pemasukan.store');
        Route::get('/kas/pemasukan/{journal}/edit', [JurnalController::class, 'kasPemasukanEdit'])->name('kas.pemasukan.edit');
        Route::put('/kas/pemasukan/{journal}', [JurnalController::class, 'kasPemasukanUpdate'])->name('kas.pemasukan.update');
        Route::get('/kas/pengeluaran/create', [JurnalController::class, 'kasPengeluaranCreate'])->name('kas.pengeluaran.create');
        Route::post('/kas/pengeluaran', [JurnalController::class, 'kasPengeluaranStore'])->name('kas.pengeluaran.store');
        Route::get('/kas/pengeluaran/{journal}/edit', [JurnalController::class, 'kasPengeluaranEdit'])->name('kas.pengeluaran.edit');
        Route::put('/kas/pengeluaran/{journal}', [JurnalController::class, 'kasPengeluaranUpdate'])->name('kas.pengeluaran.update');

        // Jurnal Bank
        Route::get('/bank', [JurnalController::class, 'bank'])->name('bank');
        Route::get('/bank/pemasukan/create', [JurnalController::class, 'bankPemasukanCreate'])->name('bank.pemasukan.create');
        Route::post('/bank/pemasukan', [JurnalController::class, 'bankPemasukanStore'])->name('bank.pemasukan.store');
        Route::get('/bank/pemasukan/{journal}/edit', [JurnalController::class, 'bankPemasukanEdit'])->name('bank.pemasukan.edit');
        Route::put('/bank/pemasukan/{journal}', [JurnalController::class, 'bankPemasukanUpdate'])->name('bank.pemasukan.update');
        Route::get('/bank/pengeluaran/create', [JurnalController::class, 'bankPengeluaranCreate'])->name('bank.pengeluaran.create');
        Route::post('/bank/pengeluaran', [JurnalController::class, 'bankPengeluaranStore'])->name('bank.pengeluaran.store');
        Route::get('/bank/pengeluaran/{journal}/edit', [JurnalController::class, 'bankPengeluaranEdit'])->name('bank.pengeluaran.edit');
        Route::put('/bank/pengeluaran/{journal}', [JurnalController::class, 'bankPengeluaranUpdate'])->name('bank.pengeluaran.update');

        // Detail & Actions
        Route::get('/{journal}', [JurnalController::class, 'show'])->name('show');
        Route::post('/{journal}/post', [JurnalController::class, 'postJournal'])->name('post');
        Route::delete('/{journal}', [JurnalController::class, 'destroy'])->name('destroy');
    });

    // Bagan Perkiraan Routes
    Route::prefix('bagan-perkiraan')->name('bagan-perkiraan.')->group(function () {
        Route::get('/', [BaganPerkiraanController::class, 'index'])->name('index');

        // Akun
        Route::get('/akun', [BaganPerkiraanController::class, 'akun'])->name('akun');
        Route::get('/akun/create', [BaganPerkiraanController::class, 'createAkun'])->name('akun.create');
        Route::post('/akun', [BaganPerkiraanController::class, 'storeAkun'])->name('akun.store');
        Route::get('/akun/{account}', [BaganPerkiraanController::class, 'showAkun'])->name('akun.show');
        Route::get('/akun/{account}/edit', [BaganPerkiraanController::class, 'editAkun'])->name('akun.edit');
        Route::put('/akun/{account}', [BaganPerkiraanController::class, 'updateAkun'])->name('akun.update');
        Route::delete('/akun/{account}', [BaganPerkiraanController::class, 'destroyAkun'])->name('akun.destroy');

        // Kategori Akun
        Route::get('/kategori-akun', [BaganPerkiraanController::class, 'kategoriAkun'])->name('kategori-akun');
        Route::get('/kategori-akun/create', [BaganPerkiraanController::class, 'createKategoriAkun'])->name('kategori-akun.create');
        Route::post('/kategori-akun', [BaganPerkiraanController::class, 'storeKategoriAkun'])->name('kategori-akun.store');
        Route::get('/kategori-akun/{kategori_akun}/edit', [BaganPerkiraanController::class, 'editKategoriAkun'])->name('kategori-akun.edit');
        Route::put('/kategori-akun/{kategori_akun}', [BaganPerkiraanController::class, 'updateKategoriAkun'])->name('kategori-akun.update');
        Route::delete('/kategori-akun/{kategori_akun}', [BaganPerkiraanController::class, 'destroyKategoriAkun'])->name('kategori-akun.destroy');

        // Tipe Akun
        Route::get('/tipe-akun', [BaganPerkiraanController::class, 'tipeAkun'])->name('tipe-akun');
        Route::get('/tipe-akun/create', [BaganPerkiraanController::class, 'createTipeAkun'])->name('tipe-akun.create');
        Route::post('/tipe-akun', [BaganPerkiraanController::class, 'storeTipeAkun'])->name('tipe-akun.store');
        Route::get('/tipe-akun/{tipe_akun}/edit', [BaganPerkiraanController::class, 'editTipeAkun'])->name('tipe-akun.edit');
        Route::put('/tipe-akun/{tipe_akun}', [BaganPerkiraanController::class, 'updateTipeAkun'])->name('tipe-akun.update');
        Route::delete('/tipe-akun/{tipe_akun}', [BaganPerkiraanController::class, 'destroyTipeAkun'])->name('tipe-akun.destroy');
    });

    Route::get('/buku-besar', [BukuBesarController::class, 'index'])->name('buku-besar');
    Route::get('/buku-besar/export', [BukuBesarController::class, 'export'])->name('buku-besar.export');
    Route::get('/neraca-saldo', [NeracaSaldoController::class, 'index'])->name('neraca-saldo');
    Route::get('/neraca-saldo/export', [NeracaSaldoController::class, 'export'])->name('neraca-saldo.export');

    Route::prefix('laporan-keuangan')->name('laporan-keuangan.')->group(function () {
        // Route::get('/', [LaporanKeuanganController::class, 'semua'])->name('semua');

        // Posisi Keuangan (Neraca)
        Route::get('/posisi-keuangan', [LaporanKeuanganController::class, 'posisiKeuangan'])->name('posisi-keuangan');
        Route::get('/posisi-keuangan/{id}', [LaporanKeuanganController::class, 'showPosisiKeuangan'])->name('posisi-keuangan.show');

        // Laba Rugi
        Route::get('/laba-rugi', [LaporanKeuanganController::class, 'labaRugi'])->name('laba-rugi');
        Route::get('/laba-rugi/{id}', [LaporanKeuanganController::class, 'showLabaRugi'])->name('laba-rugi.show');

        // Arus Kas
        Route::get('/arus-kas', [LaporanKeuanganController::class, 'arusKas'])->name('arus-kas');
        Route::get('/arus-kas/{id}', [LaporanKeuanganController::class, 'showArusKas'])->name('arus-kas.show');

        // Perubahan Ekuitas
        Route::get('/perubahan-ekuitas', [LaporanKeuanganController::class, 'perubahanEkuitas'])->name('perubahan-ekuitas');
        Route::get('/perubahan-ekuitas/{id}', [LaporanKeuanganController::class, 'showPerubahanEkuitas'])->name('perubahan-ekuitas.show');
    });

    Route::prefix('periode')->name('periode.')->group(function () {
        Route::get('/', [PeriodeController::class, 'index'])->name('index');

        Route::post('/{period}/close', [PeriodeController::class, 'close'])->name('close');
        Route::post('/{period}/open', [PeriodeController::class, 'open'])->name('open');
    });

    Route::prefix('pengguna')->name('pengguna.')->group(function () {
        Route::get('/', [PenggunaController::class, 'index'])->name('index');
        Route::get('/create', [PenggunaController::class, 'create'])->name('create');
        Route::post('/', [PenggunaController::class, 'store'])->name('store');
        Route::get('/{user}', [PenggunaController::class, 'show'])->name('show');
        Route::get('/{user}/edit', [PenggunaController::class, 'edit'])->name('edit');
        Route::put('/{user}', [PenggunaController::class, 'update'])->name('update');
        Route::delete('/{user}', [PenggunaController::class, 'destroy'])->name('destroy');
    });
});
