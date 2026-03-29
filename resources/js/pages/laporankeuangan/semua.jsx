// File: resources/js/pages/laporankeuangan/semua.jsx

import React, { useState, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, ChevronLeft, ChevronRight, Search, FileText } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { parseSafeDate } from "@/lib/utils";

const breadcrumbs = [
  { title: "Laporan Keuangan", href: "/laporan-keuangan" },
];

export default function LaporanKeuanganSemua({ periods = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleTabChange = (value) => {
    router.visit(value);
  };

  const filteredPeriods = useMemo(() => {
    return periods.filter((period) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        period.period_name.toLowerCase().includes(searchTermLower) ||
        period.start_date.toLowerCase().includes(searchTermLower) ||
        period.end_date.toLowerCase().includes(searchTermLower)
      );
    });
  }, [periods, searchTerm]);

  const totalRows = filteredPeriods.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const paginatedPeriods = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredPeriods.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredPeriods, currentPage, rowsPerPage]);

  const reportTypes = [
    { label: "Posisi Keuangan", route: "laporan-keuangan.posisi-keuangan.show", color: "bg-crimson" },
    { label: "Laba Rugi", route: "laporan-keuangan.laba-rugi.show", color: "bg-green-500" },
    { label: "Arus Kas", route: "laporan-keuangan.arus-kas.show", color: "bg-amber-500" },
    { label: "Perubahan Ekuitas", route: "laporan-keuangan.perubahan-ekuitas.show", color: "bg-burgundy" },
  ];

  return (
    <>
      <Head title="Laporan Keuangan" />
      <AppLayouts breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">Laporan Keuangan</h1>
            <p className="text-muted-foreground">
              Semua laporan keuangan yang tersedia
            </p>
          </div>

          <Tabs value="/laporan-keuangan" onValueChange={handleTabChange}>
            <div className="w-full overflow-x-auto">
              <TabsList className="justify-start min-w-max">
                <TabsTrigger value="/laporan-keuangan">Semua</TabsTrigger>
                <TabsTrigger value="/laporan-keuangan/posisi-keuangan">
                  Posisi Keuangan
                </TabsTrigger>
                <TabsTrigger value="/laporan-keuangan/laba-rugi">
                  Laba Rugi
                </TabsTrigger>
                <TabsTrigger value="/laporan-keuangan/arus-kas">
                  Arus Kas
                </TabsTrigger>
                <TabsTrigger value="/laporan-keuangan/perubahan-ekuitas">
                  Perubahan Ekuitas
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Pilih Periode & Jenis Laporan</CardTitle>
              <CardDescription>
                Pilih periode dan jenis laporan keuangan yang ingin Anda lihat.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mb-4">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Cari periode..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">No.</TableHead>
                      <TableHead>Periode</TableHead>
                      <TableHead>Tanggal Awal</TableHead>
                      <TableHead>Tanggal Akhir</TableHead>
                      <TableHead className="w-16 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPeriods.length > 0 ? (
                      paginatedPeriods.map((period, index) => (
                        <TableRow key={period.id}>
                          <TableCell>
                            {(currentPage - 1) * rowsPerPage + index + 1}.
                          </TableCell>
                          <TableCell className="font-medium">
                            {period.period_name}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const d = parseSafeDate(period.start_date);
                              return d ? format(d, "d MMMM yyyy", { locale: id }) : "-";
                            })()}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const d = parseSafeDate(period.end_date);
                              return d ? format(d, "d MMMM yyyy", { locale: id }) : "-";
                            })()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  aria-label="Menu Aksi"
                                >                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {reportTypes.map((report) => (
                                  <DropdownMenuItem key={report.route} asChild>
                                    <Link href={route(report.route, period.id)}>
                                      <div className={`h-2 w-2 rounded-full ${report.color} mr-2`} />
                                      {report.label}
                                    </Link>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                          Tidak ada data periode.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Menampilkan {paginatedPeriods.length} dari {totalRows} baris.
                </p>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Baris per halaman</span>
                    <Select
                      value={rowsPerPage.toString()}
                      onValueChange={(value) => {
                        setRowsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[70px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-accent"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        aria-label="Halaman Pertama"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <ChevronLeft className="h-4 w-4 -ml-2.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-accent"
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        disabled={currentPage === 1}
                        aria-label="Halaman Sebelumnya"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-accent"
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Halaman Berikutnya"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-accent"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        aria-label="Halaman Terakhir"
                      >
                        <ChevronRight className="h-4 w-4" />
                        <ChevronRight className="h-4 w-4 -ml-2.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((report) => (
              <Card key={report.route}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${report.color}`} />
                    <CardTitle className="text-sm font-medium">
                      {report.label}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {report.label === "Posisi Keuangan" && "Laporan aset, liabilitas, dan ekuitas"}
                    {report.label === "Laba Rugi" && "Laporan pendapatan dan beban"}
                    {report.label === "Arus Kas" && "Laporan aktivitas kas operasi, investasi, dan pendanaan"}
                    {report.label === "Perubahan Ekuitas" && "Laporan perubahan modal perusahaan"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayouts>
    </>
  );
}
