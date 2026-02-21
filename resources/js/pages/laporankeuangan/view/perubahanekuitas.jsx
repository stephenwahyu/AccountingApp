
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

const ReportRow = ({ label, value, isTotal = false, isNet = false, className = '', isHeader = false }) => (
  <div className={`flex justify-between items-center py-2 ${isTotal ? 'font-bold' : ''} ${isNet ? 'text-lg' : ''} ${isHeader ? 'bg-muted/50 px-4 -mx-4 border-y' : ''} ${className}`}>
    <p className={`${isTotal ? 'pl-4' : ''} ${isHeader ? 'uppercase text-xs tracking-widest' : 'text-sm'}`}>{label}</p>
    <p className="font-mono">{formatCurrency(value)}</p>
  </div>
);

export default function ViewPerubahanEkuitas({ report }) {
  const { period, beginning_balance, changes, ending_balance } = report;

  const breadcrumbs = [
    { title: "Laporan Keuangan", href: "/laporan-keuangan" },
    { title: "Perubahan Ekuitas", href: "/laporan-keuangan/perubahan-ekuitas" },
    { title: period.period_name, href: "#" },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Head title={`Perubahan Ekuitas - ${period.period_name}`} />
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
              <ReportHeader period={period} title="Laporan Perubahan Ekuitas" />

              <div className="mt-8 space-y-2 border rounded-sm overflow-hidden">
                <ReportRow 
                  label={`Saldo Awal per ${new Date(period.start_date).toLocaleDateString('id-ID')}`} 
                  value={beginning_balance.total} 
                  isHeader 
                />
                
                <div className="p-4 space-y-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Perubahan Ekuitas</h3>
                  <ReportRow label="Laba (Rugi) Bersih Periode Berjalan" value={changes.net_income} />
                  {changes.others !== 0 && (
                    <ReportRow label="Perubahan Modal Lainnya" value={changes.others} />
                  )}
                  <Separator className="my-2" />
                  <ReportRow label="Total Kenaikan (Penurunan) Ekuitas" value={changes.net_income + changes.others} isTotal className="bg-muted/10 px-2 -mx-2" />
                </div>

                <div className="bg-primary text-primary-foreground p-4">
                  <ReportRow 
                    label={`Saldo Akhir per ${new Date(period.end_date).toLocaleDateString('id-ID')}`} 
                    value={ending_balance.total} 
                    isNet 
                    isTotal 
                    className="text-white"
                  />
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
          .bg-muted { background-color: #FAFAFA !important; -webkit-print-color-adjust: exact; }
          .bg-primary { background-color: #FF0044 !important; color: white !important; -webkit-print-color-adjust: exact; }
          .bg-primary p { color: white !important; }
        }
      `}</style>
    </>
  );
}