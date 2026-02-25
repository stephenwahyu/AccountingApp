{{-- resources/views/pdf/perubahan-ekuitas.blade.php --}}
@php
    use Carbon\Carbon;

    function fmtRp($value): string {
        if ($value === null || $value === '') return '-';
        $v = floatval($value);
        $fmt = number_format(abs($v), 0, ',', '.');
        return $v < 0 ? '(' . $fmt . ')' : $fmt;
    }

    $period       = $report['period'];
    $startDate    = Carbon::parse($period['start_date'])->locale('id')->isoFormat('D MMMM Y');
    $endDate      = Carbon::parse($period['end_date'])->locale('id')->isoFormat('D MMMM Y');
    $beginBal     = floatval($report['beginning_balance']['total'] ?? 0);
    $netIncome    = floatval($report['changes']['net_income'] ?? 0);
    $others       = floatval($report['changes']['others'] ?? 0);
    $totalChanges = $netIncome + $others;
    $endBal       = floatval($report['ending_balance']['total'] ?? 0);
@endphp
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Laporan Perubahan Ekuitas - {{ $period['period_name'] }}</title>
    @include('pdf.partials.styles')
</head>
<body>
<div class="page">

    {{-- HEADER --}}
    <div class="report-header">
        <div class="company-name">{{ $report['company_name'] ?? config('app.name') }}</div>
        <div class="report-type">LAPORAN PERUBAHAN EKUITAS</div>
        <div class="report-period">Periode yang Berakhir pada {{ $endDate }}</div>
        <div class="report-currency">(Dalam Rupiah)</div>
    </div>

    {{-- TABLE --}}
    <table class="report-table">
        <thead>
            <tr>
                <th class="col-label"></th>
                <th class="col-value th-value">Jumlah</th>
            </tr>
        </thead>
        <tbody>

            {{-- SALDO AWAL --}}
            <tr class="tr-pe-header">
                <td colspan="2">SALDO AWAL PER {{ strtoupper($startDate) }}</td>
            </tr>
            <tr class="tr-item">
                <td>Jumlah Ekuitas Awal</td>
                <td class="col-value">{{ fmtRp($beginBal) }}</td>
            </tr>

            <tr class="tr-spacer"><td colspan="2">&nbsp;</td></tr>

            {{-- PERUBAHAN EKUITAS --}}
            <tr class="tr-section">
                <td colspan="2">PERUBAHAN EKUITAS</td>
            </tr>

            <tr class="tr-pe-section">
                <td colspan="2">Perubahan Selama Periode Berjalan</td>
            </tr>

            <tr class="tr-pe-change">
                <td>Laba (Rugi) Bersih Periode Berjalan</td>
                <td class="col-value">{{ fmtRp($netIncome) }}</td>
            </tr>

            @if($others != 0)
            <tr class="tr-pe-change">
                <td>Perubahan Modal Lainnya</td>
                <td class="col-value">{{ fmtRp($others) }}</td>
            </tr>
            @endif

            {{-- Additional custom changes if provided --}}
            @foreach($report['custom_changes'] ?? [] as $change)
            <tr class="tr-pe-change">
                <td>{{ $change['label'] }}</td>
                <td class="col-value">{{ fmtRp($change['value']) }}</td>
            </tr>
            @endforeach

            <tr class="tr-spacer"><td colspan="2"></td></tr>

            <tr class="tr-subtotal">
                <td>Total Kenaikan (Penurunan) Ekuitas</td>
                <td class="col-value">{{ fmtRp($totalChanges) }}</td>
            </tr>

            <tr class="tr-spacer"><td colspan="2">&nbsp;</td></tr>

            {{-- SALDO AKHIR --}}
            <tr class="tr-total">
                <td>SALDO AKHIR PER {{ strtoupper($endDate) }}</td>
                <td class="col-value">{{ fmtRp($endBal) }}</td>
            </tr>

        </tbody>
    </table>

    {{-- FOOTER --}}
    <div class="footer-note">
        {{ $report['catatan_bawah'] ?? 'Catatan atas laporan keuangan merupakan bagian tidak terpisahkan dari laporan keuangan secara keseluruhan.' }}
    </div>

    {{-- <table class="signature-area">
        <tr>
            <td>
                <div class="signature-label">Dibuat Oleh,</div>
                <div class="signature-blank"></div>
                <div class="signature-line">Accounting</div>
            </td>
            <td>
                <div class="signature-label">Disetujui Oleh,</div>
                <div class="signature-blank"></div>
                <div class="signature-line">Direktur Utama</div>
            </td>
        </tr>
    </table> --}}

    <div class="page-number">1</div>

</div>
</body>
</html>
