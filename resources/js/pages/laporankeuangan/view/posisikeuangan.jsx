import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from "@/components/ui/table";
import { ArrowLeft, Printer, FileDown, Loader2 } from "lucide-react";
import { parseSafeDate } from "@/lib/utils";

/* ─── Helpers ─────────────────────────────────────────── */
const formatCurrency = (value) => {
    const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(Math.abs(value));
    return value < 0 ? `(${formatted})` : formatted;
};

/* ─── Sub-components ──────────────────────────────────── */
const ReportHeader = ({ period }) => (
    <div className="text-center mb-8 border-b-2 border-primary pb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wider">
            PT. Sarana Pembangunan Riau Trada
        </h1>
        <p className="text-sm text-muted-foreground uppercase">
            Sistem Informasi Akuntansi Keuangan
        </p>
        <Separator className="my-2 h-0.5 bg-primary/20" />
        <h2 className="text-xl font-bold mt-4 uppercase">
            Laporan Posisi Keuangan (Neraca)
        </h2>
        <p className="text-sm mt-1">
            Per{" "}
            {parseSafeDate(period.end_date)?.toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }) || "-"}
        </p>
    </div>
);

const AccountTable = ({ title, accounts = [], total }) => (
    <div className="flex flex-col">
        <h3 className="text-sm font-bold bg-muted p-2 border-x border-t uppercase tracking-tight">
            {title}
        </h3>
        <Table className="border">
            <TableBody>
                {accounts.length > 0 ? (
                    accounts.map((acc, i) => (
                        <TableRow
                            key={i}
                            className="hover:bg-transparent border-b"
                        >
                            <TableCell className="py-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">
                                        {acc.account_name}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-mono">
                                        {acc.account_code}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right py-2 font-mono w-40">
                                {formatCurrency(acc.balance)}
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell
                            colSpan={2}
                            className="text-center text-muted-foreground italic py-4"
                        >
                            Tidak ada data
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            <TableFooter>
                <TableRow className="bg-muted/50">
                    <TableCell className="font-bold py-2 uppercase text-xs tracking-wider">
                        Total {title}
                    </TableCell>
                    <TableCell className="text-right font-bold py-2 font-mono border-l">
                        {formatCurrency(total)}
                    </TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    </div>
);

/* ─── Main Component ──────────────────────────────────── */
export default function ViewPosisiKeuangan({ report }) {
    const { period, assets, liabilities, equity } = report;
    const [loading, setLoading] = useState(false);

    const totalLE = liabilities.total + equity.total;
    const isBalance = Math.abs(assets.total - totalLE) <= 1;

    const breadcrumbs = [
        { title: "Laporan Keuangan", href: "/laporan-keuangan" },
        { title: "Posisi Keuangan", href: "/laporan-keuangan/posisi-keuangan" },
        { title: period.period_name, href: "#" },
    ];

    const handlePrint = () => window.print();

    const handleDownloadPDF = () => {
        setLoading(true);
        const url = route("laporan-keuangan.posisi-keuangan.pdf", {
            period: period.id,
        });
        // Buka di tab baru — setelah 2s reset loading
        window.open(url, "_blank");
        setTimeout(() => setLoading(false), 2000);
    };

    return (
        <>
            <Head title={`Posisi Keuangan - ${period.period_name}`} />
            <AppLayouts breadcrumbs={breadcrumbs}>
                <div
                    className="flex flex-col gap-6 w-full p-4 sm:p-6"
                    id="report-print-area"
                >
                    {/* ── Action Bar ── */}
                    <div className="flex items-center justify-between print:hidden">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.history.back()}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrint}
                                className="gap-2"
                            >
                                <Printer className="h-4 w-4" />
                                Cetak
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleDownloadPDF}
                                disabled={loading}
                                className="gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <FileDown className="h-4 w-4" />
                                )}
                                {loading ? "Memproses..." : "Download PDF"}
                            </Button>
                        </div>
                    </div>

                    {/* ── Report Card ── */}
                    <Card className="border-none shadow-none sm:border sm:shadow-sm">
                        <CardContent className="p-4 sm:p-10">
                            <ReportHeader period={period} />

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 mt-6">
                                {/* Kiri: Aset */}
                                <div className="space-y-6">
                                    {assets.categories.map((cat, index) => (
                                        <AccountTable
                                            key={index}
                                            title={cat.category_name}
                                            accounts={cat.accounts}
                                            total={cat.total}
                                        />
                                    ))}

                                    {/* Total Aset */}
                                    <div className="flex justify-between items-center p-3 bg-muted/50 border font-bold text-sm uppercase tracking-wide">
                                        <span>Total Aset</span>
                                        <span className="font-mono">
                                            {formatCurrency(assets.total)}
                                        </span>
                                    </div>
                                </div>

                                {/* Kanan: Liabilitas & Ekuitas */}
                                <div className="space-y-6">
                                    {/* Liabilitas */}
                                    {liabilities.categories.map(
                                        (cat, index) => (
                                            <AccountTable
                                                key={index}
                                                title={cat.category_name}
                                                accounts={cat.accounts}
                                                total={cat.total}
                                            />
                                        ),
                                    )}

                                    {/* Ekuitas */}
                                    {equity.categories.map((cat, index) => (
                                        <AccountTable
                                            key={index}
                                            title={cat.category_name}
                                            accounts={cat.accounts}
                                            total={cat.total}
                                        />
                                    ))}

                                    {/* Total Liabilitas + Ekuitas */}
                                    <div className="flex justify-between items-center p-3 bg-primary text-primary-foreground rounded-sm shadow-sm">
                                        <span className="font-bold text-xs uppercase tracking-widest">
                                            Total Liabilitas &amp; Ekuitas
                                        </span>
                                        <span className="font-bold text-lg font-mono">
                                            {formatCurrency(totalLE)}
                                        </span>
                                    </div>

                                    {/* Balance warning */}
                                    {!isBalance && (
                                        <div className="p-2 bg-destructive/10 text-destructive text-xs font-bold uppercase text-center border border-destructive/20 rounded-sm">
                                            ⚠ Laporan Tidak Balance! Selisih:{" "}
                                            {formatCurrency(
                                                assets.total - totalLE,
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tanda tangan — hanya di print */}
                            <div className="hidden print:grid grid-cols-2 gap-20 mt-20 text-center">
                                {["Accounting", "Direktur Utama"].map(
                                    (role, i) => (
                                        <div key={i} className="space-y-20">
                                            <p className="text-sm font-medium">
                                                {i === 0
                                                    ? "Dibuat Oleh,"
                                                    : "Disetujui Oleh,"}
                                            </p>
                                            <div className="border-t border-black w-48 mx-auto pt-2">
                                                <p className="text-xs font-bold uppercase">
                                                    {role}
                                                </p>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayouts>

            <style jsx="true" global="true">{`
                @media print {
                    @page {
                        size: A4;
                        margin: 2.54cm; /* 1 inch seperti Word */
                    }

                    body {
                        background: white !important;
                        color: black !important;
                    }

                    .print\:hidden {
                        display: none !important;
                    }

                    #report-print-area {
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }

                    .bg-muted\/50 {
                        background-color: #fafafa !important;
                        -webkit-print-color-adjust: exact;
                    }

                    .bg-primary {
                        background-color: #000 !important;
                        color: white !important;
                        -webkit-print-color-adjust: exact;
                    }

                    .bg-primary span {
                        color: white !important;
                    }
                }
            `}</style>
        </>
    );
}
