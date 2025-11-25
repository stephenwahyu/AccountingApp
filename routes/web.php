<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return inertia('dashboard/dashboard');
});
Route::get('/jurnal', function () {
    return inertia('jurnal/semua');
});

Route::get('/jurnal/umum', function () {
    return inertia('jurnal/jurnalumum');
});

Route::get('/jurnal/kas', function () {
    return inertia('jurnal/jurnalkas');
});

Route::get('/jurnal/bank', function () {
    return inertia('jurnal/jurnalbank');
});