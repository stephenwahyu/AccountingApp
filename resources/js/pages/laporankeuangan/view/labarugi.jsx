
import React from "react";
import { Head } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
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

const ReportSection = ({ title, accounts, total }) => (
  <div className="flex flex-col mb-6">
    <h3 className="text-sm font-bold bg-muted p-2 border-x border-t uppercase tracking-tight">{title}</h3>
    <Table className="border">
      <TableBody>
        {accounts.length > 0 ? (
          accounts.map((account) => (
            <TableRow key={account.account_code} className="hover:bg-transparent border-b">
              <TableCell className="py-2 pl-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{account.account_name}</span>
                  <span className="text-xs text-muted-foreground font-mono">{account.account_code}</span>
                </div>
              </TableCell>
              <TableCell className="text-right py-2 font-mono w-48 pr-6">
                {formatCurrency(account.balance)}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={2} className="text-center text-muted-foreground italic py-4">
              Tidak ada data {title}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      <TableFooter>
        <TableRow className="bg-muted/30">
          <TableCell className="font-bold py-2 pl-4 uppercase text-xs tracking-wider">Total {title}</TableCell>
          <TableCell className="text-right font-bold py-2 font-mono pr-6 border-l">
            {formatCurrency(total)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </div>
);

export default function ViewLabaRugi({ report }) {
  const { period, income, expenses, net_income } = report;

  const breadcrumbs = [
    { title: "Laporan Keuangan", href: "/laporan-keuangan" },
    { title: "Laba Rugi", href: "/laporan-keuangan/laba-rugi" },
    { title: period.period_name, href: "#" },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Head title={`Laba Rugi - ${period.period_name}`} />
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
              <ReportHeader period={period} title="Laporan Laba Rugi" />

              <div className="space-y-4 mt-8">
                <ReportSection title="Pendapatan" accounts={income.accounts} total={income.total} />
                <ReportSection title="Beban" accounts={expenses.accounts} total={expenses.total} />
              </div>

              <div className="mt-10 border-t-2 border-double pt-4">
                <div className="flex justify-between items-center p-4 bg-primary text-primary-foreground rounded-sm border shadow-sm">
                  <span className="font-bold text-sm uppercase tracking-widest">
                    {net_income >= 0 ? "Laba Bersih" : "Rugi Bersih"}
                  </span>
                  <span className="font-bold text-xl font-mono tracking-tighter">
                    {formatCurrency(net_income)}
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
        }
      `}</style>
    </>
  );
}