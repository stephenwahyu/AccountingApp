<?php

use App\Http\Controllers\JurnalController;
use Illuminate\Support\Facades\Route;

// Dashboard
Route::get('/', function () {
    return inertia('dashboard/dashboard');
})->name('dashboard');

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
    Route::get('/{id}', [JurnalController::class, 'show'])->name('show');
    Route::delete('/{id}', [JurnalController::class, 'destroy'])->name('destroy');
});