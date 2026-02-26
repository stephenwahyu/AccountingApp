<?php

namespace App\Mail;

use App\Models\FiscalPeriod;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FiscalPeriodClosedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public FiscalPeriod $period,
        public array $reportsRawData
    ) {
        //
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Notifikasi Penutupan Periode: '.$this->period->period_name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.fiscal-period-closed',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $attachments = [];
        $date = date('Ymd');

        if (isset($this->reportsRawData['posisi_keuangan'])) {
            $attachments[] = Attachment::fromData(fn () => $this->reportsRawData['posisi_keuangan'], 'laporan-posisi-keuangan-'.$date.'.pdf')
                ->withMime('application/pdf');
        }

        if (isset($this->reportsRawData['laba_rugi'])) {
            $attachments[] = Attachment::fromData(fn () => $this->reportsRawData['laba_rugi'], 'laporan-laba-rugi-'.$date.'.pdf')
                ->withMime('application/pdf');
        }

        if (isset($this->reportsRawData['arus_kas'])) {
            $attachments[] = Attachment::fromData(fn () => $this->reportsRawData['arus_kas'], 'laporan-arus-kas-'.$date.'.pdf')
                ->withMime('application/pdf');
        }

        if (isset($this->reportsRawData['perubahan_ekuitas'])) {
            $attachments[] = Attachment::fromData(fn () => $this->reportsRawData['perubahan_ekuitas'], 'laporan-perubahan-ekuitas-'.$date.'.pdf')
                ->withMime('application/pdf');
        }

        return $attachments;
    }
}
