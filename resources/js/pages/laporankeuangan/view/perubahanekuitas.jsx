import React from "react";
import { Head, Link } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Printer } from "lucide-react";

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function ViewPerubahanEkuitas({ report }) {
  const breadcrumbs = [
    { title: "Laporan Keuangan", href: "/laporan-keuangan" },
    { title: "Perubahan Ekuitas", href: "/laporan-keuangan/perubahan-ekuitas" },
    { title: report.period.period_name, href: "#" },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Head title={`Perubahan Ekuitas - ${report.period.period_name}`} />
      <AppLayouts breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6 print-content">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Perubahan Ekuitas</h1>
                <p className="text-muted-foreground">
                  Periode {report.period.start_date} - {report.period.end_date}
                </p>
              </div>
            </div>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Cetak
            </Button>
          </div>

          {/* SALDO AWAL SELAMA PERIODE */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Saldo Awal Selama Periode</CardTitle>
                <div className="text-lg font-semibold">
                  Total: {formatCurrency(report.beginning_balance.total)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Periode</TableHead>
                      <TableHead>Tanggal Awal</TableHead>
                      <TableHead>Tanggal Akhir</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.beginning_balance.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.period_name}</TableCell>
                        <TableCell>{item.start_date}</TableCell>
                        <TableCell>{item.end_date}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(item.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* PERUBAHAN SELAMA PERIODE */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Perubahan Selama Periode</CardTitle>
                <div className="text-lg font-semibold">
                  Total: {formatCurrency(report.changes.total)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Periode</TableHead>
                      <TableHead>Tanggal Awal</TableHead>
                      <TableHead>Tanggal Akhir</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.changes.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.period_name}</TableCell>
                        <TableCell>{item.start_date}</TableCell>
                        <TableCell>{item.end_date}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(item.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* SALDO AKHIR SELAMA PERIODE */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Saldo Akhir Selama Periode</CardTitle>
                <div className="text-lg font-semibold">
                  Total: {formatCurrency(report.ending_balance.total)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Periode</TableHead>
                      <TableHead>Tanggal Awal</TableHead>
                      <TableHead>Tanggal Akhir</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.ending_balance.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.period_name}</TableCell>
                        <TableCell>{item.start_date}</TableCell>
                        <TableCell>{item.end_date}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(item.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        <style jsx="true" global="true">{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-content, .print-content * {
              visibility: visible;
            }
            .print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
      </AppLayouts>
    </>
  );
}