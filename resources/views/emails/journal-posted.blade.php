<!DOCTYPE html>
<html>
<head>
    <title>Voucher Jurnal Transaksi</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { width: 80%; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .header { border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f8f9fa; }
        .footer { margin-top: 30px; font-size: 0.9em; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Voucher Jurnal Transaksi</h2>
        </div>
        
        <p>Halo,</p>
        <p>Jurnal transaksi berikut telah berhasil di-posting ke dalam sistem. Silakan lihat file PDF yang dilampirkan pada email ini untuk rincian Voucher Transaksi lengkap.</p>
        
        <table>
            <tr>
                <th width="30%">Nomor Jurnal</th>
                <td>{{ $journal->entry_number }}</td>
            </tr>
            <tr>
                <th>Tanggal</th>
                <td>{{ $journal->entry_date->format('d F Y') }}</td>
            </tr>
            <tr>
                <th>Tipe Jurnal</th>
                <td>{{ $journal->journal_type }}</td>
            </tr>
            <tr>
                <th>Periode</th>
                <td>{{ $journal->fiscalPeriod->period_name }}</td>
            </tr>
            <tr>
                <th>Penerima</th>
                <td>{{ $journal->penerima ?: '-' }}</td>
            </tr>
        </table>

        <p style="margin-top: 20px;">Detail rincian akun dan nominal dapat Anda temukan pada lampiran dokumen PDF.</p>

        <div class="footer">
            <p>Email ini dikirim secara otomatis oleh Sistem Akuntansi.</p>
        </div>
    </div>
</body>
</html>
