<?php

namespace App\Mail;

use App\Models\JournalEntry;
use App\Helpers\Terbilang;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\View;

class JournalPostedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(public JournalEntry $journal)
    {
        $this->journal->load(['journalDetails.account', 'user', 'fiscalPeriod', 'postedByUser']);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Voucher Jurnal: '.$this->journal->entry_number,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.journal-posted',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        // PDF Generation Logic (Same as JurnalPDFController)
        $title = "Voucher Jurnal";
        if ($this->journal->journal_type === 'Kas Masuk') $title = "Penerimaan Kas";
        if ($this->journal->journal_type === 'Kas Keluar') $title = "Pengeluaran Kas";
        if ($this->journal->journal_type === 'Bank Masuk') $title = "Penerimaan Bank";
        if ($this->journal->journal_type === 'Bank Keluar') $title = "Pengeluaran Bank";
        if ($this->journal->journal_type === 'Umum') $title = "Jurnal Umum";

        $total = 0;
        if (str_contains($this->journal->journal_type, 'Keluar') || $this->journal->journal_type === 'Umum') {
            $total = $this->journal->journalDetails->sum('debit');
        } else {
            $total = $this->journal->journalDetails->sum('credit');
        }

        $terbilang = trim(Terbilang::make($total)) . " Rupiah";

        $data = [
            'company_name' => config('app.company_name', 'PT. Sarana Pembangunan Riau'),
            'title' => $title,
            'journal' => $this->journal,
            'total' => $total,
            'terbilang' => $terbilang,
        ];

        $html = View::make('pdf.jurnal-voucher', $data)->render();

        $options = new Options();
        $options->set('defaultFont', 'DejaVu Sans');
        $options->set('isRemoteEnabled', true);
        
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return [
            Attachment::fromData(fn () => $dompdf->output(), 'Voucher-' . $this->journal->entry_number . '.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
