
import React from "react";
import { Head } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer } from "lucide-react";

const formatCurrency = (value) => {
  const formattedValue = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
  }).format(Math.abs(value));
  return value < 0 ? `(${formattedValue})` : formattedValue;
};

const ReportHeader = ({ period, title }) => (
  <div className="text-center mb-8 border-b-2 border-primary pb-4">
    <h1 className="text-2xl font-bold uppercase tracking-wider">AccountingApp</h1>
    <p className="text-sm text-muted-foreground uppercase">Sistem Informasi Akuntansi Terintegrasi</p>
    <Separator className="my-2 h-0.5 bg-primary/20" />
    <h2 className="text-xl font-bold mt-4 uppercase">{title}</h2>
    <p className="text-md font-medium">
      Periode yang berakhir pada {new Date(period.end_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
  </div>
);

const ActivitySection = ({ title, items, total }) => (
  <div className="mb-8">
    <h3 className="text-sm font-bold bg-muted p-2 border uppercase tracking-tight">{title}</h3>
    <div className="border-x border-b px-4 py-2 space-y-1">
      {items.length > 0 ? (
        items.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-1 border-b border-dashed last:border-0 border-muted">
            <p className="text-sm">{item.description}</p>
            <p className="font-mono text-sm">{formatCurrency(item.balance)}</p>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground italic text-center py-2">Tidak ada aktivitas</p>
      )}
      <div className="flex justify-between items-center font-bold py-2 mt-2 bg-muted/20 -mx-4 px-4">
        <p className="text-xs uppercase tracking-wider">Kas Bersih dari {title}</p>
        <p className="font-mono">{formatCurrency(total)}</p>
      </div>
    </div>
  </div>
);

export default function ViewArusKas({ report }) {
  const { period, operating, investing, financing, beginning_cash } = report;

  const netCashFlow = operating.total + investing.total + financing.total;
  const beginningCashBalance = beginning_cash; 
  const endingCashBalance = beginningCashBalance + netCashFlow;

  const breadcrumbs = [
    { title: "Laporan Keuangan", href: "/laporan-keuangan" },
    { title: "Arus Kas", href: "/laporan-keuangan/arus-kas" },
    { title: period.period_name, href: "#" },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Head title={`Arus Kas - ${period.period_name}`} />
      <AppLayouts breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6 w-full p-4 sm:p-6" id="report-print-area">
          {/* Action Buttons */}
          <div className="flex items-center justify-between print:hidden mb-2">
            <Button variant="outline" size="sm" onClick={() => window.history.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <Button onClick={handlePrint} variant="default" size="sm" className="gap-2">
              <Printer className="h-4 w-4" />
              Cetak Laporan
            </Button>
          </div>

          <Card className="border-none shadow-none sm:border sm:shadow-sm overflow-hidden bg-white">
            <CardContent className="p-6 sm:p-12">
              <ReportHeader period={period} title="Laporan Arus Kas" />

              <div className="mt-8">
                <ActivitySection title="Aktivitas Operasi" items={operating.items} total={operating.total} />
                <ActivitySection title="Aktivitas Investasi" items={investing.items} total={investing.total} />
                <ActivitySection title="Aktivitas Pendanaan" items={financing.items} total={financing.total} />
              </div>

              <div className="mt-10 space-y-2 border-t pt-6">
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm font-bold uppercase tracking-tight">Kenaikan (Penurunan) Bersih Kas</span>
                  <span className="font-mono font-bold">{formatCurrency(netCashFlow)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm">Kas dan Setara Kas Awal Periode</span>
                  <span className="font-mono">{formatCurrency(beginningCashBalance)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-primary text-primary-foreground rounded-sm border shadow-sm mt-4">
                  <span className="font-bold text-sm uppercase tracking-widest text-white">Kas dan Setara Kas Akhir Periode</span>
                  <span className="font-bold text-xl font-mono tracking-tighter text-white">
                    {formatCurrency(endingCashBalance)}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="hidden print:grid grid-cols-2 gap-20 mt-20 text-center">
                <div className="space-y-20">
                  <p className="text-sm font-medium">Dibuat Oleh,</p>
                  <div className="border-t border-black w-48 mx-auto pt-2">
                    <p className="text-xs font-bold uppercase">Accounting</p>
                  </div>
                </div>
                <div className="space-y-20">
                  <p className="text-sm font-medium">Disetujui Oleh,</p>
                  <div className="border-t border-black w-48 mx-auto pt-2">
                    <p className="text-xs font-bold uppercase">Direktur Utama</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayouts>
      <style jsx="true" global="true">{`
        @media print {
          @page { size: A4; margin: 1cm; }
          body { background-color: white !important; color: black !important; }
          .print\:hidden { display: none !important; }
          #report-print-area { width: 100% !important; max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
          .bg-muted { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
          .bg-primary { background-color: #18181b !important; color: white !important; -webkit-print-color-adjust: exact; }
          .bg-primary span { color: white !important; }
        }
      `}</style>
    </>
  );
}