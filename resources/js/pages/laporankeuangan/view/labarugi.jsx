import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableFooter, TableRow,
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
    <h1 className="text-2xl font-bold uppercase tracking-wider">PT. Sarana Pembangunan Riau Trada</h1>
    <p className="text-sm text-muted-foreground uppercase">
      Sistem Informasi Akuntansi Keuangan
    </p>
    <Separator className="my-2 h-0.5 bg-primary/20" />
    <h2 className="text-xl font-bold mt-4 uppercase">Laporan Laba Rugi</h2>
    <p className="text-sm mt-1">
      Periode yang Berakhir pada{" "}
      {parseSafeDate(period.end_date)?.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }) || "-"}
    </p>
  </div>
);

const ReportSection = ({ title, accounts = [], total }) => (
  <div className="flex flex-col mb-6">
    <h3 className="text-sm font-bold bg-muted p-2 border-x border-t uppercase tracking-tight">
      {title}
    </h3>
    <Table className="border">
      <TableBody>
        {accounts.length > 0 ? (
          accounts.map((acc, i) => (
            <TableRow key={i} className="hover:bg-transparent border-b">
              <TableCell className="py-2 pl-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{acc.account_name}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {acc.account_code}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right py-2 font-mono w-48 pr-6">
                {formatCurrency(acc.balance)}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={2} className="text-center text-muted-foreground italic py-4">
              Tidak ada data {title.toLowerCase()}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      <TableFooter>
        <TableRow className="bg-muted/30">
          <TableCell className="font-bold py-2 pl-4 uppercase text-xs tracking-wider">
            Total {title}
          </TableCell>
          <TableCell className="text-right font-bold py-2 font-mono pr-6 border-l">
            {formatCurrency(total)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </div>
);

/* ─── Main Component ──────────────────────────────────── */
export default function ViewLabaRugi({ report }) {
  const { period, sales, cogs, gross_profit, operating_expenses, operating_profit, others, net_income } = report;
  const [loading, setLoading] = useState(false);

  const breadcrumbs = [
    { title: "Laporan Keuangan", href: "/laporan-keuangan" },
    { title: "Laba Rugi", href: "/laporan-keuangan/laba-rugi" },
    { title: period.period_name, href: "#" },
  ];

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    setLoading(true);
    window.open(
      route("laporan-keuangan.laba-rugi.pdf", { period: period.id }),
      "_blank"
    );
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <>
      <Head title={`Laba Rugi - ${period.period_name}`} />
      <AppLayouts breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6 w-full p-4 sm:p-6" id="report-print-area">

          {/* ── Action Bar ── */}
          <div className="flex items-center justify-between print:hidden">
            <Button variant="outline" size="sm" onClick={() => window.history.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <div className="flex gap-2">
              
              <Button
                variant="default"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={loading}
                className="gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                {loading ? "Memproses..." : "Download PDF"}
              </Button>
            </div>
          </div>

          {/* ── Report Card ── */}
          <Card className="border-none shadow-none sm:border sm:shadow-sm">
            <CardContent className="p-6 sm:p-12">
              <ReportHeader period={period} />

              <div className="space-y-6 mt-8">
                {/* 1. PENJUALAN */}
                <div className="space-y-2">
                  {sales.categories.map((cat, index) => (
                    <ReportSection key={index} title={cat.category_name} accounts={cat.accounts} total={cat.total} />
                  ))}
                </div>

                {/* 2. HPP */}
                <div className="space-y-2">
                  {cogs.categories.map((cat, index) => (
                    <ReportSection key={index} title={cat.category_name} accounts={cat.accounts} total={cat.total} />
                  ))}
                </div>

                {/* 3. LABA KOTOR */}
                <div className="flex justify-between items-center p-4 bg-muted/50 border font-bold text-sm uppercase">
                  <span>Laba Kotor</span>
                  <span className="font-mono text-lg">{formatCurrency(gross_profit)}</span>
                </div>

                {/* 4. BEBAN OPERASIONAL */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b pb-1">Beban Operasional</h3>
                  {operating_expenses.categories.map((cat, index) => (
                    <ReportSection key={index} title={cat.category_name} accounts={cat.accounts} total={cat.total} />
                  ))}
                  <div className="flex justify-between items-center p-3 border-t font-bold text-xs uppercase italic">
                    <span>Total Beban Operasional</span>
                    <span className="font-mono">{formatCurrency(operating_expenses.total)}</span>
                  </div>
                </div>

                {/* 5. LABA OPERASIONAL */}
                <div className="flex justify-between items-center p-4 bg-muted/50 border font-bold text-sm uppercase">
                  <span>Laba Operasional</span>
                  <span className="font-mono text-lg">{formatCurrency(operating_profit)}</span>
                </div>

                {/* 6. LAIN-LAIN */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b pb-1">Pendapatan & Beban Lain-lain</h3>
                  {others.income.categories.map((cat, index) => (
                    <ReportSection key={index} title={cat.category_name} accounts={cat.accounts} total={cat.total} />
                  ))}
                  {others.expenses.categories.map((cat, index) => (
                    <ReportSection key={index} title={cat.category_name} accounts={cat.accounts} total={cat.total} />
                  ))}
                </div>

                {/* 7. LABA BERSIH */}
                <div className="mt-8 border-t-2 border-double pt-4">
                  <div className="flex justify-between items-center p-4 bg-primary text-primary-foreground rounded-sm shadow-sm">
                    <span className="font-bold text-sm uppercase tracking-widest">
                      {net_income >= 0 ? "Laba Bersih" : "Rugi Bersih"}
                    </span>
                    <span className="font-bold text-xl font-mono">
                      {formatCurrency(net_income)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tanda tangan — hanya di print */}
              <div className="hidden print:grid grid-cols-2 gap-20 mt-20 text-center">
                {["Accounting", "Direktur Utama"].map((role, i) => (
                  <div key={i} className="space-y-20">
                    <p className="text-sm font-medium">
                      {i === 0 ? "Dibuat Oleh," : "Disetujui Oleh,"}
                    </p>
                    <div className="border-t border-black w-48 mx-auto pt-2">
                      <p className="text-xs font-bold uppercase">{role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayouts>

      <style jsx="true" global="true">{`
        @media print {
          @page { size: A4; margin: 1cm; }
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          #report-print-area { width: 100% !important; padding: 0 !important; margin: 0 !important; }
          .bg-muted { background-color: #fafafa !important; -webkit-print-color-adjust: exact; }
          .bg-primary { background-color: #000 !important; color: white !important; -webkit-print-color-adjust: exact; }
          .bg-primary span { color: white !important; }
        }
      `}</style>
    </>
  );
}
