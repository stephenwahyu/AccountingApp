{{-- resources/views/pdf/neraca-saldo.blade.php --}}
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Neraca Saldo - {{ $periodName }}</title>
    @include('pdf.partials.styles')
    <style>
        @page {
            size: A4 landscape;
            margin: 1.5cm;
        }
        .report-table th { font-size: 7.5pt; padding: 6px 3px; }
        .report-table td { font-size: 8pt; padding: 4px 5px; }
    </style>
</head>
<body>
<div class="page">
    <div class="report-header">
        <div class="company-name">{{ $companyName }}</div>
        <div class="report-type">LAPORAN NERACA SALDO</div>
        <div class="report-period">Periode: {{ $periodName }}</div>
        <div class="report-currency">(Dalam Rupiah)</div>
    </div>

    <table class="report-table">
        <thead>
            <tr>
                <th rowspan="2" style="width: 25%; vertical-align: middle;">Keterangan Akun</th>
                <th colspan="2">Saldo Awal</th>
                <th colspan="2">Pergerakan (Mutasi)</th>
                <th colspan="2">Saldo Akhir</th>
            </tr>
            <tr>
                <th style="width: 12.5%">Debit</th>
                <th style="width: 12.5%">Kredit</th>
                <th style="width: 12.5%">Debit</th>
                <th style="width: 12.5%">Kredit</th>
                <th style="width: 12.5%">Debit</th>
                <th style="width: 12.5%">Kredit</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($accounts as $account)
                @include('pdf.neraca-saldo-row', ['account' => $account, 'level' => 0])
            @empty
                <tr>
                    <td colspan="7" class="text-center" style="padding: 30px; font-style: italic; color: #666;">
                        Tidak ada data akun yang tersedia.
                    </td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr class="tr-total">
                <td class="text-right">TOTAL</td>
                <td class="text-right font-mono">{{ number_format($totals['opening_debit'], 2, ',', '.') }}</td>
                <td class="text-right font-mono">{{ number_format($totals['opening_credit'], 2, ',', '.') }}</td>
                <td class="text-right font-mono">{{ number_format($totals['debit_movement'], 2, ',', '.') }}</td>
                <td class="text-right font-mono">{{ number_format($totals['credit_movement'], 2, ',', '.') }}</td>
                <td class="text-right font-mono">{{ number_format($totals['closing_debit'], 2, ',', '.') }}</td>
                <td class="text-right font-mono">{{ number_format($totals['closing_credit'], 2, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    
</div>
</body>
</html>
