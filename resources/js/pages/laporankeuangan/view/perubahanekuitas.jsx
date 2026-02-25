import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, FileDown, Loader2, TrendingUp, TrendingDown } from "lucide-react";

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
    <h2 className="text-xl font-bold mt-4 uppercase">Laporan Perubahan Ekuitas</h2>
    <p className="text-sm mt-1">
      Periode yang Berakhir pada{" "}
      {new Date(period.end_date).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
    </p>
  </div>
);

const RowItem = ({ label, value, bold = false, indent = false, muted = false }) => (
  <div className={`flex justify-between items-center py-2 border-b border-dashed border-muted last:border-0
    ${indent ? "pl-6" : ""}
    ${bold ? "font-bold" : ""}
    ${muted ? "text-muted-foreground text-sm" : ""}
  `}>
    <span className="text-sm">{label}</span>
    <span className={`font-mono text-sm ${bold ? "font-bold" : ""}`}>
      {formatCurrency(value)}
    </span>
  </div>
);

/* ─── Main Component ──────────────────────────────────── */
export default function ViewPerubahanEkuitas({ report }) {
  const { period, beginning_balance, changes, ending_balance } = report;
  const [loading, setLoading] = useState(false);

  const totalChanges = (changes.net_income ?? 0) + (changes.others ?? 0);
  const isPositive   = totalChanges >= 0;

  const startDateStr = new Date(period.start_date).toLocaleDateString("id-ID", {
    year: "numeric", month: "long", day: "numeric",
  });
  const endDateStr = new Date(period.end_date).toLocaleDateString("id-ID", {
    year: "numeric", month: "long", day: "numeric",
  });

  const breadcrumbs = [
    { title: "Laporan Keuangan", href: "/laporan-keuangan" },
    { title: "Perubahan Ekuitas", href: "/laporan-keuangan/perubahan-ekuitas" },
    { title: period.period_name, href: "#" },
  ];

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    setLoading(true);
    window.open(
      route("laporan-keuangan.perubahan-ekuitas.pdf", { period: period.id }),
      "_blank"
    );
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <>
      <Head title={`Perubahan Ekuitas - ${period.period_name}`} />
      <AppLayouts breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6 w-full p-4 sm:p-6" id="report-print-area">

          {/* ── Action Bar ── */}
          <div className="flex items-center justify-between print:hidden">
            <Button variant="outline" size="sm" onClick={() => window.history.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
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
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                {loading ? "Memproses..." : "Download PDF"}
              </Button>
            </div>
          </div>

          {/* ── Report Card ── */}
          <Card className="border-none shadow-none sm:border sm:shadow-sm ">
            <CardContent className="p-6 sm:p-12">
              <ReportHeader period={period} />

              <div className="mt-8 border rounded-sm overflow-hidden">

                {/* Saldo Awal */}
                <div className="bg-muted/50 px-4 py-3 border-b">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Saldo Awal per {startDateStr}
                    </span>
                    <span className="font-mono font-bold">
                      {formatCurrency(beginning_balance.total)}
                    </span>
                  </div>
                </div>

                {/* Perubahan */}
                <div className="px-4 py-3 space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    Perubahan Ekuitas
                  </p>

                  <RowItem
                    label="Laba (Rugi) Bersih Periode Berjalan"
                    value={changes.net_income ?? 0}
                    indent
                  />

                  {(changes.others ?? 0) !== 0 && (
                    <RowItem
                      label="Perubahan Modal Lainnya"
                      value={changes.others}
                      indent
                    />
                  )}

                  {/* Custom changes jika ada */}
                  {(changes.custom_items ?? []).map((item, i) => (
                    <RowItem key={i} label={item.label} value={item.value} indent />
                  ))}

                  <Separator className="my-2" />

                  {/* Total perubahan */}
                  <div className={`flex justify-between items-center py-2 px-3 rounded-sm
                    ${isPositive ? "bg-green" : "bg-red"}`}
                  >
                    <div className="flex items-center gap-2">
                      {isPositive
                        ? <TrendingUp className="h-4 w-4 text-green-600" />
                        : <TrendingDown className="h-4 w-4 text-red-500" />
                      }
                      <span className="text-xs font-bold uppercase tracking-wide">
                        Total Kenaikan (Penurunan) Ekuitas
                      </span>
                    </div>
                    <span className={`font-mono font-bold
                      ${isPositive ? "text-green-700" : "text-red-600"}`}
                    >
                      {formatCurrency(totalChanges)}
                    </span>
                  </div>
                </div>

                {/* Saldo Akhir */}
                <div className="bg-primary text-primary-foreground px-4 py-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm uppercase tracking-widest">
                      Saldo Akhir per {endDateStr}
                    </span>
                    <span className="font-bold text-xl font-mono">
                      {formatCurrency(ending_balance.total)}
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
          .bg-muted\\/50 { background-color: #fafafa !important; -webkit-print-color-adjust: exact; }
          .bg-primary { background-color: #000 !important; color: white !important; -webkit-print-color-adjust: exact; }
          .bg-primary span { color: white !important; }
          .bg-green-50, .bg-red-50 { background-color: #f9f9f9 !important; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </>
  );
}