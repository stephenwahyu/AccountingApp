
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

const ReportRow = ({ label, value, isTotal = false, isNet = false, className = '' }) => (
  <div className={`flex justify-between items-center py-2 ${isTotal ? 'font-bold' : ''} ${isNet ? 'text-lg' : ''} ${className}`}>
    <p className={isTotal ? 'pl-4' : ''}>{label}</p>
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
        <div className="max-w-4xl mx-auto" id="report-print-area">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold">Laporan Perubahan Ekuitas</h1>
                    <p className="text-muted-foreground">
                      Periode {new Date(period.start_date).toLocaleDateString('id-ID')} - {new Date(period.end_date).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
                <Button onClick={handlePrint} variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak
                </Button>
              </div>
              <div className="text-center hidden print:block">
                <h1 className="text-xl font-bold">Nama Perusahaan</h1>
                <h2 className="text-lg font-semibold">Laporan Perubahan Ekuitas</h2>
                <p className="text-sm">Untuk Periode yang berakhir pada {new Date(period.end_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <ReportRow label={`Saldo Awal Ekuitas per ${new Date(period.start_date).toLocaleDateString('id-ID')}`} value={beginning_balance.total} isTotal />
                
                <div className="pt-4">
                  <h3 className="text-lg font-semibold mb-2">Perubahan Selama Periode</h3>
                  <ReportRow label="Laba Bersih" value={changes.net_income} />
                  {/* Add other changes like dividends or investments here if available */}
                  {/* e.g., <ReportRow label="Dividen" value={-changes.dividends} /> */}
                  <Separator className="my-2" />
                  <ReportRow label="Total Perubahan" value={changes.net_income} isTotal />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <Separator className="my-4" />
                <ReportRow 
                  label={`Saldo Akhir Ekuitas per ${new Date(period.end_date).toLocaleDateString('id-ID')}`} 
                  value={ending_balance.total} 
                  isNet 
                  isTotal 
                  className="text-xl"
                />
              </div>
            </CardFooter>
          </Card>
        </div>
      </AppLayouts>
      <style jsx="true" global="true">{`
        @media print {
          body { background-color: #fff; }
          body * { visibility: hidden; }
          #report-print-area, #report-print-area * { visibility: visible; }
          #report-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
          }
          .print\:hidden { display: none; }
          .print\:block { display: block; }
          .shadow-lg { box-shadow: none; }
        }
      `}</style>
    </>
  );
}