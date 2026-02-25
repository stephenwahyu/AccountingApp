{{-- resources/views/pdf/buku-besar.blade.php --}}
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Buku Besar - {{ $account->account_name }}</title>
    @include('pdf.partials.styles')
</head>
<body>
<div class="page">
    <div class="report-header">
        <div class="company-name">{{ $companyName }}</div>
        <div class="report-type">LAPORAN BUKU BESAR</div>
        <div class="report-period">Periode: {{ $dateRange }}</div>
        <div class="report-currency">(Dalam Rupiah)</div>
    </div>

    <table style="width: 100%; border: none; margin-bottom: 10px; font-size: 10pt;">
        <tr>
            <td style="width: 100px; font-weight: bold; padding: 2px 0;">Kode Akun</td>
            <td>: {{ $account->account_code }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold; padding: 2px 0;">Nama Akun</td>
            <td>: {{ $account->account_name }}</td>
        </tr>
    </table>

    <table class="report-table">
        <thead>
            <tr>
                <th style="width: 12%">Tanggal</th>
                <th style="width: 15%">No. Bukti</th>
                <th style="width: 33%">Uraian / Keterangan</th>
                <th style="width: 13%">Debit</th>
                <th style="width: 13%">Kredit</th>
                <th style="width: 14%">Saldo</th>
            </tr>
        </thead>
        <tbody>
            <tr class="tr-subtotal">
                <td colspan="5" class="text-right">SALDO AWAL</td>
                <td class="text-right font-mono">{{ number_format($openingBalance, 2, ',', '.') }}</td>
            </tr>
            @php
                $runningBalance = $openingBalance;
            @endphp
            @forelse ($transactions as $tx)
                @php
                    $debit = $tx['debit'] ?? 0;
                    $credit = $tx['credit'] ?? 0;
                    if ($account->normal_balance === 'Debit') {
                        $runningBalance += $debit - $credit;
                    } else {
                        $runningBalance += $credit - $debit;
                    }
                @endphp
                <tr>
                    <td class="text-center">{{ $tx['entry_date'] }}</td>
                    <td class="text-center">{{ $tx['entry_number'] }}</td>
                    <td style="font-size: 8.5pt;">{{ $tx['detail_description'] ?: $tx['journal_description'] }}</td>
                    <td class="text-right font-mono">{{ $debit > 0 ? number_format($debit, 2, ',', '.') : '-' }}</td>
                    <td class="text-right font-mono">{{ $credit > 0 ? number_format($credit, 2, ',', '.') : '-' }}</td>
                    <td class="text-right font-mono">{{ number_format($runningBalance, 2, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="text-center" style="padding: 30px; color: #666; font-style: italic;">
                        Tidak ada transaksi yang tercatat untuk periode ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr class="tr-total">
                <td colspan="3" class="text-right">TOTAL MUTASI</td>
                <td class="text-right font-mono" style="color: {{ $account->normal_balance === 'Debit' ? '#16a34a' : '#dc2626' }}">
                    {{ number_format($totalDebit, 2, ',', '.') }}
                </td>
                <td class="text-right font-mono" style="color: {{ $account->normal_balance === 'Debit' ? '#dc2626' : '#16a34a' }}">
                    {{ number_format($totalCredit, 2, ',', '.') }}
                </td>
                <td class="text-right font-mono">{{ number_format($runningBalance, 2, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    
</div>
</body>
</html>
