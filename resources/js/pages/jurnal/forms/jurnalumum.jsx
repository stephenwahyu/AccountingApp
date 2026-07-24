import React, { useState, useMemo, lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { Head, Link, router } from "@inertiajs/react";
import AppLayouts from "@/pages/layouts/app-layout";
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
import { Plus, Trash2, Save, X, Loader2 } from "lucide-react";
import { cn, parseSafeDate, generateUniqueId } from "@/lib/utils";
import { toast } from "sonner";

const DatePicker = lazy(() => import("@/components/ui/date-picker").then(module => ({ default: module.DatePicker })));
const Combobox = lazy(() => import("@/components/ui/combobox").then(module => ({ default: module.Combobox })));

const buildTree = (accounts) => {
    const accountsById = {};
    for (const acc of accounts) {
        accountsById[acc.id] = { ...acc, children: [] };
    }

    const tree = [];
    for (const acc of accounts) {
        if (acc.parent_id && accountsById[acc.parent_id]) {
            accountsById[acc.parent_id].children.push(accountsById[acc.id]);
        } else {
            tree.push(accountsById[acc.id]);
        }
    }

    return tree;
};

const flattenTreeForSelect = (nodes, level = 0, options = []) => {
    for (const node of nodes) {
        options.push({
            value: node.id.toString(),
            label: `${node.account_code} - ${node.account_name}`,
            level: level,
            disabled: node.children_count > 0,
        });
        if (node.children.length > 0) {
            flattenTreeForSelect(node.children, level + 1, options);
        }
    }
    return options;
};

export default function FormJurnalUmum({
    journal = null,
    accounts = [],
    periods = [],
},) {
    const isEdit = !!journal;
    const breadcrumbs = [
        { title: "Jurnal", href: "/jurnal" },
        { title: "Jurnal Umum", href: "/jurnal/umum" },
        {
            title: isEdit ? "Edit Jurnal Umum" : "Tambah Jurnal Umum",
            href: "#",
        },
    ];

    // ✅ State biasa, BUKAN useForm
    const [data, setData] = useState({
        entry_date: journal?.entry_date
            ? parseSafeDate(journal.entry_date)
            : new Date(),
        entry_number: journal?.entry_number || "",
        fiscal_period_id: journal?.fiscal_period_id?.toString() || "",
        penerima: journal?.penerima || "",
        details: journal?.details?.map((d) => ({
            temp_id: d.id || generateUniqueId(),
            account_id: d.account_id.toString(),
            description: d.description || "",
            debit: Number.parseFloat(d.debit || 0),
            credit: Number.parseFloat(d.credit || 0),
        })) || [
            { temp_id: generateUniqueId(), account_id: "", description: "", debit: 0, credit: 0 },
            { temp_id: generateUniqueId(), account_id: "", description: "", debit: 0, credit: 0 },
        ],
    });

    const [processing, setProcessing] = useState(false);
    const [submittedStatus, setSubmittedStatus] = useState(null);
    const [errors, setErrors] = useState({});

    const selectedPeriod = useMemo(() => {
        return periods.find(
            (p) => p.id.toString() === data.fiscal_period_id
        );
    }, [data.fiscal_period_id, periods]);

    const handlePeriodChange = (value) => {
        const newPeriod = periods.find((p) => p.id.toString() === value);
        if (newPeriod) {
            setData({
                ...data,
                fiscal_period_id: value,
                entry_date: parseSafeDate(newPeriod.start_date),
            });
        }
    };
    
    const disabledDates = useMemo(() => {
        if (!selectedPeriod) {
            // Disable all dates if no period is selected
            return (date) => true;
        }
        const startDate = parseSafeDate(selectedPeriod.start_date);
        const endDate = parseSafeDate(selectedPeriod.end_date);
        if (!startDate || !endDate) return (date) => false;
        // Set time to 0 to compare dates only
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    
        return (date) => {
            return date < startDate || date > endDate;
        };
    }, [selectedPeriod]);

    const accountOptions = useMemo(() => {
        const tree = buildTree(accounts);
        return flattenTreeForSelect(tree);
    }, [accounts]);

    const addRow = () => {
        setData({
            ...data,
            details: [
                ...data.details,
                { temp_id: generateUniqueId(), account_id: "", description: "", debit: 0, credit: 0 },
            ],
        });
    };

    const updateDetail = (index, field, value) => {
        const newDetails = [...data.details];
        newDetails[index][field] = value;

        if (field === "debit" && value !== "") {
            newDetails[index]["credit"] = 0;
        } else if (field === "credit" && value !== "") {
            newDetails[index]["debit"] = 0;
        }

        setData({ ...data, details: newDetails });
    };

    const removeRow = (index) => {
        if (data.details.length > 2) {
            const newDetails = data.details.filter((_, i) => i !== index);
            setData({ ...data, details: newDetails });
        }
    };

    const totalDebit = useMemo(
        () =>
            data.details.reduce(
                (sum, detail) => sum + Number.parseFloat(detail.debit || 0),
                0
            ),
        [data.details]
    );

    const totalCredit = useMemo(
        () =>
            data.details.reduce(
                (sum, detail) => sum + Number.parseFloat(detail.credit || 0),
                0
            ),
        [data.details]
    );

    const isBalanced = totalDebit === totalCredit && totalDebit > 0;

    const handleSubmit = (status) => {
        if (!isBalanced) {
            toast.error("Jurnal tidak seimbang atau total debit/kredit masih nol.");
            return;
        }

        setProcessing(true);
        setSubmittedStatus(status);
        setErrors({});

        // ✅ KIRIM DATA LANGSUNG PAKAI ROUTER
        const submitData = {
            ...data,
            status: status,
            entry_date: data.entry_date ? new Date(data.entry_date.getTime() - (data.entry_date.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : null,
        };

        const url = isEdit
            ? route("jurnal.umum.update", journal.id)
            : route("jurnal.umum.store");

        const method = isEdit ? "put" : "post";

        router[method](url, submitData, {
            onSuccess: () => {
                setProcessing(false);
                setSubmittedStatus(null);
            },
            onError: (errors) => {
                setErrors(errors);
                toast.error(errors.error || "Terjadi kesalahan. Mohon periksa kembali data yang Anda masukkan.");
                setProcessing(false);
                setSubmittedStatus(null);
            },
        });
    };

    return (
        <>
            <Head title={isEdit ? "Edit Jurnal Umum" : "Tambah Jurnal Umum"} />
            <AppLayouts breadcrumbs={breadcrumbs}>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {isEdit
                                    ? "Edit Jurnal Umum"
                                    : "Tambah Jurnal Umum"}
                            </h1>
                            <p className="text-muted-foreground">
                                Isi form di bawah ini untuk{" "}
                                {isEdit ? "mengubah" : "menambah"} jurnal umum.
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2 w-full sm:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                asChild
                                className="w-full sm:w-auto"
                            >
                                <Link href={route("jurnal.umum")}>
                                    <X className="h-4 w-4 mr-2" />
                                    Batal
                                </Link>
                            </Button>
                            <Button
                                onClick={() => handleSubmit("Draft")}
                                disabled={!isBalanced || processing}
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
                                disabled={!isBalanced || processing}
                                className="w-full sm:w-auto"
                            >
                                {processing && submittedStatus === "Posted" ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Simpan & Posting
                            </Button>
                        </div>
                    </div>

                    {errors.status && (
                        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4">
                            {errors.status}
                        </div>
                    )}

                    <div className="flex flex-col gap-6">
                        {/* Section 1: Informasi Jurnal */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Informasi Jurnal</CardTitle>
                                <CardDescription>Atur data administratif di sini.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="entry_date" className="text-xs uppercase tracking-wider text-muted-foreground">Tanggal Entri</Label>
                                        <Suspense fallback={<div className="h-10 w-full animate-pulse bg-muted rounded-md" />}>
                                            <DatePicker
                                                date={data.entry_date}
                                                setDate={(date) => setData({ ...data, entry_date: date })}
                                                disabled={disabledDates}
                                                defaultMonth={selectedPeriod ? parseSafeDate(selectedPeriod.start_date) : undefined}
                                                id="entry_date"
                                            />
                                        </Suspense>
                                        {errors.entry_date && <p className="text-xs text-destructive">{errors.entry_date}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="fiscal_period_id" className="text-xs uppercase tracking-wider text-muted-foreground">Periode Fiskal</Label>
                                        <Select value={data.fiscal_period_id} onValueChange={handlePeriodChange}>
                                            <SelectTrigger id="fiscal_period_id" className="bg-muted/30">
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
                                        {errors.fiscal_period_id && <p className="text-xs text-destructive">{errors.fiscal_period_id}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="entry_number" className="text-xs uppercase tracking-wider text-muted-foreground">Nomor Jurnal</Label>
                                        <Input
                                            id="entry_number"
                                            placeholder="Otomatis"
                                            value={data.entry_number}
                                            disabled
                                            className="bg-muted/50 font-mono text-xs"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="penerima" className="text-xs uppercase tracking-wider text-muted-foreground">Penerima/Pemberi</Label>
                                        <Input
                                            id="penerima"
                                            placeholder="Nama (Opsional)"
                                            value={data.penerima}
                                            onChange={(e) => setData({ ...data, penerima: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section 2: Detail Transaksi */}
                        <Card className="overflow-hidden border-primary/10 shadow-md">
                            <CardHeader className="bg-muted/20 pb-4 border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Detail Transaksi</CardTitle>
                                        <CardDescription>Masukkan minimal dua baris untuk menyeimbangkan jurnal.</CardDescription>
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
                                                <TableHead className="w-[35%] pl-6">Akun</TableHead>
                                                <TableHead className="w-[35%]">Uraian</TableHead>
                                                <TableHead className="w-[12%] text-right">Debit</TableHead>
                                                <TableHead className="w-[12%] text-right">Kredit</TableHead>
                                                <TableHead className="w-[6%] text-center pr-6"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.details.map((detail, index) => (
                                                <TableRow key={detail.temp_id} className="hover:bg-muted/5 transition-colors">
                                                    <TableCell className="pl-6 py-3">
                                                        <Suspense fallback={<div className="h-10 w-full animate-pulse bg-muted rounded-md" />}>
                                                            <Combobox
                                                                options={accountOptions}
                                                                value={detail.account_id}
                                                                onSelect={(value) => updateDetail(index, "account_id", value)}
                                                                placeholder="Pilih Akun"
                                                                searchPlaceholder="Cari akun..."
                                                                emptyPlaceholder="Akun tidak ditemukan."
                                                            />
                                                        </Suspense>
                                                    </TableCell>
                                                    <TableCell className="py-3">
                                                        <Input
                                                            type="text"
                                                            placeholder="Deskripsi transaksi"
                                                            value={detail.description}
                                                            onChange={(e) => updateDetail(index, "description", e.target.value)}
                                                            className="border-transparent hover:border-input focus:border-primary transition-all"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="py-3">
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            value={detail.debit || ''}
                                                            onChange={(e) => updateDetail(index, "debit", e.target.value)}
                                                            className="text-right font-mono focus:ring-primary/20"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="py-3">
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            value={detail.credit || ''}
                                                            onChange={(e) => updateDetail(index, "credit", e.target.value)}
                                                            className="text-right font-mono focus:ring-primary/20"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center pr-6 py-3">
                                                        {data.details.length > 2 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeRow(index)}
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                aria-label="Hapus Baris"
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
                                {errors["details"] && (
                                    <p className="text-sm text-destructive p-4 italic">
                                        * {errors["details"]}
                                    </p>
                                )}
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row justify-between gap-6 items-stretch sm:items-center bg-muted/30 py-6 px-6 border-t">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={cn(
                                            "flex h-10 items-center justify-center rounded-full px-6 text-sm font-bold tracking-wide transition-all shadow-sm",
                                            isBalanced
                                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                                : "bg-destructive/10 text-destructive border border-destructive/20"
                                        )}
                                    >
                                        {isBalanced ? "JURNAL SEIMBANG" : "TIDAK SEIMBANG"}
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-8">
                                    <div className="text-right">
                                        <p className="text-xs uppercase font-semibold text-muted-foreground mb-1">Total Debit</p>
                                        <p className="font-mono text-xl font-bold text-foreground">
                                            {new Intl.NumberFormat("id-ID", {
                                                style: "currency",
                                                currency: "IDR",
                                                minimumFractionDigits: 0,
                                            }).format(totalDebit)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs uppercase font-semibold text-muted-foreground mb-1">Total Kredit</p>
                                        <p className="font-mono text-xl font-bold text-foreground">
                                            {new Intl.NumberFormat("id-ID", {
                                                style: "currency",
                                                currency: "IDR",
                                                minimumFractionDigits: 0,
                                            }).format(totalCredit)}
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

FormJurnalUmum.propTypes = {
    journal: PropTypes.object,
    accounts: PropTypes.array.isRequired,
    periods: PropTypes.array.isRequired,
};
