<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Buku Besar - {{ $account->account_name }}</title>
    <style>
        body { font-family: sans-serif; margin: 20px; }
        h1, h2, h3 { text-align: center; }
        h1 { font-size: 18px; margin-bottom: 5px; }
        h2 { font-size: 16px; margin-bottom: 5px; }
        h3 { font-size: 14px; margin-top: 0; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .text-right { text-align: right; }
        .font-mono { font-family: monospace; }
        .total-row { font-weight: bold; }
        .summary { margin-bottom: 20px; font-size: 12px; }
        .summary p { margin: 2px 0; }
    </style>
</head>
<body>
    <h1>LAPORAN BUKU BESAR</h1>
    <h2>{{ $companyName }}</h2>
    <h3>Periode: {{ $periodName }}</h3>

    <div class="summary">
        <p><strong>Kode Akun:</strong> {{ $account->account_code }}</p>
        <p><strong>Nama Akun:</strong> {{ $account->account_name }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>No. Jurnal</th>
                <th>Uraian</th>
                <th class="text-right">Debit</th>
                <th class="text-right">Kredit</th>
                <th class="text-right">Saldo</th>
            </tr>
        </thead>
        <tbody>
            <tr class="total-row">
                <td colspan="5">Saldo Awal</td>
                <td class="text-right font-mono">{{ number_format($openingBalance, 2, ',', '.') }}</td>
            </tr>
            @php
                $runningBalance = $openingBalance;
            @endphp
            @foreach ($transactions as $tx)
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
                    <td>{{ $tx['entry_date'] }}</td>
                    <td>{{ $tx['entry_number'] }}</td>
                    <td>{{ $tx['detail_description'] ?: $tx['journal_description'] }}</td>
                    <td class="text-right font-mono">{{ $debit > 0 ? number_format($debit, 2, ',', '.') : '-' }}</td>
                    <td class="text-right font-mono">{{ $credit > 0 ? number_format($credit, 2, ',', '.') : '-' }}</td>
                    <td class="text-right font-mono">{{ number_format($runningBalance, 2, ',', '.') }}</td>
                </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="3">Total</td>
                <td class="text-right font-mono">{{ number_format($totalDebit, 2, ',', '.') }}</td>
                <td class="text-right font-mono">{{ number_format($totalCredit, 2, ',', '.') }}</td>
                <td class="text-right font-mono">{{ number_format($runningBalance, 2, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

</body>
</html>
