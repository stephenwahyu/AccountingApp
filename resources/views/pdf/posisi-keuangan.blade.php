{{-- resources/views/pdf/posisi-keuangan.blade.php --}}
@php
    use Carbon\Carbon;
    use App\Helpers\CurrencyHelper;

    $period      = $report['period'];
    $endDate     = Carbon::parse($period['end_date'])->locale('id')->isoFormat('D MMMM Y');
    $assets      = $report['assets'];
    $liabilities = $report['liabilities'];
    $equity      = $report['equity'];
    $totalLE     = ($liabilities['total'] ?? 0) + ($equity['total'] ?? 0);
    $isBalance   = abs(($assets['total'] ?? 0) - $totalLE) <= 1;
@endphp
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Laporan Posisi Keuangan - {{ $period['period_name'] }}</title>
    @include('pdf.partials.styles-laporan')
</head>
<body>
<div class="page">

    {{-- ═══════════════════ HEADER ═══════════════════ --}}
    <div class="report-header">
        <div class="company-name">{{ $report['company_name'] ?? config('app.name') }}</div>
        <div class="report-type">LAPORAN POSISI KEUANGAN</div>
        <div class="report-period">Tanggal {{ $endDate }}</div>
        <div class="report-currency">(Dalam Rupiah)</div>
    </div>

    {{-- ═══════════════════ TABLE ═══════════════════ --}}
    <table class="report-table">
        <thead>
            <tr>
                <th class="col-label">Keterangan</th>
                <th class="col-value th-value">Jumlah</th>
            </tr>
        </thead>
        <tbody>

            {{-- ══════ ASET ══════ --}}
            <tr class="tr-section">
                <td colspan="2">ASET</td>
            </tr>

            @foreach($assets['categories'] ?? [] as $cat)
            <tr class="tr-subsection">
                <td colspan="2">{{ $cat['category_name'] }}</td>
            </tr>
            @foreach($cat['accounts'] ?? [] as $acc)
            <tr class="tr-item">
                <td>{{ $acc['account_name'] }}</td>
                <td class="col-value">{{ CurrencyHelper::format($acc['balance']) }}</td>
            </tr>
            @endforeach
            <tr class="tr-subtotal">
                <td>Jumlah {{ $cat['category_name'] }}</td>
                <td class="col-value">{{ CurrencyHelper::format($cat['total'] ?? 0) }}</td>
            </tr>
            <tr class="tr-spacer"><td colspan="2"></td></tr>
            @endforeach

            {{-- JUMLAH ASET --}}
            <tr class="tr-total">
                <td>JUMLAH ASET</td>
                <td class="col-value">{{ CurrencyHelper::format($assets['total'] ?? 0) }}</td>
            </tr>

            <tr class="tr-spacer"><td colspan="2">&nbsp;</td></tr>

            {{-- ══════ LIABILITAS & EKUITAS ══════ --}}
            <tr class="tr-section">
                <td colspan="2">LIABILITAS DAN EKUITAS</td>
            </tr>
            <tr class="tr-section" style="padding-top:2px;">
                <td colspan="2">LIABILITAS</td>
            </tr>

            @foreach($liabilities['categories'] ?? [] as $cat)
            <tr class="tr-subsection">
                <td colspan="2">{{ $cat['category_name'] }}</td>
            </tr>
            @foreach($cat['accounts'] ?? [] as $acc)
            <tr class="tr-item">
                <td>{{ $acc['account_name'] }}</td>
                <td class="col-value">{{ CurrencyHelper::format($acc['balance']) }}</td>
            </tr>
            @endforeach
            <tr class="tr-subtotal">
                <td>Jumlah {{ $cat['category_name'] }}</td>
                <td class="col-value">{{ CurrencyHelper::format($cat['total'] ?? 0) }}</td>
            </tr>
            <tr class="tr-spacer"><td colspan="2"></td></tr>
            @endforeach

            <tr class="tr-total">
                <td>JUMLAH LIABILITAS</td>
                <td class="col-value">{{ CurrencyHelper::format($liabilities['total'] ?? 0) }}</td>
            </tr>

            <tr class="tr-spacer"><td colspan="2">&nbsp;</td></tr>

            {{-- EKUITAS --}}
            <tr class="tr-section">
                <td colspan="2">EKUITAS</td>
            </tr>
            @foreach($equity['categories'] ?? [] as $cat)
            <tr class="tr-subsection">
                <td colspan="2">{{ $cat['category_name'] }}</td>
            </tr>
            @foreach($cat['accounts'] ?? [] as $acc)
            <tr class="tr-item">
                <td>{{ $acc['account_name'] }}</td>
                <td class="col-value">{{ CurrencyHelper::format($acc['balance']) }}</td>
            </tr>
            @endforeach
            <tr class="tr-subtotal">
                <td>Jumlah {{ $cat['category_name'] }}</td>
                <td class="col-value">{{ CurrencyHelper::format($cat['total'] ?? 0) }}</td>
            </tr>
            <tr class="tr-spacer"><td colspan="2"></td></tr>
            @endforeach

            <tr class="tr-total">
                <td>JUMLAH EKUITAS{{ ($equity['total'] ?? 0) < 0 ? ' (DEFISIENSI)' : '' }}</td>
                <td class="col-value">{{ CurrencyHelper::format($equity['total'] ?? 0) }}</td>
            </tr>

            <tr class="tr-spacer"><td colspan="2">&nbsp;</td></tr>

            {{-- TOTAL LIABILITAS + EKUITAS --}}
            <tr class="tr-total">
                <td>JUMLAH LIABILITAS DAN EKUITAS{{ ($totalLE) < 0 ? ' (DEFISIENSI)' : '' }}</td>
                <td class="col-value">{{ CurrencyHelper::format($totalLE) }}</td>
            </tr>

            {{-- Balance warning --}}
            @if(!$isBalance)
            <tr>
                <td colspan="2" style="color:red;font-size:7.5pt;text-align:center;padding:6px 0;">
                    ⚠ Laporan tidak balance! Selisih: {{ CurrencyHelper::format(($assets['total'] ?? 0) - $totalLE) }}
                </td>
            </tr>
            @endif

        </tbody>
    </table>

    {{-- ═══════════════════ FOOTER ═══════════════════ --}}
    <div class="footer-note">
        {{ $report['catatan_bawah'] ?? 'Catatan atas laporan keuangan merupakan bagian tidak terpisahkan dari laporan keuangan secara keseluruhan.' }}
    </div>

    <div class="page-number">1</div>

</div>
</body>
</html>
