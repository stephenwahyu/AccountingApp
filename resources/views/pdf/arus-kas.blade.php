{{-- resources/views/pdf/arus-kas.blade.php --}}
@php
    use Carbon\Carbon;
    use App\Helpers\CurrencyHelper;

    $period      = $report['period'];
    $endDate     = Carbon::parse($period['end_date'])->locale('id')->isoFormat('D MMMM Y');
    $operating   = $report['operating'];
    $investing   = $report['investing'];
    $financing   = $report['financing'];
    $beginCash   = floatval($report['beginning_cash'] ?? 0);
    $netFlow     = floatval($operating['total'] ?? 0)
                 + floatval($investing['total'] ?? 0)
                 + floatval($financing['total'] ?? 0);
    $endCash     = $beginCash + $netFlow;
@endphp
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Laporan Arus Kas - {{ $period['period_name'] }}</title>
    @include('pdf.partials.styles-laporan')
</head>
<body>
<div class="page">

    {{-- HEADER --}}
    <div class="report-header">
        <div class="company-name">{{ $report['company_name'] ?? config('app.name') }}</div>
        <div class="report-type">LAPORAN ARUS KAS</div>
        <div class="report-period">Periode yang Berakhir pada {{ $endDate }}</div>
        <div class="report-currency">(Dalam Rupiah)</div>
    </div>

    {{-- TABLE --}}
    <table class="report-table">
        <thead>
            <tr>
                <th class="col-label">Keterangan</th>
                <th class="col-value th-value">Jumlah</th>
            </tr>
        </thead>
        <tbody>

            {{-- ══════ AKTIVITAS OPERASI ══════ --}}
            <tr class="activity-header">
                <td colspan="2">AKTIVITAS OPERASI</td>
            </tr>
            @forelse($operating['items'] ?? [] as $item)
            <tr class="tr-activity-item">
                <td>{{ $item['description'] }}</td>
                <td class="col-value">{{ CurrencyHelper::format($item['balance']) }}</td>
            </tr>
            @empty
            <tr class="tr-activity-item">
                <td colspan="2" style="color:#999;font-style:italic;padding-left:18px;">Tidak ada aktivitas operasi</td>
            </tr>
            @endforelse
            <tr class="tr-activity-total">
                <td>Kas Bersih dari Aktivitas Operasi</td>
                <td class="col-value">{{ CurrencyHelper::format($operating['total'] ?? 0) }}</td>
            </tr>

            <tr class="tr-spacer"><td colspan="2">&nbsp;</td></tr>

            {{-- ══════ AKTIVITAS INVESTASI ══════ --}}
            <tr class="activity-header">
                <td colspan="2">AKTIVITAS INVESTASI</td>
            </tr>
            @forelse($investing['items'] ?? [] as $item)
            <tr class="tr-activity-item">
                <td>{{ $item['description'] }}</td>
                <td class="col-value">{{ CurrencyHelper::format($item['balance']) }}</td>
            </tr>
            @empty
            <tr class="tr-activity-item">
                <td colspan="2" style="color:#999;font-style:italic;padding-left:18px;">Tidak ada aktivitas investasi</td>
            </tr>
            @endforelse
            <tr class="tr-activity-total">
                <td>Kas Bersih dari Aktivitas Investasi</td>
                <td class="col-value">{{ CurrencyHelper::format($investing['total'] ?? 0) }}</td>
            </tr>

            <tr class="tr-spacer"><td colspan="2">&nbsp;</td></tr>

            {{-- ══════ AKTIVITAS PENDANAAN ══════ --}}
            <tr class="activity-header">
                <td colspan="2">AKTIVITAS PENDANAAN</td>
            </tr>
            @forelse($financing['items'] ?? [] as $item)
            <tr class="tr-activity-item">
                <td>{{ $item['description'] }}</td>
                <td class="col-value">{{ CurrencyHelper::format($item['balance']) }}</td>
            </tr>
            @empty
            <tr class="tr-activity-item">
                <td colspan="2" style="color:#999;font-style:italic;padding-left:18px;">Tidak ada aktivitas pendanaan</td>
            </tr>
            @endforelse
            <tr class="tr-activity-total">
                <td>Kas Bersih dari Aktivitas Pendanaan</td>
                <td class="col-value">{{ CurrencyHelper::format($financing['total'] ?? 0) }}</td>
            </tr>

            <tr class="tr-spacer"><td colspan="2">&nbsp;</td></tr>

            {{-- ══════ RINGKASAN KAS ══════ --}}
            <tr class="tr-subtotal">
                <td>Kenaikan (Penurunan) Bersih Kas dan Setara Kas</td>
                <td class="col-value">{{ CurrencyHelper::format($netFlow) }}</td>
            </tr>

            <tr class="tr-item">
                <td>Kas dan Setara Kas Awal Periode</td>
                <td class="col-value">{{ CurrencyHelper::format($beginCash) }}</td>
            </tr>

            <tr class="tr-spacer"><td colspan="2">&nbsp;</td></tr>

            {{-- SALDO AKHIR KAS --}}
            <tr class="tr-total">
                <td>KAS DAN SETARA KAS AKHIR PERIODE</td>
                <td class="col-value">{{ CurrencyHelper::format($endCash) }}</td>
            </tr>

        </tbody>
    </table>

    {{-- FOOTER --}}
    <div class="footer-note">
        {{ $report['catatan_bawah'] ?? 'Catatan atas laporan keuangan merupakan bagian tidak terpisahkan dari laporan keuangan secara keseluruhan.' }}
    </div>


    <div class="page-number">1</div>

</div>
</body>
</html>
