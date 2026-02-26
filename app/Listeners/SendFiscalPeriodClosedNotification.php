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

        // Fetch all users with role 'Direktur' and 'Akuntan'
        $recipients = \App\Models\User::whereHas('role', function ($query) {
            $query->whereIn('name', ['Direktur', 'Akuntan']);
        })->get();

        foreach ($recipients as $recipient) {
            if ($recipient->email) {
                Mail::to($recipient->email)->send(new FiscalPeriodClosedMail($period, $reportsRawData));
            }
        }
    }
}
