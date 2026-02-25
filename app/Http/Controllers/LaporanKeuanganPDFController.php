<?php

namespace App\Http\Controllers;

use App\Services\LaporanKeuanganPDFService;
use Illuminate\Http\Request;

/**
 * LaporanKeuanganPDFController
 *
 * Handles PDF generation for all 4 financial reports.
 * 
 * CARA PAKAI:
 * Ganti method getData*() di bawah dengan sumber data Anda.
 * Controller ini sudah siap digunakan — tinggal hubungkan ke model/service Anda.
 */
class LaporanKeuanganPDFController extends Controller
{
    public function __construct(
        private LaporanKeuanganPDFService $pdf,
        private LaporanKeuanganController $reportController
    ) {}

    // ─────────────────────────────────────────────────────────
    // ROUTES
    // ─────────────────────────────────────────────────────────

    /** GET /laporan-keuangan/posisi-keuangan/{period}/pdf */
    public function posisiKeuangan($period)
    {
        $request = new Request(['period_id' => $period]);
        $report = $this->reportController->getPosisiKeuangan($request);
        
        $report['company_name'] = config('app.company_name', config('app.name'));
        
        return $this->pdf->posisiKeuangan($report);
    }

    /** GET /laporan-keuangan/laba-rugi/{period}/pdf */
    public function labaRugi($period)
    {
        $request = new Request(['period_id' => $period]);
        $report = $this->reportController->getLabaRugi($request);
        
        $report['company_name'] = config('app.company_name', config('app.name'));
        
        return $this->pdf->labaRugi($report);
    }

    /** GET /laporan-keuangan/perubahan-ekuitas/{period}/pdf */
    public function perubahanEkuitas($period)
    {
        $request = new Request(['period_id' => $period]);
        $report = $this->reportController->getPerubahanEkuitas($request);
        
        $report['company_name'] = config('app.company_name', config('app.name'));
        
        return $this->pdf->perubahanEkuitas($report);
    }

    /** GET /laporan-keuangan/arus-kas/{period}/pdf */
    public function arusKas($period)
    {
        $request = new Request(['period_id' => $period]);
        $report = $this->reportController->getArusKas($request);
        
        $report['company_name'] = config('app.company_name', config('app.name'));
        
        return $this->pdf->arusKas($report);
    }

    // ─────────────────────────────────────────────────────────
    // DATA METHODS — REMOVED AS WE USE LaporanKeuanganController
    // ─────────────────────────────────────────────────────────
}
