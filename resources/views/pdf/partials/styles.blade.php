{{-- resources/views/pdf/partials/styles.blade.php --}}
<style>
    @page {
        size: A4;
        margin: 1.5cm;
    }

    body {
        font-family: 'Helvetica', 'Arial', sans-serif;
        font-size: 9pt;
        color: #1a1a1a;
        margin: 0;
        padding: 0;
        line-height: 1.4;
    }

    .report-header {
        text-align: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
    }

    .report-header .company-name {
        font-size: 14pt;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 5px;
    }

    .report-header .report-type {
        font-size: 12pt;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 2px;
    }

    .report-header .report-period {
        font-size: 10pt;
        margin-bottom: 2px;
    }

    .report-currency {
        font-size: 8pt;
        font-style: italic;
        color: #666;
    }

    .report-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        table-layout: fixed;
    }

    .report-table th {
        background-color: #f2f2f2;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 8pt;
        border: 1px solid #000;
        padding: 8px 5px;
        text-align: center;
    }

    .report-table td {
        border: 1px solid #000;
        padding: 6px 5px;
        vertical-align: middle;
        word-wrap: break-word;
    }

    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .font-bold { font-weight: bold; }
    .font-mono { font-family: 'Courier', monospace; font-size: 8.5pt; }

    /* Special row types */
    .tr-section { background-color: #f9f9f9; font-weight: bold; }
    .tr-subsection { background-color: #ffffff; font-weight: bold; }
    .tr-subtotal { font-weight: bold; background-color: #f2f2f2; }
    .tr-total { font-weight: bold; background-color: #e6e6e6; }

    /* For Landscape specifically */
    .landscape @page {
        size: A4 landscape;
    }

    /* Signature Area */
    .signature-container {
        margin-top: 30px;
        width: 100%;
    }

    .signature-table {
        width: 100%;
        border: none;
    }

    .signature-table td {
        border: none;
        width: 33%;
        text-align: center;
        padding-top: 50px;
    }

    .signature-line {
        border-top: 1px solid #000;
        width: 150px;
        margin: 0 auto;
        margin-top: 5px;
    }

    .page-number {
        position: fixed;
        bottom: 0;
        right: 0;
        font-size: 8pt;
        color: #999;
    }
</style>
