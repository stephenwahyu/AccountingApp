<!DOCTYPE html>
<html>
<head>
    <title>Notifikasi Penutupan Periode</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { width: 80%; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .header { border-bottom: 2px solid #28a745; padding-bottom: 10px; margin-bottom: 20px; }
        .footer { margin-top: 30px; font-size: 0.9em; color: #777; }
        .details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Notifikasi Penutupan Periode Fiskal</h2>
        </div>
        
        <p>Halo,</p>
        <p>Periode fiskal berikut telah ditutup:</p>
        
        <div class="details">
            <p><strong>Nama Periode:</strong> {{ $period->period_name }}</p>
            <p><strong>Rentang Tanggal:</strong> {{ \Carbon\Carbon::parse($period->start_date)->format('d M Y') }} - {{ \Carbon\Carbon::parse($period->end_date)->format('d M Y') }}</p>
            <p><strong>Tipe Periode:</strong> {{ ucfirst($period->period_type) }}</p>
            <p><strong>Ditutup Pada:</strong> {{ $period->closed_at ? \Carbon\Carbon::parse($period->closed_at)->format('d F Y, H:i') : '-' }}</p>
        </div>

        <p>Terlampir adalah laporan keuangan untuk periode tersebut yang meliputi:</p>
        <ul>
            <li>Laporan Posisi Keuangan</li>
            <li>Laporan Laba Rugi</li>
            <li>Laporan Arus Kas</li>
            <li>Laporan Perubahan Ekuitas</li>
        </ul>

        <div class="footer">
            <p>Email ini dikirim secara otomatis oleh Sistem Akuntansi.</p>
        </div>
    </div>
</body>
</html>
