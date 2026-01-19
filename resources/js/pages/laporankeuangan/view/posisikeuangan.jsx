
import React from "react";
import { Head } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { ArrowLeft, Printer } from "lucide-react";

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
  }).format(value);
};

const ReportTable = ({ title, accounts, total }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Akun</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.account_code}>
              <TableCell>
                <div className="font-medium">{account.account_name}</div>
                <div className="text-sm text-muted-foreground">{account.account_code}</div>
              </TableCell>
              <TableCell className="text-right font-mono">{formatCurrency(account.balance)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-bold">Total {title}</TableCell>
            <TableCell className="text-right font-bold font-mono">{formatCurrency(total)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </CardContent>
  </Card>
);

export default function ViewPosisiKeuangan({ report }) {
  const { period, assets, liabilities, equity } = report;
  const totalLiabilitiesAndEquity = liabilities.total + equity.total;

  const breadcrumbs = [
    { title: "Laporan Keuangan", href: "/laporan-keuangan" },
    { title: "Posisi Keuangan", href: "/laporan-keuangan/posisi-keuangan" },
    { title: period.period_name, href: "#" },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Head title={`Posisi Keuangan - ${period.period_name}`} />
      <AppLayouts breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6" id="report-print-area">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Laporan Posisi Keuangan</h1>
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
            <h2 className="text-lg font-semibold">Laporan Posisi Keuangan</h2>
            <p className="text-sm">Untuk Periode yang berakhir pada {new Date(period.end_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
              <ReportTable title="Aset" accounts={assets.accounts} total={assets.total} />
            </div>
            <div className="flex flex-col gap-6">
              <ReportTable title="Liabilitas" accounts={liabilities.accounts} total={liabilities.total} />
              <ReportTable title="Ekuitas" accounts={equity.accounts} total={equity.total} />
              <Card>
                <CardHeader>
                  <CardTitle>Total Liabilitas dan Ekuitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-right font-bold text-lg font-mono">
                    {formatCurrency(totalLiabilitiesAndEquity)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AppLayouts>
      <style jsx="true" global="true">{`
        @media print {
          body * {
            visibility: hidden;
          }
          #report-print-area, #report-print-area * {
            visibility: visible;
          }
          #report-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\:hidden {
            display: none;
          }
          .print\:block {
            display: block;
          }
        }
      `}</style>
    </>
  );
}