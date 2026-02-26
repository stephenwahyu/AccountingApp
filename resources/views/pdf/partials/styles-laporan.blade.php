{{-- resources/views/pdf/partials/styles.blade.php --}}
<style>
    @page {
    size: A4;
    margin: 0;
}


body {
  margin: 2.54cm;
}

    .page {
        width: 100%;
    }

    .report-table {
        border-collapse: collapse;
        width: 100%;
        margin: 0 auto;
    }


    /* ── RESET ─────────────────────────────── */
    

    /* ── PAGE ───────────────────────────────── */

    /* ── HEADER ─────────────────────────────── */
    .report-header {
        text-align: center;
        margin-bottom: 10px;
    }

    .report-header .company-name {
        font-size: 12pt;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 2px;
    }

    .report-header .report-type {
        font-size: 10.5pt;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 2px;
    }

    .report-header .report-period {
        font-size: 9pt;
        margin-bottom: 1px;
    }

    .report-header .report-currency {
        font-size: 8.5pt;
        margin-bottom: 25px;
    }

    /* ── MAIN TABLE ─────────────────────────── */


    /* Header row */
    .report-table thead tr th {
        font-size: 8.5pt;
        font-weight: bold;
        padding: 5px 6px;
        /* border-top: 1.5px solid #1a1a1a; */
        /* border-bottom: 1.5px solid #1a1a1a; */
        text-align: left;
    }

    .report-table thead th.th-catatan {
        text-align: center;
        text-decoration: underline;
    }

    .report-table thead th.th-value {
        text-align: right;
        text-decoration: underline;
    }

    /* All cells */
    .report-table td {
        font-size: 8.5pt;
        vertical-align: top;
        padding: 0px 1px;
    }

    .col-label {
        width: 55%;
        /* border-bottom: 1px solid #000; */
    }

    .col-catatan {
        width: 10%;
        text-align: center;
    }

    .col-value {
        width: 17.5%;
        text-align: right;
        
    }

    /* ── ROW TYPES ──────────────────────────── */
    /* Section header (ASET, LIABILITAS, dll) */
    tr.tr-section>td {
    font-weight: bold;
    padding-top: 2px;
    padding-bottom: 2px;
    text-transform: uppercase;
}

    tr {
        page-break-inside: avoid;
    }

    /* Sub-section (Aset Lancar, Liabilitas Jangka Pendek, dll) */
    tr.tr-subsection>td {
        font-weight: bold;
        font-size: 8.5pt;
        padding-top: 1px;
        padding-bottom: 1px;
    }

    /* Regular item row */
    tr.tr-item>td {
        padding-left: 18px;
        font-weight: normal;
    }

    /* Indented item row (sub-item) */
    tr.tr-item-indent>td {
        padding-left: 30px;
        font-weight: normal;
        font-size: 8pt;
        color: #333;
    }

    /* Subtotal (Jumlah Aset Lancar dll) */
    tr.tr-subtotal td.col-value {
        border-top: 1px solid #000;
        border-bottom: 1px solid #000;
        font-weight: bold;
    }
    td.col-value {
    padding-right: 6px;
}

    /* Grand Total */
    tr.tr-total td.col-value {
        border-top: 1px solid #000;
        border-bottom: 1px solid #000;
        font-weight: bold;
    }

    /* Empty spacer row */
    tr.tr-spacer>td {
        padding: 1px 4px;
    }

    tr.tr-micro>td {
        padding: 1px 4px;
    }

    /* ── ARUS KAS ACTIVITY BOX ──────────────── */




    /* ── PERUBAHAN EKUITAS ──────────────────── */


    tr.tr-pe-section>td {
        font-weight: bold;
        font-size: 8.5pt;
        padding-bottom: 1px;
        color: #444;
        text-transform: uppercase;
        font-size: 7.5pt;
        letter-spacing: 0.3px;
    }

    tr.tr-pe-change>td {
        padding-left: 18px;
    }

    /* ── FOOTER ─────────────────────────────── */
    .footer-note {
        text-align: center;
        font-size: 7.5pt;
        color: #666;
        margin-top: 20px;
        padding-top: 6px;
        /* border-top: 0.5px solid #ccc; */
        font-style: italic;
        line-height: 1.7;
    }

    /* ── SIGNATURE ───────────────────────────── */
    .signature-area {
        width: 100%;
        margin-top: 30px;
        border-collapse: collapse;
    }

    .signature-area td {
        text-align: center;
        width: 50%;
        font-size: 8pt;
        padding: 3px 10px;
        vertical-align: bottom;
    }

    .signature-label {
        margin-bottom: 2px;
    }

    .signature-blank {
        height: 46px;
    }

    .signature-line {
        border-top: 1px solid #1a1a1a;
        width: 120px;
        margin: 0 auto;
        padding-top: 4px;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 7.5pt;
    }

    /* ── PAGE NUMBER ──────────────────────────── */
    .page-number {
        text-align: right;
        font-size: 7pt;
        color: #aaa;
        margin-top: 8px;
    }
</style>
