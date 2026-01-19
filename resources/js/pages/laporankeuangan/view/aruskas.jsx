
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

const ActivitySection = ({ title, items, total }) => (
  <div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    {items.map((item, index) => (
      <div key={index} className="flex justify-between items-center py-1">
        <p>{item.description}</p>
        <p className="font-mono">{formatCurrency(item.balance)}</p>
      </div>
    ))}
    <Separator className="my-2" />
    <div className="flex justify-between items-center font-bold py-1">
      <p>Kas Bersih dari {title}</p>
      <p className="font-mono">{formatCurrency(total)}</p>
    </div>
  </div>
);

export default function ViewArusKas({ report }) {
  const { period, operating, investing, financing } = report;

  const netCashFlow = operating.total + investing.total + financing.total;
  // Assuming a starting cash balance of 0 for simplicity, this should come from the backend
  const beginningCashBalance = 0;
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
        <div className="max-w-4xl mx-auto" id="report-print-area">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold">Laporan Arus Kas</h1>
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
                <h2 className="text-lg font-semibold">Laporan Arus Kas</h2>
                <p className="text-sm">Untuk Periode yang berakhir pada {new Date(period.end_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <ActivitySection title="Aktivitas Operasi" items={operating.items} total={operating.total} />
              <ActivitySection title="Aktivitas Investasi" items={investing.items} total={investing.total} />
              <ActivitySection title="Aktivitas Pendanaan" items={financing.items} total={financing.total} />
            </CardContent>
            <CardFooter className="flex-col items-start p-6">
              <Separator className="mb-4" />
              <div className="w-full flex justify-between font-bold text-lg">
                <p>Kenaikan (Penurunan) Bersih Kas</p>
                <p className="font-mono">{formatCurrency(netCashFlow)}</p>
              </div>
              <div className="w-full flex justify-between mt-2">
                <p>Saldo Kas Awal Periode</p>
                <p className="font-mono">{formatCurrency(beginningCashBalance)}</p>
              </div>
              <Separator className="my-4" />
              <div className="w-full flex justify-between font-bold text-xl">
                <p>Saldo Kas Akhir Periode</p>
                <p className="font-mono">{formatCurrency(endingCashBalance)}</p>
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