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
import { Plus, Printer, X } from "lucide-react";

export default function FormJurnalUmum({ journal = null, accounts = [], periods = [] }) {
  const isEdit = !!journal;
  const breadcrumbs = [
    { title: "Jurnal", href: "/jurnal" },
    { title: "Jurnal Umum", href: "/jurnal/umum" },
    { title: isEdit ? "Edit Jurnal Umum" : "Tambah Jurnal Umum", href: "#" },
  ];

  const [formData, setFormData] = useState({
    entry_date: journal?.entry_date || "",
    entry_number: journal?.entry_number || "",
    fiscal_period_id: journal?.fiscal_period_id || "",
    penerima: journal?.penerima || "",
    details: journal?.details || [
      { account_id: "", description: "", debit: 0, credit: 0 },
      { account_id: "", description: "", debit: 0, credit: 0 },
    ],
  });

  const addRow = () => {
    setFormData({
      ...formData,
      details: [
        ...formData.details,
        { account_id: "", description: "", debit: 0, credit: 0 },
      ],
    });
  };

  const updateDetail = (index, field, value) => {
    const newDetails = [...formData.details];
    newDetails[index][field] = value;
    setFormData({ ...formData, details: newDetails });
  };

  const removeRow = (index) => {
    if (formData.details.length > 2) {
      const newDetails = formData.details.filter((_, i) => i !== index);
      setFormData({ ...formData, details: newDetails });
    }
  };

  const totalDebit = formData.details.reduce(
    (sum, detail) => sum + parseFloat(detail.debit || 0),
    0
  );

  const totalCredit = formData.details.reduce(
    (sum, detail) => sum + parseFloat(detail.credit || 0),
    0
  );

  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isBalanced) {
      if (isEdit) {
        router.put(`/jurnal/umum/${journal.id}`, formData);
      } else {
        router.post("/jurnal/umum", formData);
      }
    }
  };

  const handleCancel = () => {
    router.visit("/jurnal/umum");
  };

  return (
    <>
      <Head title={isEdit ? "Edit Jurnal Umum" : "Tambah Jurnal Umum"} />
      <AppLayouts breadcrumbs={breadcrumbs}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold">
                {isEdit ? "Edit Jurnal Umum" : "Menambah Jurnal Umum"}
              </h1>
              {isEdit && (
                <p className="text-muted-foreground">
                  ID: {journal.entry_number}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white border-0"
              >
                <Printer className="h-4 w-4 mr-2" />
                Cetak
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white border-0"
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white"
                disabled={!isBalanced}
              >
                <Plus className="h-4 w-4 mr-2" />
                {isEdit ? "Simpan" : "Tambah"}
              </Button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Tanggal Entri</label>
              <Input
                type="date"
                value={formData.entry_date}
                onChange={(e) =>
                  setFormData({ ...formData, entry_date: e.target.value })
                }
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Nomor Entri</label>
              <Input
                type="text"
                placeholder="Auto-generated"
                value={formData.entry_number}
                onChange={(e) =>
                  setFormData({ ...formData, entry_number: e.target.value })
                }
                disabled={!isEdit}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Periode</label>
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

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Penerima</label>
              <Input
                type="text"
                placeholder="Nama Penerima"
                value={formData.penerima}
                onChange={(e) =>
                  setFormData({ ...formData, penerima: e.target.value })
                }
              />
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">No.</TableHead>
                  <TableHead className="w-1/4">Akun</TableHead>
                  <TableHead>Uraian</TableHead>
                  <TableHead className="w-40">Debit</TableHead>
                  <TableHead className="w-40">Kredit</TableHead>
                  <TableHead className="w-20">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.details.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}.</TableCell>
                    <TableCell>
                      <Select
                        value={detail.account_id}
                        onValueChange={(value) =>
                          updateDetail(index, "account_id", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Akun" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
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
                        placeholder="Uraian"
                        value={detail.description}
                        onChange={(e) =>
                          updateDetail(index, "description", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="0"
                        value={detail.debit}
                        onChange={(e) =>
                          updateDetail(index, "debit", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="0"
                        value={detail.credit}
                        onChange={(e) =>
                          updateDetail(index, "credit", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {formData.details.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRow(index)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Add Row Button */}
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={addRow}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Kolom
            </Button>
          </div>

          {/* Total and Balance */}
          <div className="border rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div />
              <div className="text-right">
                <div className="text-sm font-medium mb-2">Total Debit</div>
                <div className="text-lg font-bold">
                  {totalDebit.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium mb-2">Total Kredit</div>
                <div className="text-lg font-bold">
                  {totalCredit.toLocaleString("id-ID")}
                </div>
              </div>
            </div>
            <div className="text-center">
              <Button
                type="button"
                variant={isBalanced ? "default" : "destructive"}
                disabled
                className={
                  isBalanced
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }
              >
                {isBalanced ? "SEIMBANG" : "TIDAK SEIMBANG"}
              </Button>
            </div>
          </div>
        </form>
      </AppLayouts>
    </>
  );
}