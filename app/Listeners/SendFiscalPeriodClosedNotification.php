<?php

namespace App\Listeners;

use App\Events\FiscalPeriodClosed;
use App\Mail\FiscalPeriodClosedMail;
use App\Services\LaporanKeuanganPDFService;
use App\Services\LaporanKeuanganService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class SendFiscalPeriodClosedNotification implements ShouldQueue
{
    /**
     * Create the event listener.
     */
    public function __construct(
        protected LaporanKeuanganService $laporanService,
        protected LaporanKeuanganPDFService $pdfService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(FiscalPeriodClosed $event): void
    {
        $period = $event->period;

        // Generate reports data
        $posisiKeuangan = $this->laporanService->getPosisiKeuangan($period);
        $labaRugi = $this->laporanService->getLabaRugi($period);
        $arusKas = $this->laporanService->getArusKas($period);
        $perubahanEkuitas = $this->laporanService->getPerubahanEkuitas($period);

        // Generate raw PDF data
        $reportsRawData = [
            'posisi_keuangan' => $this->pdfService->getRawPosisiKeuangan($posisiKeuangan),
            'laba_rugi' => $this->pdfService->getRawLabaRugi($labaRugi),
            'arus_kas' => $this->pdfService->getRawArusKas($arusKas),
            'perubahan_ekuitas' => $this->pdfService->getRawPerubahanEkuitas($perubahanEkuitas),
        ];

        // Recipient (e.g., the user who closed it or a default admin)
        $recipient = $period->closedByUser->email ?? config('mail.from.address');

        if ($recipient) {
            Mail::to($recipient)->send(new FiscalPeriodClosedMail($period, $reportsRawData));
        }
    }
}
