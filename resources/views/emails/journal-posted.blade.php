<!DOCTYPE html>
<html>
<head>
    <title>Notifikasi Posting Jurnal</title>
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
            <h2>Notifikasi Posting Jurnal</h2>
        </div>
        
        <p>Halo,</p>
        <p>Jurnal berikut telah berhasil di-posting:</p>
        
        <table>
            <tr>
                <th>Nomor Jurnal</th>
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
            <tr>
                <th>Di-posting Oleh</th>
                <td>{{ $journal->postedByUser->name ?? 'System' }}</td>
            </tr>
        </table>

        <h3>Detail Transaksi:</h3>
        <table>
            <thead>
                <tr>
                    <th>Akun</th>
                    <th>Deskripsi</th>
                    <th>Debit</th>
                    <th>Kredit</th>
                </tr>
            </thead>
            <tbody>
                @foreach($journal->journalDetails as $detail)
                <tr>
                    <td>{{ $detail->account->account_code }} - {{ $detail->account->account_name }}</td>
                    <td>{{ $detail->description }}</td>
                    <td style="text-align: right;">{{ number_format($detail->debit, 0, ',', '.') }}</td>
                    <td style="text-align: right;">{{ number_format($detail->credit, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="footer">
            <p>Email ini dikirim secara otomatis oleh Sistem Akuntansi.</p>
        </div>
    </div>
</body>
</html>
