import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreVertical, Lock, Unlock } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const breadcrumbs = [{ title: "Periode Akuntansi", href: "/periode" }];

export default function PeriodeIndex({ periods = [] }) {
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
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Periode</TableHead>
                      <TableHead>Tanggal Mulai</TableHead>
                      <TableHead>Tanggal Selesai</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {periods.length > 0 ? (
                      periods.map((period) => (
                        <TableRow key={period.id}>
                          <TableCell className="font-medium">
                            {period.period_name}
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(period.start_date),
                              "d MMMM yyyy",
                              { locale: id }
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(period.end_date), "d MMMM yyyy", {
                              locale: id,
                            })}
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
                                  <span>{period.status === "Open" ? "Tutup Periode" : "Buka Periode"}</span>
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
                        <TableCell colSpan={5} className="text-center h-24">
                          Tidak ada data periode.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayouts>
    </>
  );
}
