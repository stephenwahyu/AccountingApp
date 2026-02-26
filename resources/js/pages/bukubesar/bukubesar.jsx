import React, { useState, useMemo, useEffect } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Combobox } from "@/components/ui/combobox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Printer, Search } from "lucide-react";
import { cn, parseSafeDate } from "@/lib/utils";

const breadcrumbs = [
    { title: "Buku Besar", href: route("buku-besar") },
];

const formatCurrency = (value) => {
    const numberValue = Number(value) || 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
    }).format(numberValue);
}

const buildTree = (accounts) => {
    const accountsById = {};
    accounts.forEach(acc => {
        accountsById[acc.id] = { ...acc, children: [] };
    });

    const tree = [];
    accounts.forEach(acc => {
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
            disabled: node.children_count > 0,
        });
        if (node.children.length > 0) {
            flattenTreeForSelect(node.children, level + 1, options);
        }
    }
    return options;
};

export default function BukuBesarPage() {
    const {
        accounts,
        periods,
        transactions,
        selectedAccount,
        selectedPeriod,
        openingBalance,
        totalDebit,
        totalCredit,
        endingBalance,
        initialFilters
    } = usePage().props;

    const initialPeriodId = initialFilters.period || (periods[0]?.id.toString() ?? "");
    const initialPeriod = periods.find(p => p.id.toString() === initialPeriodId);

    const [filters, setFilters] = useState({
        account: initialFilters.account || "",
        period: initialPeriodId,
        dateRange: {
            from: initialFilters.start_date ? parseSafeDate(initialFilters.start_date) : (initialPeriod ? parseSafeDate(initialPeriod.start_date) : undefined),
            to: initialFilters.end_date ? parseSafeDate(initialFilters.end_date) : (initialPeriod ? parseSafeDate(initialPeriod.end_date) : undefined),
        },
    });

    const currentPeriod = useMemo(() => {
        return periods.find(p => p.id.toString() === filters.period);
    }, [filters.period, periods]);

    const disabledDates = useMemo(() => {
        if (!currentPeriod) return (date) => true; // Disable all if no period
        const startDate = parseSafeDate(currentPeriod.start_date);
        const endDate = parseSafeDate(currentPeriod.end_date);

        if (!startDate || !endDate) return (date) => false;

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        return (date) => date < startDate || date > endDate;
    }, [currentPeriod]);


    const handleFilterChange = (field, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [field]: value };
            if (field === 'period') {
                const newPeriod = periods.find(p => p.id.toString() === value);
                newFilters.dateRange = {
                    from: newPeriod ? parseSafeDate(newPeriod.start_date) : undefined,
                    to: newPeriod ? parseSafeDate(newPeriod.end_date) : undefined
                };
            }
            return newFilters;
        });
    };

    const handleDateRangeChange = (range) => {
        setFilters(prev => ({
            ...prev,
            dateRange: range || { from: undefined, to: undefined }
        }));
    };

    const handleSearch = () => {
        const query = {
            account: filters.account,
            period: filters.period,
        };

        if (filters.dateRange?.from) {
            query.start_date = new Date(filters.dateRange.from.getTime() - (filters.dateRange.from.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        }
        if (filters.dateRange?.to) {
            query.end_date = new Date(filters.dateRange.to.getTime() - (filters.dateRange.to.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        }

        router.get(route('buku-besar'), query, {
            preserveState: true,
            preserveScroll: true,
        });
    };
    
    const accountOptions = useMemo(() => {
        const tree = buildTree(accounts);
        return flattenTreeForSelect(tree);
    }, [accounts]);

    const periodOptions = periods.map(p => ({
        value: p.id.toString(),
        label: p.period_name
    }));

    let runningBalance = openingBalance;
    const transactionsWithBalance = transactions.map(tx => {
        if (selectedAccount?.normal_balance === 'Debit') {
            runningBalance += tx.debit - tx.credit;
        } else {
            runningBalance += tx.credit - tx.debit;
        }
        return { ...tx, balance: runningBalance };
    });

    return (
        <>
            <Head title="Buku Besar" />
            <AppLayouts breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-2xl font-bold">Buku Besar</h1>
                        <p className="text-muted-foreground">
                            Lacak semua transaksi untuk setiap akun dalam periode tertentu.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Filter Laporan</CardTitle>
                            <CardDescription>
                                Pilih akun, periode, dan rentang tanggal opsional untuk melihat buku besar.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                                <Combobox
                                    options={accountOptions}
                                    value={filters.account}
                                    onSelect={(value) => handleFilterChange('account', value)}
                                    placeholder="Pilih Akun"
                                    searchPlaceholder="Cari akun..."
                                    emptyPlaceholder="Akun tidak ditemukan."
                                    className="lg:col-span-2"
                                />
                                 <Select
                                    value={filters.period}
                                    onValueChange={(value) => handleFilterChange('period', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Periode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periodOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <DateRangePicker
                                    date={filters.dateRange}
                                    onDateChange={handleDateRangeChange}
                                    disabledDates={disabledDates}
                                    className="lg:col-span-2"
                                />
                                <Button onClick={handleSearch} disabled={!filters.account || !filters.period} className="w-full lg:w-auto">
                                    <Search className="h-4 w-4 mr-2" />
                                    Tampilkan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {selectedAccount && (
                        <Card>
                            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Laporan Buku Besar</CardTitle>
                                    <CardDescription>
                                        Menampilkan transaksi untuk akun <span className="font-semibold">{selectedAccount.account_code} - {selectedAccount.account_name}</span>
                                        <br/>
                                        Periode: <span className="font-semibold">{currentPeriod?.period_name}</span>
                                    </CardDescription>
                                </div>
                                <Button variant="outline" asChild>
                                    <a href={route('buku-besar.export', { 
                                        account: filters.account, 
                                        period: filters.period,
                                        start_date: filters.dateRange?.from ? new Date(filters.dateRange.from.getTime() - (filters.dateRange.from.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : null,
                                        end_date: filters.dateRange?.to ? new Date(filters.dateRange.to.getTime() - (filters.dateRange.to.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : null
                                    })}>
                                        <Printer className="h-4 w-4 mr-2" />
                                        Cetak
                                    </a>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-muted-foreground">Saldo Awal</p>
                                        <p className="font-semibold text-lg">{formatCurrency(openingBalance)}</p>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-muted-foreground">Total Debit</p>
                                        <p className={cn(
                                            "font-semibold text-lg",
                                            selectedAccount?.normal_balance === 'Debit' ? "text-green-600" : "text-red-600"
                                        )}>
                                            {formatCurrency(totalDebit)}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-muted-foreground">Total Kredit</p>
                                        <p className={cn(
                                            "font-semibold text-lg",
                                            selectedAccount?.normal_balance === 'Debit' ? "text-red-600" : "text-green-600"
                                        )}>
                                            {formatCurrency(totalCredit)}
                                        </p>
                                    </div>
                                    <div className={cn("p-4 rounded-lg", endingBalance >= 0 ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground")}>
                                        <p>Saldo Akhir</p>
                                        <p className="font-bold text-xl">{formatCurrency(endingBalance)}</p>
                                    </div>
                                </div>

                                <div className="border rounded-lg overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tanggal</TableHead>
                                                <TableHead>No. Jurnal</TableHead>
                                                <TableHead>Uraian</TableHead>
                                                <TableHead className="text-right">Debit</TableHead>
                                                <TableHead className="text-right">Kredit</TableHead>
                                                <TableHead className="text-right">Saldo</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell colSpan={5} className="font-semibold">Saldo Awal</TableCell>
                                                <TableCell className="text-right font-mono font-semibold">{formatCurrency(openingBalance)}</TableCell>
                                            </TableRow>
                                            {transactionsWithBalance.length > 0 ? (
                                                transactionsWithBalance.map((tx) => (
                                                    <TableRow key={tx.id}>
                                                        <TableCell>{tx.entry_date}</TableCell>
                                                        <TableCell className="font-medium">{tx.entry_number}</TableCell>
                                                        <TableCell>{tx.detail_description || tx.journal_description}</TableCell>
                                                        <TableCell className="text-right font-mono">{formatCurrency(tx.debit)}</TableCell>
                                                        <TableCell className="text-right font-mono">{formatCurrency(tx.credit)}</TableCell>
                                                        <TableCell className="text-right font-mono">{formatCurrency(tx.balance)}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center h-24">
                                                        Tidak ada transaksi pada periode ini.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </AppLayouts>
        </>
    );
}
