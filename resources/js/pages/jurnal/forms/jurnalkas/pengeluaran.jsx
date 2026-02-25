import React, { useState, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
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
import {
    Plus,
    Trash2,
    Save,
    X,
    Printer,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const buildTree = (accounts) => {
    const accountsById = {};
    accounts.forEach((acc) => {
        accountsById[acc.id] = { ...acc, children: [] };
    });

    const tree = [];
    accounts.forEach((acc) => {
        if (acc.parent_id && accountsById[acc.parent_id]) {
            accountsById[acc.parent_id].children.push(accountsById[acc.id]);
        } else {
            tree.push(accountsById[acc.id]);
        }
    });

    return tree;
};

const flattenTreeForSelect = (nodes, level = 0, options = []) => {
    for (const node of nodes) {
        options.push({
            value: node.id.toString(),
            label: `${node.account_code} - ${node.account_name}`,
            level: level,
            is_cash_account: node.is_cash_account,
            disabled: node.children_count > 0,
        });
        if (node.children.length > 0) {
            flattenTreeForSelect(node.children, level + 1, options);
        }
    }
    return options;
};

export default function FormPengeluaranKas({
    journal = null,
    accounts = [],
    periods = [],
    cashAccounts = [],
}) {
    const isEdit = !!journal;
    const breadcrumbs = [
        { title: "Jurnal", href: route("jurnal.index") },
        { title: "Jurnal Kas", href: route("jurnal.kas") },
        {
            title: isEdit ? "Edit Pengeluaran Kas" : "Tambah Pengeluaran Kas",
            href: "#",
        },
    ];

    const [data, setData] = useState({
        entry_date: journal?.entry_date
            ? new Date(journal.entry_date.replace(/-/g, "/"))
            : new Date(),
        entry_number: journal?.entry_number || "",
        fiscal_period_id: journal?.fiscal_period_id?.toString() || "",
        penerima: journal?.penerima || "",
        cash_account_id: journal?.cash_account_id?.toString() || "",
        details: journal?.details?.map((d) => ({
            account_id: d.account_id.toString(),
            description: d.description || "",
            debit: d.debit,
        })) || [{ account_id: "", description: "", debit: 0 }],
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [submittedStatus, setSubmittedStatus] = React.useState(null);
    const [currentBalance, setCurrentBalance] = useState(null);
    const [loadingBalance, setLoadingBalance] = useState(false);

    const fetchBalance = async (accountId) => {
        if (!accountId) {
            setCurrentBalance(null);
            return;
        }
        setLoadingBalance(true);
        try {
            const url = new URL(route("jurnal.account.balance", accountId));
            if (isEdit) {
                url.searchParams.append("exclude_id", journal.id);
            }
            const response = await fetch(url);
            const result = await response.json();
            setCurrentBalance(result.balance);
        } catch (error) {
            console.error("Failed to fetch balance", error);
        } finally {
            setLoadingBalance(false);
        }
    };

    React.useEffect(() => {
        if (data.cash_account_id) {
            fetchBalance(data.cash_account_id);
        }
    }, []);

    const selectedPeriod = useMemo(() => {
        return periods.find((p) => p.id.toString() === data.fiscal_period_id);
    }, [data.fiscal_period_id, periods]);

    const handlePeriodChange = (value) => {
        const newPeriod = periods.find((p) => p.id.toString() === value);
        if (newPeriod) {
            setData({
                ...data,
                fiscal_period_id: value,
                entry_date: new Date(newPeriod.start_date.replace(/-/g, "/")),
            });
        }
    };

    const disabledDates = useMemo(() => {
        if (!selectedPeriod) {
            // Disable all dates if no period is selected
            return (date) => true;
        }
        const startDate = new Date(
            selectedPeriod.start_date.replace(/-/g, "/"),
        );
        const endDate = new Date(selectedPeriod.end_date.replace(/-/g, "/"));
        // Set time to 0 to compare dates only
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        return (date) => {
            return date < startDate || date > endDate;
        };
    }, [selectedPeriod]);

    const accountOptions = useMemo(() => {
        const tree = buildTree(accounts);
        return flattenTreeForSelect(tree).filter((opt) => !opt.is_cash_account);
    }, [accounts]);

    const cashAccountOptions = cashAccounts.map((acc) => ({
        value: acc.id.toString(),
        label: `${acc.account_code} - ${acc.account_name}`,
    }));

    const addRow = () => {
        setData((prev) => ({
            ...prev,
            details: [
                ...prev.details,
                { account_id: "", description: "", debit: 0 },
            ],
        }));
    };

    const updateDetail = (index, field, value) => {
        const newDetails = [...data.details];
        newDetails[index][field] = value;
        setData((prev) => ({ ...prev, details: newDetails }));
    };

    const removeRow = (index) => {
        if (data.details.length > 1) {
            setData((prev) => ({
                ...prev,
                details: prev.details.filter((_, i) => i !== index),
            }));
        }
    };

    const totalDebit = useMemo(
        () =>
            data.details.reduce(
                (sum, detail) => sum + parseFloat(detail.debit || 0),
                0,
            ),
        [data.details],
    );

    const handleSubmit = (statusValue) => {
        if (totalDebit <= 0) {
            toast.error("Total pengeluaran harus lebih dari 0.");
            return;
        }
            if (!data.cash_account_id) {
                toast.error("Harap pilih akun kas sumber dana.");
                return;
            }
        
            if (statusValue === 'Posted' && currentBalance < totalDebit) {
                toast.error("Saldo tidak mencukupi untuk melakukan posting transaksi ini.");
                return;
            }
            
            setProcessing(true);        setSubmittedStatus(statusValue);
        setErrors({});

        const submitData = {
            ...data,
            status: statusValue,
            entry_date: data.entry_date
                ? new Date(
                      data.entry_date.getTime() -
                          data.entry_date.getTimezoneOffset() * 60000,
                  )
                      .toISOString()
                      .split("T")[0]
                : null,
        };

        const url = isEdit
            ? route("jurnal.kas.pengeluaran.update", journal.id)
            : route("jurnal.kas.pengeluaran.store");

        const method = isEdit ? "put" : "post";

        router[method](url, submitData, {
            onSuccess: () => {
                setProcessing(false);
                setSubmittedStatus(null);
            },
            onError: (errors) => {
                setErrors(errors);
                toast.error(
                    "Gagal menyimpan pengeluaran kas. Harap periksa kembali inputan Anda.",
                );
                setProcessing(false);
                setSubmittedStatus(null);
            },
        });
    };

    return (
        <>
            <Head
                title={
                    isEdit ? "Edit Pengeluaran Kas" : "Tambah Pengeluaran Kas"
                }
            />
            <AppLayouts breadcrumbs={breadcrumbs}>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {isEdit
                                    ? "Edit Pengeluaran Kas"
                                    : "Tambah Pengeluaran Kas"}
                            </h1>
                            <p className="text-muted-foreground">
                                Isi form di bawah ini untuk{" "}
                                {isEdit ? "mengubah" : "mencatat"} pengeluaran
                                kas.
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2 w-full sm:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                asChild
                                className="w-full sm:w-auto"
                            >
                                <Link href={route("jurnal.kas")}>
                                    <X className="h-4 w-4 mr-2" />
                                    Batal
                                </Link>
                            </Button>
                            <Button
                                onClick={() => handleSubmit("Draft")}
                                disabled={
                                    totalDebit === 0 ||
                                    !data.cash_account_id ||
                                    processing
                                }
                                variant="secondary"
                                className="w-full sm:w-auto"
                            >
                                {processing && submittedStatus === "Draft" ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Simpan Draft
                            </Button>
                            <Button
                                onClick={() => handleSubmit("Posted")}
                                disabled={
                                    totalDebit === 0 ||
                                    !data.cash_account_id ||
                                    processing
                                }
                                className="w-full sm:w-auto"
                            >
                                {processing && submittedStatus === "Posted" ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Simpan & Posting
                            </Button>
                            {isEdit && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                >
                                    <Printer className="h-4 w-4 mr-2" />
                                    Cetak
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Section 1: Informasi Jurnal */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Informasi Jurnal
                                </CardTitle>
                                <CardDescription>
                                    Atur data administratif dan akun kas sumber
                                    dana.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="entry_date"
                                            className="text-xs uppercase tracking-wider text-muted-foreground"
                                        >
                                            Tanggal Entri
                                        </Label>
                                        <DatePicker
                                            date={data.entry_date}
                                            setDate={(date) =>
                                                setData((prev) => ({
                                                    ...prev,
                                                    entry_date: date,
                                                }))
                                            }
                                            disabled={disabledDates}
                                            defaultMonth={
                                                selectedPeriod
                                                    ? new Date(
                                                          selectedPeriod.start_date.replace(
                                                              /-/g,
                                                              "/",
                                                          ),
                                                      )
                                                    : undefined
                                            }
                                            id="entry_date"
                                        />
                                        {errors.entry_date && (
                                            <p className="text-xs text-destructive">
                                                {errors.entry_date}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2 lg:col-span-2">
                                        <div className="flex flex-col gap-3 md:items-center md:flex-row">
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor="cash_account_id"
                                                    className="text-xs uppercase tracking-wider text-muted-foreground"
                                                >
                                                    Ambil dari Akun Kas
                                                </Label>
                                                <Select
                                                    value={data.cash_account_id}
                                                    onValueChange={(value) => {
                                                        setData((prev) => ({
                                                            ...prev,
                                                            cash_account_id:
                                                                value,
                                                        }));
                                                        fetchBalance(value);
                                                    }}
                                                >
                                                    <SelectTrigger
                                                        id="cash_account_id"
                                                        className="bg-primary/5 border-primary/20"
                                                    >
                                                        <SelectValue placeholder="Pilih Akun Kas" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {cashAccountOptions.map(
                                                            (account) => (
                                                                <SelectItem
                                                                    key={
                                                                        account.value
                                                                    }
                                                                    value={
                                                                        account.value
                                                                    }
                                                                >
                                                                    {
                                                                        account.label
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {data.cash_account_id && (
                                                <div className="md:mt-6 mt-1 flex-col grow items-center justify-between ">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                                                            Saldo Terkini:
                                                        </span>
                                                        {loadingBalance ? (
                                                            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                                        ) : (
                                                            <span
                                                                className={cn(
                                                                    "text-xs font-bold",
                                                                    currentBalance <
                                                                        totalDebit
                                                                        ? "text-destructive"
                                                                        : "text-primary",
                                                                )}
                                                            >
                                                                {new Intl.NumberFormat(
                                                                    "id-ID",
                                                                    {
                                                                        style: "currency",
                                                                        currency:
                                                                            "IDR",
                                                                        minimumFractionDigits: 0,
                                                                    },
                                                                ).format(
                                                                    currentBalance,
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {!loadingBalance &&
                                                        currentBalance <
                                                            totalDebit && (
                                                            <div className="flex items-center gap-1 text-[10px] font-medium text-destructive">
                                                                <AlertCircle className="h-3 w-3" />
                                                                Saldo tidak
                                                                cukup
                                                            </div>
                                                        )}
                                                </div>
                                            )}
                                            {errors.cash_account_id && (
                                                <p className="text-xs text-destructive">
                                                    {errors.cash_account_id}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="fiscal_period_id"
                                            className="text-xs uppercase tracking-wider text-muted-foreground"
                                        >
                                            Periode
                                        </Label>
                                        <Select
                                            value={data.fiscal_period_id}
                                            onValueChange={handlePeriodChange}
                                        >
                                            <SelectTrigger
                                                id="fiscal_period_id"
                                                className="bg-muted/30"
                                            >
                                                <SelectValue placeholder="Pilih Periode" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {periods.map((period) => (
                                                    <SelectItem
                                                        key={period.id}
                                                        value={period.id.toString()}
                                                    >
                                                        {period.period_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.fiscal_period_id && (
                                            <p className="text-xs text-destructive">
                                                {errors.fiscal_period_id}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="penerima"
                                            className="text-xs uppercase tracking-wider text-muted-foreground"
                                        >
                                            Dibayarkan Kepada
                                        </Label>
                                        <Input
                                            id="penerima"
                                            placeholder="Nama penerima (Opsional)"
                                            value={data.penerima}
                                            onChange={(e) =>
                                                setData((prev) => ({
                                                    ...prev,
                                                    penerima: e.target.value,
                                                }))
                                            }
                                        />
                                        {errors.penerima && (
                                            <p className="text-xs text-destructive">
                                                {errors.penerima}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section 2: Detail Transaksi */}
                        <Card className="overflow-hidden border-primary/10 shadow-md">
                            <CardHeader className="bg-muted/20 pb-4 border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">
                                            Tujuan Pengeluaran
                                        </CardTitle>
                                        <CardDescription>
                                            Tentukan akun-akun beban atau
                                            liabilitas sebagai tujuan
                                            pengeluaran kas.
                                        </CardDescription>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addRow}
                                        className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Tambah Baris
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead className="w-[30%] pl-6">
                                                    Akun Debit
                                                </TableHead>
                                                <TableHead className="w-[50%]">
                                                    Uraian
                                                </TableHead>
                                                <TableHead className="w-[15%] text-right">
                                                    Jumlah
                                                </TableHead>
                                                <TableHead className="w-[5%] text-center pr-6"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.details.map(
                                                (detail, index) => (
                                                    <TableRow
                                                        key={index}
                                                        className="hover:bg-muted/5 transition-colors"
                                                    >
                                                        <TableCell className="pl-6 py-3">
                                                            <Combobox
                                                                options={
                                                                    accountOptions
                                                                }
                                                                value={
                                                                    detail.account_id
                                                                }
                                                                onSelect={(
                                                                    value,
                                                                ) =>
                                                                    updateDetail(
                                                                        index,
                                                                        "account_id",
                                                                        value,
                                                                    )
                                                                }
                                                                placeholder="Pilih Akun"
                                                                searchPlaceholder="Cari akun..."
                                                                emptyPlaceholder="Akun tidak ditemukan."
                                                            />
                                                        </TableCell>
                                                        <TableCell className="py-3">
                                                            <Input
                                                                type="text"
                                                                placeholder="Deskripsi singkat"
                                                                value={
                                                                    detail.description
                                                                }
                                                                onChange={(e) =>
                                                                    updateDetail(
                                                                        index,
                                                                        "description",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="border-transparent hover:border-input focus:border-primary transition-all"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="py-3">
                                                            <Input
                                                                type="number"
                                                                placeholder="0"
                                                                value={
                                                                    detail.debit ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    updateDetail(
                                                                        index,
                                                                        "debit",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="text-right font-mono focus:ring-primary/20"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-center pr-6 py-3">
                                                            {data.details
                                                                .length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        removeRow(
                                                                            index,
                                                                        )
                                                                    }
                                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                {errors.details && (
                                    <p className="text-sm text-destructive p-4 italic">
                                        * {errors.details}
                                    </p>
                                )}
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row justify-between gap-6 items-stretch sm:items-center bg-muted/30 py-6 px-6 border-t">
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs uppercase font-semibold text-muted-foreground">
                                        Akun Kas Sumber
                                    </p>
                                    <p className="text-sm font-medium">
                                        {data.cash_account_id
                                            ? cashAccountOptions.find(
                                                  (o) =>
                                                      o.value ===
                                                      data.cash_account_id,
                                              )?.label
                                            : "Belum dipilih"}
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-8">
                                    <div className="text-right">
                                        <p className="text-xs uppercase font-semibold text-muted-foreground mb-1">
                                            Total Pengeluaran
                                        </p>
                                        <p className="font-mono text-2xl font-bold text-primary">
                                            {new Intl.NumberFormat("id-ID", {
                                                style: "currency",
                                                currency: "IDR",
                                                minimumFractionDigits: 0,
                                            }).format(totalDebit)}
                                        </p>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </form>
            </AppLayouts>
        </>
    );
}
