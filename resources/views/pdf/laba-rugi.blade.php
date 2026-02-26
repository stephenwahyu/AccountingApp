{{-- resources/views/pdf/laba-rugi.blade.php --}}
@php
    use Carbon\Carbon;
    use App\Helpers\CurrencyHelper;

    $period    = $report['period'];
    $endDate   = Carbon::parse($period['end_date'])->locale('id')->isoFormat('D MMMM Y');
    
    $sales     = $report['sales'];
    $cogs      = $report['cogs'];
    $grossProfit = floatval($report['gross_profit'] ?? 0);
    $operatingExpenses = $report['operating_expenses'];
    $operatingProfit = floatval($report['operating_profit'] ?? 0);
    $others    = $report['others'];
    $net       = floatval($report['net_income'] ?? 0);
    $isProfit  = $net >= 0;
@endphp
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Laporan Laba Rugi - {{ $period['period_name'] }}</title>
    @include('pdf.partials.styles-laporan')
</head>
<body>
<div class="page">

    {{-- HEADER --}}
    <div class="report-header">
        <div class="company-name">{{ $report['company_name'] ?? config('app.name') }}</div>
        <div class="report-type">LAPORAN LABA RUGI</div>
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

            {{-- 1. PENDAPATAN USAHA --}}
            <tr class="tr-section">
                <td colspan="2">PENDAPATAN USAHA</td>
            </tr>
            @foreach($sales['categories'] ?? [] as $cat)
                @foreach($cat['accounts'] ?? [] as $acc)
                <tr class="tr-item">
                    <td>{{ $acc['account_name'] }}</td>
                    <td class="col-value">{{ CurrencyHelper::format($acc['balance']) }}</td>
                </tr>
                @endforeach
            @endforeach
            <tr class="tr-subtotal">
                <td>Total Pendapatan Usaha</td>
                <td class="col-value">{{ CurrencyHelper::format($sales['total'] ?? 0) }}</td>
            </tr>

            <tr class="tr-spacer"><td colspan="2"></td></tr>

            {{-- 2. HPP --}}
            <tr class="tr-section">
                <td colspan="2">HARGA POKOK PENJUALAN</td>
            </tr>
            @foreach($cogs['categories'] ?? [] as $cat)
                @foreach($cat['accounts'] ?? [] as $acc)
                <tr class="tr-item">
                    <td>{{ $acc['account_name'] }}</td>
                    <td class="col-value">{{ CurrencyHelper::format($acc['balance']) }}</td>
                </tr>
                @endforeach
            @endforeach
            <tr class="tr-subtotal">
                <td>Total Harga Pokok Penjualan</td>
                <td class="col-value">{{ CurrencyHelper::format($cogs['total'] ?? 0) }}</td>
            </tr>

            <tr class="tr-spacer"><td colspan="2"></td></tr>

            {{-- 3. LABA KOTOR --}}
            <tr class="tr-total" style="background-color: #f9f9f9;">
                <td>LABA KOTOR</td>
                <td class="col-value">{{ CurrencyHelper::format($grossProfit) }}</td>
            </tr>

            <tr class="tr-spacer"><td colspan="2"></td></tr>

            {{-- 4. BEBAN OPERASIONAL --}}
            <tr class="tr-section">
                <td colspan="2">BEBAN OPERASIONAL</td>
            </tr>
            @foreach($operatingExpenses['categories'] ?? [] as $cat)
                <tr class="tr-subsection">
                    <td colspan="2" style="font-size: 8.5pt; color: #666; padding-left: 10px;">{{ strtoupper($cat['category_name']) }}</td>
                </tr>
                @foreach($cat['accounts'] ?? [] as $acc)
                <tr class="tr-item">
                    <td>{{ $acc['account_name'] }}</td>
                    <td class="col-value">{{ CurrencyHelper::format($acc['balance']) }}</td>
                </tr>
                @endforeach
            @endforeach
            <tr class="tr-subtotal">
                <td>Total Beban Operasional</td>
                <td class="col-value">{{ CurrencyHelper::format($operatingExpenses['total'] ?? 0) }}</td>
            </tr>

            <tr class="tr-spacer"><td colspan="2"></td></tr>

            {{-- 5. LABA OPERASIONAL --}}
            <tr class="tr-total" style="background-color: #f9f9f9;">
                <td>LABA OPERASIONAL</td>
                <td class="col-value">{{ CurrencyHelper::format($operatingProfit) }}</td>
            </tr>

            <tr class="tr-spacer"><td colspan="2"></td></tr>

            {{-- 6. LAIN-LAIN --}}
            <tr class="tr-section">
                <td colspan="2">PENDAPATAN & BEBAN LAIN-LAIN</td>
            </tr>
            @foreach($others['income']['categories'] ?? [] as $cat)
                @foreach($cat['accounts'] ?? [] as $acc)
                <tr class="tr-item">
                    <td>{{ $acc['account_name'] }}</td>
                    <td class="col-value">{{ CurrencyHelper::format($acc['balance']) }}</td>
                </tr>
                @endforeach
            @endforeach
            @foreach($others['expenses']['categories'] ?? [] as $cat)
                @foreach($cat['accounts'] ?? [] as $acc)
                <tr class="tr-item">
                    <td>{{ $acc['account_name'] }}</td>
                    <td class="col-value">{{ CurrencyHelper::format($acc['balance']) }}</td>
                </tr>
                @endforeach
            @endforeach
            
            <tr class="tr-spacer"><td colspan="2"></td></tr>

            {{-- 7. LABA BERSIH --}}
            <tr class="tr-total">
                <td>{{ $isProfit ? 'LABA BERSIH' : 'RUGI BERSIH' }}</td>
                <td class="col-value">{{ CurrencyHelper::format($net) }}</td>
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
