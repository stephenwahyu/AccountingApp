<?php

namespace App\Http\Controllers;

use App\Models\FiscalPeriod;
use App\Services\LaporanKeuanganService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LaporanKeuanganController extends Controller
{
    public function __construct(protected LaporanKeuanganService $laporanService) {}

    public function semua(): Response
    {
        $periods = FiscalPeriod::orderBy('end_date', 'desc')
            ->orderByRaw("FIELD(period_type, 'annually', 'quarterly', 'monthly') ASC")
            ->get(['id', 'period_name', 'start_date', 'end_date', 'status']);

        return Inertia::render('laporankeuangan/semua', [
            'periods' => $periods,
        ]);
    }

    public function posisiKeuangan(): Response
    {
        $periods = FiscalPeriod::orderBy('end_date', 'desc')
            ->orderByRaw("FIELD(period_type, 'annually', 'quarterly', 'monthly') ASC")
            ->get(['id', 'period_name', 'start_date', 'end_date', 'status']);

        return Inertia::render('laporankeuangan/posisikeuangan', [
            'periods' => $periods,
        ]);
    }

    public function showPosisiKeuangan(Request $request, $id): Response
    {
        $period = FiscalPeriod::findOrFail($id);
        $report = $this->laporanService->getPosisiKeuangan($period);

        return Inertia::render('laporankeuangan/view/posisikeuangan', [
            'report' => $report,
        ]);
    }

    public function getPosisiKeuangan(Request $request)
    {
        $period = FiscalPeriod::findOrFail($request->period_id);

        return $this->laporanService->getPosisiKeuangan($period);
    }

    public function labaRugi(): Response
    {
        $periods = FiscalPeriod::orderBy('end_date', 'desc')
            ->orderByRaw("FIELD(period_type, 'annually', 'quarterly', 'monthly') ASC")
            ->get(['id', 'period_name', 'start_date', 'end_date', 'status']);

        return Inertia::render('laporankeuangan/labarugi', [
            'periods' => $periods,
        ]);
    }

    public function showLabaRugi(Request $request, $id): Response
    {
        $period = FiscalPeriod::findOrFail($id);
        $report = $this->laporanService->getLabaRugi($period);

        return Inertia::render('laporankeuangan/view/labarugi', [
            'report' => $report,
        ]);
    }

    public function getLabaRugi(Request $request)
    {
        $period = FiscalPeriod::findOrFail($request->period_id);

        return $this->laporanService->getLabaRugi($period);
    }

    public function arusKas(): Response
    {
        $periods = FiscalPeriod::orderBy('end_date', 'desc')
            ->orderByRaw("FIELD(period_type, 'annually', 'quarterly', 'monthly') ASC")
            ->get(['id', 'period_name', 'start_date', 'end_date', 'status']);

        return Inertia::render('laporankeuangan/aruskas', [
            'periods' => $periods,
        ]);
    }

    public function showArusKas(Request $request, $id): Response
    {
        $period = FiscalPeriod::findOrFail($id);
        $report = $this->laporanService->getArusKas($period);

        return Inertia::render('laporankeuangan/view/aruskas', [
            'report' => $report,
        ]);
    }

    public function getArusKas(Request $request)
    {
        $period = FiscalPeriod::findOrFail($request->period_id);

        return $this->laporanService->getArusKas($period);
    }

    public function perubahanEkuitas(): Response
    {
        $periods = FiscalPeriod::orderBy('end_date', 'desc')
            ->orderByRaw("FIELD(period_type, 'annually', 'quarterly', 'monthly') ASC")
            ->get(['id', 'period_name', 'start_date', 'end_date', 'status']);

        return Inertia::render('laporankeuangan/perubahanekuitas', [
            'periods' => $periods,
        ]);
    }

    public function showPerubahanEkuitas(Request $request, $id): Response
    {
        $period = FiscalPeriod::findOrFail($id);
        $report = $this->laporanService->getPerubahanEkuitas($period);

        return Inertia::render('laporankeuangan/view/perubahanekuitas', [
            'report' => $report,
        ]);
    }

    public function getPerubahanEkuitas(Request $request)
    {
        $period = FiscalPeriod::findOrFail($request->period_id);

        return $this->laporanService->getPerubahanEkuitas($period);
    }
}
