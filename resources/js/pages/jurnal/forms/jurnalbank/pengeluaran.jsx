import React, { useMemo } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { DatePicker } from "@/components/ui/date-picker";
import { Combobox } from "@/components/ui/combobox";
import { Plus, Trash2, Save, X, Printer, Loader2 } from "lucide-react";

export default function FormPengeluaranBank({ journal = null, accounts = [], periods = [], bankAccounts = [] }) {
  const isEdit = !!journal;
  const breadcrumbs = [
    { title: "Jurnal", href: "/jurnal" },
    { title: "Jurnal Bank", href: "/jurnal/bank" },
    { title: isEdit ? "Edit Pengeluaran Bank" : "Tambah Pengeluaran Bank", href: "#" },
  ];

  const { data, setData, post, put, processing, errors } = useForm({
    entry_date: journal?.entry_date ? new Date(journal.entry_date) : new Date(),
    entry_number: journal?.entry_number || "",
    fiscal_period_id: journal?.fiscal_period_id?.toString() || "",
    penerima: journal?.penerima || "",
    bank_account_id: journal?.bank_account_id?.toString() || "",
    details: journal?.details?.filter(d => d.debit > 0).map(d => ({...d, debit: d.debit.toString()})) || [
      { account_id: "", description: "", debit: "" },
    ],
  });

  const accountOptions = accounts
    .filter(acc => !acc.is_cash_account) // Assuming bank accounts are also cash accounts
    .map((acc) => ({
      value: acc.id.toString(),
      label: `${acc.account_code} - ${acc.account_name}`,
  }));

  const bankAccountOptions = bankAccounts.map((acc) => ({
    value: acc.id.toString(),
    label: `${acc.account_code} - ${acc.account_name}`,
  }));

  const addRow = () => {
    setData("details", [...data.details, { account_id: "", description: "", debit: "" }]);
  };

  const updateDetail = (index, field, value) => {
    const newDetails = [...data.details];
    newDetails[index][field] = value;
    setData("details", newDetails);
  };

  const removeRow = (index) => {
    if (data.details.length > 1) {
      setData("details", data.details.filter((_, i) => i !== index));
    }
  };

  const totalDebit = useMemo(
    () => data.details.reduce((sum, detail) => sum + parseFloat(detail.debit || 0), 0),
    [data.details]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (totalDebit > 0 && data.bank_account_id) {
      if (isEdit) {
        put(route("jurnal.bank.pengeluaran.update", journal.id));
      } else {
        post(route("jurnal.bank.pengeluaran.store"));
      }
    }
  };

  return (
    <>
      <Head title={isEdit ? "Edit Pengeluaran Bank" : "Tambah Pengeluaran Bank"} />
      <AppLayouts breadcrumbs={breadcrumbs}>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {isEdit ? "Edit Pengeluaran Bank" : "Tambah Pengeluaran Bank"}
              </h1>
              <p className="text-muted-foreground">
                Isi form di bawah ini untuk {isEdit ? "mengubah" : "mencatat"} pengeluaran bank.
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" asChild>
                <Link href={route("jurnal.bank")}>
                  <X className="h-4 w-4 mr-2" />
                  Batal
                </Link>
              </Button>
              <Button type="submit" disabled={totalDebit === 0 || !data.bank_account_id || processing}>
                {processing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEdit ? "Simpan Perubahan" : "Simpan"}
              </Button>
              {isEdit && (
                 <Button type="button" variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Cetak
                 </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Detail Transaksi</CardTitle>
                        <CardDescription>Masukkan akun-akun tujuan pengeluaran.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead className="w-[300px]">Akun Debit</TableHead>
                                    <TableHead>Uraian</TableHead>
                                    <TableHead className="w-[180px]">Jumlah</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.details.map((detail, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Combobox
                                                options={accountOptions}
                                                value={detail.account_id}
                                                onSelect={(value) => updateDetail(index, "account_id", value)}
                                                placeholder="Pilih Akun"
                                                searchPlaceholder="Cari akun..."
                                                emptyPlaceholder="Akun tidak ditemukan."
                                            />
                                        </TableCell>
                                        <TableCell>
                                        <Input
                                            type="text"
                                            placeholder="Uraian singkat"
                                            value={detail.description}
                                            onChange={(e) => updateDetail(index, "description", e.target.value)}
                                        />
                                        </TableCell>
                                        <TableCell>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={detail.debit}
                                            onChange={(e) => updateDetail(index, "debit", e.target.value)}
                                            className="text-right"
                                        />
                                        </TableCell>
                                        <TableCell>
                                        {data.details.length > 1 && (
                                            <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeRow(index)}
                                            className="text-muted-foreground hover:text-destructive"
                                            >
                                            <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {errors.details && <p className="text-sm text-destructive mt-2">{errors.details}</p>}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addRow}
                            className="mt-4 gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Baris
                        </Button>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-6 items-center bg-muted/50 py-4 px-6">
                        <div className="grid grid-cols-2 gap-4 w-[400px] text-right">
                             <div>
                                <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
                                <p className="font-semibold text-lg">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalDebit)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Diambil dari Akun Bank (Kredit)</p>
                                 <p className="font-semibold text-lg">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalDebit)}
                                </p>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                    <CardTitle>Informasi Jurnal</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="entry_date">Tanggal Entri</Label>
                        <DatePicker
                        date={data.entry_date}
                        setDate={(date) => setData("entry_date", date)}
                        id="entry_date"
                        />
                        {errors.entry_date && <p className="text-sm text-destructive">{errors.entry_date}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="entry_number">Nomor Entri</Label>
                        <Input
                        id="entry_number"
                        placeholder="Akan dibuat otomatis"
                        value={data.entry_number}
                        onChange={(e) => setData("entry_number", e.target.value)}
                        disabled
                        />
                        {errors.entry_number && <p className="text-sm text-destructive">{errors.entry_number}</p>}
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="bank_account_id">Ambil dari Bank</Label>
                        <Select
                            value={data.bank_account_id}
                            onValueChange={(value) => setData("bank_account_id", value)}
                            >
                            <SelectTrigger id="bank_account_id">
                                <SelectValue placeholder="Pilih Akun Bank" />
                            </SelectTrigger>
                            <SelectContent>
                                {bankAccountOptions.map((account) => (
                                <SelectItem key={account.value} value={account.value}>
                                    {account.label}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.bank_account_id && <p className="text-sm text-destructive">{errors.bank_account_id}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="fiscal_period_id">Periode</Label>
                        <Select
                        value={data.fiscal_period_id}
                        onValueChange={(value) => setData("fiscal_period_id", value)}
                        >
                        <SelectTrigger id="fiscal_period_id">
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
                        {errors.fiscal_period_id && <p className="text-sm text-destructive">{errors.fiscal_period_id}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="penerima">Dibayarkan Kepada</Label>
                        <Input
                        id="penerima"
                        placeholder="Nama penerima (Opsional)"
                        value={data.penerima}
                        onChange={(e) => setData("penerima", e.target.value)}
                        />
                        {errors.penerima && <p className="text-sm text-destructive">{errors.penerima}</p>}
                    </div>
                    </CardContent>
                </Card>
            </div>
          </div>
        </form>
      </AppLayouts>
    </>
  );
}