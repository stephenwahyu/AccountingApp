<?php

namespace App\Services;

use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\View;

class LaporanKeuanganPDFService
{
    private function makeDompdf(): Dompdf
    {
        $options = new Options();
        $options->set('defaultFont', 'DejaVu Sans');
        $options->set('isRemoteEnabled', true);
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isFontSubsettingEnabled', true);
        $options->set('chroot', realpath(base_path()));

        return new Dompdf($options);
    }

    private function streamPDF(string $html, string $filename): \Illuminate\Http\Response
    {
        $dompdf = $this->makeDompdf();
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return response($dompdf->output(), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
            'Cache-Control'       => 'no-store, no-cache',
        ]);
    }

    public function posisiKeuangan(array $report): \Illuminate\Http\Response
    {
        $html = View::make('pdf.posisi-keuangan', compact('report'))->render();
        return $this->streamPDF($html, 'laporan-posisi-keuangan-' . date('Ymd') . '.pdf');
    }

    public function labaRugi(array $report): \Illuminate\Http\Response
    {
        $html = View::make('pdf.laba-rugi', compact('report'))->render();
        return $this->streamPDF($html, 'laporan-laba-rugi-' . date('Ymd') . '.pdf');
    }

    public function perubahanEkuitas(array $report): \Illuminate\Http\Response
    {
        $html = View::make('pdf.perubahan-ekuitas', compact('report'))->render();
        return $this->streamPDF($html, 'laporan-perubahan-ekuitas-' . date('Ymd') . '.pdf');
    }

    public function arusKas(array $report): \Illuminate\Http\Response
    {
        $html = View::make('pdf.arus-kas', compact('report'))->render();
        return $this->streamPDF($html, 'laporan-arus-kas-' . date('Ymd') . '.pdf');
    }
}