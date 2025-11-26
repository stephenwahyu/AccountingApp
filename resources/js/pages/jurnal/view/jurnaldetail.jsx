import React from "react";
import { Head, router } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

export default function ViewDetailJurnal({ journal }) {
  const breadcrumbs = [
    { title: "Jurnal", href: "/jurnal" },
    { 
      title: journal.journal_type === "Umum" ? "Jurnal Umum" :
             journal.journal_type.includes("Kas") ? "Jurnal Kas" : "Jurnal Bank",
      href: journal.journal_type === "Umum" ? "/jurnal/umum" :
            journal.journal_type.includes("Kas") ? "/jurnal/kas" : "/jurnal/bank"
    },
    { title: journal.entry_number, href: "#" },
  ];

  const totalDebit = journal.details.reduce(
    (sum, detail) => sum + parseFloat(detail.debit || 0),
    0
  );

  const totalCredit = journal.details.reduce(
    (sum, detail) => sum + parseFloat(detail.credit || 0),
    0
  );

  const handleBack = () => {
    if (journal.journal_type === "Umum") {
      router.visit("/jurnal/umum");
    } else if (journal.journal_type.includes("Kas")) {
      router.visit("/jurnal/kas");
    } else {
      router.visit("/jurnal/bank");
    }
  };

  const handleEdit = () => {
    if (journal.journal_type === "Umum") {
      router.visit(`/jurnal/umum/${journal.id}/edit`);
    } else if (journal.journal_type === "Kas Masuk") {
      router.visit(`/jurnal/kas/pemasukan/${journal.id}/edit`);
    } else if (journal.journal_type === "Kas Keluar") {
      router.visit(`/jurnal/kas/pengeluaran/${journal.id}/edit`);
    } else if (journal.journal_type === "Bank Masuk") {
      router.visit(`/jurnal/bank/pemasukan/${journal.id}/edit`);
    } else if (journal.journal_type === "Bank Keluar") {
      router.visit(`/jurnal/bank/pengeluaran/${journal.id}/edit`);
    }
  };

  const handleDelete = () => {
    if (confirm("Apakah Anda yakin ingin menghapus jurnal ini?")) {
      router.delete(`/jurnal/${journal.id}`);
    }
  };

  return (
    <>
      <Head title={`Detail Jurnal - ${journal.entry_number}`} />
      <AppLayouts breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold">Rincian Jurnal {journal.journal_type}</h1>
                <p className="text-muted-foreground">ID: {journal.entry_number}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white border-0"
                onClick={handleEdit}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            </div>
          </div>

          {/* Form Fields - Read Only */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Tanggal Entri</label>
              <Input
                type="text"
                value={new Date(journal.entry_date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Nomor Entri</label>
              <Input
                type="text"
                value={journal.entry_number}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Periode</label>
              <Input
                type="text"
                value={journal.fiscal_period?.period_name || "-"}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Tipe</label>
              <Input
                type="text"
                value={journal.journal_type}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="flex flex-col gap-2 col-span-2">
              <label className="text-sm font-medium">Penerima</label>
              <Input
                type="text"
                value={journal.penerima || "-"}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          {/* Table - Read Only */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">No.</TableHead>
                  <TableHead className="w-1/4">Akun</TableHead>
                  <TableHead>Uraian</TableHead>
                  <TableHead className="w-40 text-right">Debit</TableHead>
                  <TableHead className="w-40 text-right">Kredit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journal.details.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}.</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {detail.account?.account_code}
                        </div>
                        <div className="text-muted-foreground">
                          {detail.account?.account_name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{detail.description || "-"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {detail.debit > 0 ? detail.debit.toLocaleString("id-ID") : "0"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {detail.credit > 0 ? detail.credit.toLocaleString("id-ID") : "0"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Total */}
          <div className="border rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-lg font-bold">Total</div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {totalDebit.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {totalCredit.toLocaleString("id-ID")}
                </div>
              </div>
            </div>
            <div className="text-center">
              <Button
                type="button"
                variant="default"
                disabled
                className="bg-green-500 hover:bg-green-600"
              >
                SEIMBANG
              </Button>
            </div>
          </div>

          {/* Status and Metadata */}
          <div className="border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <div className="font-medium">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      journal.status === "Posted"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {journal.status}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Dibuat oleh</div>
                <div className="font-medium">{journal.user?.name || "-"}</div>
              </div>

              {journal.posted_by && (
                <>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Tanggal Posting
                    </div>
                    <div className="font-medium">
                      {new Date(journal.posted_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Diposting oleh
                    </div>
                    <div className="font-medium">{journal.posted_by_user?.name || "-"}</div>
                  </div>
                </>
              )}

              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Tanggal Dibuat
                </div>
                <div className="font-medium">
                  {new Date(journal.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Terakhir Diubah
                </div>
                <div className="font-medium">
                  {new Date(journal.updated_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayouts>
    </>
  );
}