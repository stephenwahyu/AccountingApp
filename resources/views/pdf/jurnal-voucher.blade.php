<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>{{ $title }} - {{ $journal->entry_number }}</title>

<style>
@page {
    size: 210mm 148.5mm;
    margin: 10mm; /* margin printer */
}

body {
    margin: 0;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 9pt;
}

/* Voucher wrapper setengah A4 */
.voucher-wrapper {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

/* ====== HEADER ====== */
.header {
    text-align: center;
    padding-bottom: 5px;
    margin-bottom: 8px;
}

.company-name {
    font-size: 13pt;
    font-weight: bold;
    text-transform: uppercase;
}

.report-title {
    font-size: 11pt;
    font-weight: bold;
    text-decoration: underline;
}

/* ====== INFO ====== */
.info-table {
    width: 100%;
    margin-bottom: 8px;
}

.info-table td {
    padding: 2px 0;
    vertical-align: top;
}

.info-label {
    width: 100px;
    font-weight: bold;
}

/* ====== TABEL DETAIL ====== */
.report-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 5px;
}

.report-table th,
.report-table td {
    border: 1px solid #000;
    padding: 3px;
    font-size: 8pt;
}

.report-table th {
    background: #f2f2f2;
    text-align: center;
}

.text-right { text-align: right; }
.text-center { text-align: center; }

.total-row {
    font-weight: bold;
}

/* ====== TERBILANG ====== */
.terbilang-box {
    border: 1px solid #000;
    padding: 3px;
    font-style: italic;
    font-size: 8pt;
}

.terbilang-box span {
    font-weight: bold;
}

/* ====== TANDA TANGAN ====== */
.signature-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1mm;
}

.signature-table td {
    border: 1px solid #000;
    vertical-align: top;
    padding: 4px;
    text-align: center;
    font-size: 8pt;
}

.signature-space {
    height: 15mm;
}

.signature-name {
    font-weight: bold;
    text-decoration: underline;
}

.content-area {
    flex: 1; /* isi akan mengisi ruang atas */
}

</style>
</head>

<body>

<div class="voucher-wrapper">

    <div class="content-area">

        <!-- HEADER -->
        <div class="header">
            <div class="company-name">{{ $company_name }}</div>
            <div class="report-title">{{ strtoupper($title) }}</div>
        </div>

        <!-- INFO -->
        <table class="info-table" role="presentation" style="width:100%;">
    <tr>
        <td style="width:60%;"></td> <!-- kolom kosong di kiri -->
        <td style="width:40%;">
            <table role="presentation" style="width:100%;">
                <tr>
                    <td class="info-label" style="text-align:left;">Nomor Bukti</td>
                    <td>: {{ $journal->entry_number }}</td>
                </tr>
                <tr>
                    <td class="info-label" style="text-align:left;">Tanggal</td>
                    <td>: {{ $journal->entry_date->format('d-m-Y') }}</td>
                </tr>
            </table>
        </td>
    </tr>
</table>

        <!-- DETAIL -->
        <table class="report-table">
            <thead>
                <tr>
                    <th scope="col" style="width:15%">AKUN</th>
                    <th scope="col" style="width:45%">URAIAN / KETERANGAN</th>
                    <th scope="col" style="width:20%">REF</th>
                    <th scope="col" style="width:20%">JUMLAH</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($details as $detail)
                <tr>
                    <td class="text-center">{{ $detail->account->account_code }}</td>
                    <td>{{ $detail->description }}</td>
                    <td class="text-center">{{ $detail->account->account_name }}</td>
                    <td class="text-right">
                        @php
                            $amt = $detail->debit > 0 ? $detail->debit : $detail->credit;
                        @endphp
                        {{ number_format($amt, 2, ',', '.') }}
                    </td>
                </tr>
                @endforeach

                <!-- Baris kosong agar tabel stabil -->
                @for ($i = count($details); $i < 5; $i++)
                <tr>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                </tr>
                @endfor

                <tr class="total-row">
                    <td colspan="3" class="text-right">TOTAL</td>
                    <td class="text-right">{{ number_format($total, 2, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>

        <!-- TERBILANG -->
        <div class="terbilang-box">
            <span>Terbilang #</span> {{ $terbilang }} #
        </div>

    </div>

    <!-- TANDA TANGAN -->
    <table class="signature-table" role="presentation">
    <tr>
        <td>
            Disetujui Oleh,
            <div class="signature-space"></div>
            <div class="signature-name">( ......................... )</div>
        </td>
        <td>
            Accounting,
            <div class="signature-space"></div>
            <div class="signature-name">( ......................... )</div>
        </td>
        <td style="border:none;">
            Diterima Oleh,
            <div class="signature-space"></div>
            <div class="signature-name">( {{ $journal->penerima ?: '.........................' }} )</div>
        </td>
    </tr>
</table>

</div>

</body>
</html>
