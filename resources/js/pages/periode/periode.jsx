import React, { useState, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayouts from "@/pages/layouts/app-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { MoreVertical, Lock, Unlock, Search } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { parseSafeDate } from "@/lib/utils";

const breadcrumbs = [{ title: "Periode Akuntansi", href: "/periode" }];

export default function PeriodeIndex({ periods = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getStatusVariant = (status) => {
    switch (status) {
      case "Open":
        return "success";
      case "Closed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleAction = (period, action) => {
    const url =
      action === "close"
        ? route("periode.close", period.id)
        : route("periode.open", period.id);
    router.post(url, {}, { preserveScroll: true });
  };

  const filteredPeriods = useMemo(() => {
    return periods.filter((period) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        period.period_name.toLowerCase().includes(searchTermLower) ||
        period.period_type.toLowerCase().includes(searchTermLower) ||
        period.status.toLowerCase().includes(searchTermLower)
      );
    });
  }, [periods, searchTerm]);

  const totalRows = filteredPeriods.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const paginatedPeriods = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredPeriods.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredPeriods, currentPage, rowsPerPage]);

  return (
    <>
      <Head title="Periode Akuntansi" />
      <AppLayouts breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">Periode Akuntansi</h1>
            <p className="text-muted-foreground">
              Kelola periode akuntansi Anda. Lakukan tutup buku bulanan di sini.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Periode</CardTitle>
              <CardDescription>
                Berikut adalah daftar semua periode akuntansi yang tercatat
                dalam sistem.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="grid gap-2 w-full md:max-w-sm">
                  <Label className="text-xs uppercase text-muted-foreground font-semibold">Cari</Label>
                  <div className="flex items-center border rounded-md px-2 w-full">
                    <Search className="h-4 w-4 text-muted-foreground mr-2" />
                    <Input
                      type="search"
                      placeholder="Cari periode..."
                      className="flex-1 border-none focus:ring-0 w-full"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">No.</TableHead>
                      <TableHead>Nama Periode</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Tanggal Mulai</TableHead>
                      <TableHead>Tanggal Selesai</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24 text-right">Aksi</TableHead>
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
                          <TableCell className="capitalize">
                            {period.period_type}
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
                          <TableCell>
                            <Badge variant={getStatusVariant(period.status)}>
                              {period.status === "Open" ? "Terbuka" : "Tertutup"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant={period.status === "Open" ? "destructive" : "success"}
                                  size="sm"
                                  className="h-8"
                                  disabled={
                                    (period.status === "Closed" && !period.can_reopen) ||
                                    (period.status === "Open" && !period.can_be_closed)
                                  }
                                >
                                  {period.status === "Open" ? (
                                    <Lock className="mr-2 h-4 w-4" />
                                  ) : (
                                    <Unlock className="mr-2 h-4 w-4" />
                                  )}
                                  <span>{period.status === "Open" ? "Tutup" : "Buka"}</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Apakah Anda benar-benar yakin?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {period.status === "Open"
                                      ? "Menutup periode akan mengunci semua transaksi pada periode ini. Anda tidak dapat membuat, mengubah, atau menghapus jurnal pada periode yang telah ditutup."
                                      : "Membuka kembali periode akan memungkinkan pembuatan dan modifikasi transaksi. Pastikan Anda melakukannya dengan alasan yang kuat."}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleAction(
                                        period,
                                        period.status === "Open"
                                          ? "close"
                                          : "open"
                                      )
                                    }
                                    className={
                                      period.status === "Open"
                                        ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        : "bg-success text-success-foreground hover:bg-success/90"
                                    }
                                  >
                                    Ya, Lanjutkan
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">
                          Tidak ada data periode.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <DataTablePagination
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(value) => {
                  setRowsPerPage(value);
                  setCurrentPage(1);
                }}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                totalPages={totalPages}
                totalRows={totalRows}
                paginatedRows={paginatedPeriods}
              />
            </CardContent>
          </Card>
        </div>
      </AppLayouts>
    </>
  );
}
