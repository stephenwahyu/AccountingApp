import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Printer, X, Save } from "lucide-react";

export default function FormPengeluaranBank({ journal = null, accounts = [], periods = [], bankAccounts = [] }) {
  const isEdit = !!journal;
  
  const breadcrumbs = [
    { title: "Jurnal", href: "/jurnal" },
    { title: "Jurnal Bank", href: "/jurnal/bank" },
    { title: isEdit ? "Edit Pengeluaran Bank" : "Tambah Pengeluaran Bank", href: "#" },
  ];

  const [formData, setFormData] = useState({
    entry_date: journal?.entry_date || new Date().toISOString().split('T')[0],
    entry_number: journal?.entry_number || "",
    fiscal_period_id: journal?.fiscal_period_id || "",
    penerima: journal?.penerima || "", // Diisi "Dibayarkan Kepada"
    bank_account_id: journal?.details?.find(d => bankAccounts.some(ba => ba.id === d.account_id))?.account_id || "",
    details: journal?.details?.filter(d => !bankAccounts.some(ba => ba.id === d.account_id)) || [
      { account_id: "", description: "", debit: 0 },
    ],
  });

  const addRow = () => {
    setFormData({
      ...formData,
      details: [
        ...formData.details,
        { account_id: "", description: "", debit: 0 },
      ],
    });
  };

  const updateDetail = (index, field, value) => {
    const newDetails = [...formData.details];
    newDetails[index][field] = value;
    setFormData({ ...formData, details: newDetails });
  };

  const removeRow = (index) => {
    if (formData.details.length > 1) {
      const newDetails = formData.details.filter((_, i) => i !== index);
      setFormData({ ...formData, details: newDetails });
    }
  };

  // Total Debit pada detail = Total Kredit pada Bank
  const totalAmount = formData.details.reduce(
    (sum, detail) => sum + parseFloat(detail.debit || 0),
    0
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (totalAmount > 0 && formData.bank_account_id) {
      if (isEdit) {
        router.put(`/jurnal/bank/pengeluaran/${journal.id}`, formData);
      } else {
        router.post("/jurnal/bank/pengeluaran", formData);
      }
    }
  };

  const handleCancel = () => {
    router.visit("/jurnal/bank");
  };

  return (
    <>
      <Head title={isEdit ? "Edit Pengeluaran Bank" : "Tambah Pengeluaran Bank"} />
      <AppLayouts breadcrumbs={breadcrumbs}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-tight">
                {isEdit ? "Edit Pembayaran Bank" : "Input Pembayaran Bank"}
              </h1>
              <p className="text-muted-foreground text-sm">
                Catat transaksi pengeluaran uang dari rekening bank.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={totalAmount === 0 || !formData.bank_account_id}
              >
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? "Simpan Perubahan" : "Simpan Transaksi"}
              </Button>
            </div>
          </div>

          {/* Form Utama */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4 bg-card">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Transaksi</label>
              <Input
                type="date"
                value={formData.entry_date}
                onChange={(e) =>
                  setFormData({ ...formData, entry_date: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nomor Bukti / Referensi</label>
              <Input
                type="text"
                placeholder="(Otomatis jika kosong)"
                value={formData.entry_number}
                onChange={(e) =>
                  setFormData({ ...formData, entry_number: e.target.value })
                }
                disabled={isEdit}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Periode Akuntansi</label>
              <Select
                value={formData.fiscal_period_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, fiscal_period_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Periode" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.id} value={period.id.toString()}>
                      {period.period_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dibayarkan Kepada</label>
              <Input
                type="text"
                placeholder="Nama Vendor / Karyawan"
                value={formData.penerima}
                onChange={(e) =>
                  setFormData({ ...formData, penerima: e.target.value })
                }
              />
            </div>
          </div>

          {/* Akun Bank (Kredit) */}
          <div className="flex items-center gap-4 p-4 bg-red-50/50 border border-red-100 rounded-lg">
            <div className="flex-1">
              <label className="text-sm font-bold text-red-700 mb-1 block">Keluar dari Bank (Kredit)</label>
              <Select
                value={formData.bank_account_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, bank_account_id: value })
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Pilih Akun Bank" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.account_code} - {account.account_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-right min-w-[200px]">
              <div className="text-sm text-muted-foreground">Total Keluar</div>
              <div className="text-2xl font-bold text-red-700">
                Rp {totalAmount.toLocaleString("id-ID")}
              </div>
            </div>
          </div>

          {/* Tabel Rincian (Debit) */}
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="p-2 bg-muted/30 border-b">
              <h3 className="font-semibold text-sm">Rincian Biaya / Hutang (Debit)</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead className="min-w-[250px]">Akun Biaya / Tujuan</TableHead>
                  <TableHead className="min-w-[200px]">Keterangan</TableHead>
                  <TableHead className="w-[200px] text-right">Nominal (Debit)</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.details.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell>
                      <Select
                        value={detail.account_id}
                        onValueChange={(value) =>
                          updateDetail(index, "account_id", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Akun Lawan" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts
                            .filter((acc) => !acc.is_cash_account) // Filter akun non-kas/bank
                            .map((account) => (
                              <SelectItem
                                key={account.id}
                                value={account.id.toString()}
                              >
                                {account.account_code} - {account.account_name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        placeholder="Uraian transaksi..."
                        value={detail.description}
                        onChange={(e) =>
                          updateDetail(index, "description", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="text-right"
                        placeholder="0"
                        min="0"
                        value={detail.debit}
                        onChange={(e) =>
                          updateDetail(index, "debit", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {formData.details.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRow(index)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-2 border-t bg-muted/30">
                <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addRow}
                className="gap-2 text-muted-foreground hover:text-foreground"
                >
                <Plus className="h-4 w-4" />
                Tambah Baris
                </Button>
            </div>
          </div>
        </form>
      </AppLayouts>
    </>
  );
}