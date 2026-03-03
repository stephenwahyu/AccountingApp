<?php

namespace App\Http\Controllers;

use App\Models\JournalEntry;
use App\Helpers\Terbilang;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;

class JurnalPDFController extends Controller
{
    public function print(JournalEntry $journal)
    {
        $journal->load(['journalDetails.account', 'user']);

        // Filter out cash/bank accounts for Cash/Bank vouchers
        // (Don't show the cash account itself in the voucher table as requested)
        $details = $journal->journalDetails;
        if (str_contains($journal->journal_type, 'Kas') || str_contains($journal->journal_type, 'Bank')) {
            $details = $journal->journalDetails->filter(function($detail) {
                return !$detail->account->is_cash_account;
            });
        }

        // Judul Voucher berdasarkan tipe
        $title = "Voucher Jurnal";
        if ($journal->journal_type === 'Kas Masuk') $title = "Penerimaan Kas";
        if ($journal->journal_type === 'Kas Keluar') $title = "Pengeluaran Kas";
        if ($journal->journal_type === 'Bank Masuk') $title = "Penerimaan Bank";
        if ($journal->journal_type === 'Bank Keluar') $title = "Pengeluaran Bank";
        if ($journal->journal_type === 'Umum') $title = "Jurnal Umum";

        // Hitung Total (Ambil dari Debit untuk pengeluaran/umum, atau Kredit)
        // Untuk voucher, kita biasanya menampilkan total nominal transaksi utama
        $total = 0;
        if (str_contains($journal->journal_type, 'Keluar') || $journal->journal_type === 'Umum') {
            $total = $journal->journalDetails->sum('debit');
        } else {
            $total = $journal->journalDetails->sum('credit');
        }

        $terbilang = trim(Terbilang::make($total)) . " Rupiah";

        $data = [
            'company_name' => config('app.company_name', 'PT. Sarana Pembangunan Riau'),
            'title' => $title,
            'journal' => $journal,
            'details' => $details,
            'total' => $total,
            'terbilang' => $terbilang,
        ];

        $html = View::make('pdf.jurnal-voucher', $data)->render();

        $options = new Options();
        $options->set('defaultFont', 'DejaVu Sans');
        $options->set('isRemoteEnabled', true);
        
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);

        // Ukuran A5 (Setengah A4) Portrait
        // A4 = 210x297mm, A5 = 148x210mm
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return response($dompdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="Jurnal-' . $journal->entry_number . '.pdf"',
        ]);
    }
}
