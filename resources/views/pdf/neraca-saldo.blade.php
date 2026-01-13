<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neraca Saldo - {{ $periodName }}</title>
    <style>
        body {
            font-family: 'sans-serif';
            font-size: 10px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .w-full { width: 100%; }
        .table {
            width: 100%;
            border-collapse: collapse;
        }
        .table th, .table td {
            border: 1px solid #ddd;
            padding: 4px;
        }
        .table th {
            background-color: #f2f2f2;
        }
        .table-footer {
            background-color: #020617;
            color: #fff;
            font-weight: bold;
        }
        .text-mono {
            font-family: 'monospace';
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="text-center font-bold">{{ $companyName }}</h1>
        <h2 class="text-center">Neraca Saldo</h2>
        <p class="text-center">Untuk Periode {{ $periodName }}</p>
    </div>
    <table class="table">
        <thead>
            <tr>
                <th rowspan="2">Akun</th>
                <th colspan="2" class="text-center">Saldo Awal</th>
                <th colspan="2" class="text-center">Pergerakan</th>
                <th colspan="2" class="text-center">Saldo Akhir</th>
            </tr>
            <tr>
                <th class="text-right">Debit</th>
                <th class="text-right">Kredit</th>
                <th class="text-right">Debit</th>
                <th class="text-right">Kredit</th>
                <th class="text-right">Debit</th>
                <th class="text-right">Kredit</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($accounts as $account)
                @include('pdf.neraca-saldo-row', ['account' => $account, 'level' => 0])
            @endforeach
        </tbody>
        <tfoot>
            <tr class="table-footer">
                <td>Total</td>
                <td class="text-right text-mono">{{ number_format($totals['opening_debit'], 2, ',', '.') }}</td>
                <td class="text-right text-mono">{{ number_format($totals['opening_credit'], 2, ',', '.') }}</td>
                <td class="text-right text-mono">{{ number_format($totals['debit_movement'], 2, ',', '.') }}</td>
                <td class="text-right text-mono">{{ number_format($totals['credit_movement'], 2, ',', '.') }}</td>
                <td class="text-right text-mono">{{ number_format($totals['closing_debit'], 2, ',', '.') }}</td>
                <td class="text-right text-mono">{{ number_format($totals['closing_credit'], 2, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>
</body>
</html>