import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import AppLayouts from "@/pages/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
    <h2 className="text-xl font-bold mt-4 uppercase">Laporan Arus Kas</h2>
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

const ActivitySection = ({ title, items = [], total }) => {
  const isPositive = total >= 0;
  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between bg-muted px-3 py-2 border">
        <h3 className="text-xs font-bold uppercase tracking-tight">{title}</h3>
        <Badge variant={isPositive ? "default" : "destructive"} className="text-xs font-mono">
          {formatCurrency(total)}
        </Badge>
      </div>

      {/* Items */}
      <div className="border-x border-b">
        {items.length > 0 ? (
          items.map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-center px-4 py-2 border-b border-dashed last:border-0 border-muted hover:bg-muted/30 transition-colors"
            >
              <span className="text-sm text-muted-foreground">{item.description}</span>
              <span className={`font-mono text-sm ${item.balance < 0 ? "text-red-600" : "text-green-700"}`}>
                {formatCurrency(item.balance)}
              </span>
            </div>
          ))
        ) : (
          <div className="px-4 py-3 text-sm text-muted-foreground italic text-center">
            Tidak ada aktivitas
          </div>
        )}

        {/* Sub-total */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-muted/40 border-t">
          <span className="text-xs font-bold uppercase tracking-wide">
            Kas Bersih dari {title}
          </span>
          <span className={`font-mono font-bold text-sm ${isPositive ? "text-green-700" : "text-red-600"}`}>
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────── */
export default function ViewArusKas({ report }) {
  const { period, operating, investing, financing, beginning_cash } = report;
  const [loading, setLoading] = useState(false);

  const netCashFlow      = (operating.total ?? 0) + (investing.total ?? 0) + (financing.total ?? 0);
  const beginningBalance = beginning_cash ?? 0;
  const endingBalance    = beginningBalance + netCashFlow;
  const isNetPositive    = netCashFlow >= 0;

  const breadcrumbs = [
    { title: "Laporan Keuangan", href: "/laporan-keuangan" },
    { title: "Arus Kas", href: "/laporan-keuangan/arus-kas" },
    { title: period.period_name, href: "#" },
  ];

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    setLoading(true);
    window.open(
      route("laporan-keuangan.arus-kas.pdf", { period: period.id }),
      "_blank"
    );
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <>
      <Head title={`Arus Kas - ${period.period_name}`} />
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

              {/* Activity Sections */}
              <div className="mt-8">
                <ActivitySection title="Aktivitas Operasi"  items={operating.items}  total={operating.total}  />
                <ActivitySection title="Aktivitas Investasi" items={investing.items}  total={investing.total}  />
                <ActivitySection title="Aktivitas Pendanaan" items={financing.items}  total={financing.total}  />
              </div>

              {/* Summary */}
              <div className="mt-6 space-y-3 border-t pt-5">
                {/* Net cash flow */}
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-bold uppercase tracking-tight">
                    Kenaikan (Penurunan) Bersih Kas
                  </span>
                  <span className={`font-mono font-bold ${isNetPositive ? "text-green-700" : "text-red-600"}`}>
                    {formatCurrency(netCashFlow)}
                  </span>
                </div>

                {/* Beginning cash */}
                <div className="flex justify-between items-center py-2 border-b text-muted-foreground">
                  <span className="text-sm">Kas dan Setara Kas Awal Periode</span>
                  <span className="font-mono text-sm">{formatCurrency(beginningBalance)}</span>
                </div>

                {/* Ending cash — highlight box */}
                <div className="flex justify-between items-center p-4 bg-primary text-primary-foreground rounded-sm shadow-sm mt-2">
                  <span className="font-bold text-sm uppercase tracking-widest">
                    Kas dan Setara Kas Akhir Periode
                  </span>
                  <span className="font-bold text-xl font-mono">
                    {formatCurrency(endingBalance)}
                  </span>
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
          .bg-muted\\/40 { background-color: #f5f5f5 !important; -webkit-print-color-adjust: exact; }
          .bg-primary { background-color: #000 !important; color: white !important; -webkit-print-color-adjust: exact; }
          .bg-primary span { color: white !important; }
          .text-green-700 { color: #000 !important; }
          .text-red-600 { color: #000 !important; }
        }
      `}</style>
    </>
  );
}
