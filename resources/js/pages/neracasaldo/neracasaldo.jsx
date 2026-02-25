import React, { useState, useMemo, Fragment } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
  } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Printer, Search, ChevronDown, ChevronRight } from "lucide-react";

const breadcrumbs = [
    { title: "Neraca Saldo", href: route("neraca-saldo") },
];

const formatCurrency = (value) => {
    const numberValue = Number(value) || 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
    }).format(numberValue);
}

const AccountRow = ({ account, level = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = account.children && account.children.length > 0;

    const rowStyle = {
        paddingLeft: `${level * 1.5 + 0.5}rem`,
    };

    const isHeader = level < 1;
    const isSubHeader = level === 1;

    return (
        <Fragment>
            <TableRow className={isHeader || isSubHeader ? "bg-muted/50" : ""}>
                <TableCell style={rowStyle} className="py-2">
                    <div className="flex items-center gap-1">
                        {hasChildren ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="h-7 w-7"
                            >
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                        ) : (
                            <span className="w-7 h-7 inline-block" />
                        )}
                        <span className={`font-mono text-xs ${isHeader || isSubHeader ? "font-bold" : ""}`}>{account.account_code}</span>
                        <span className={`ml-2 ${isHeader || isSubHeader ? "font-bold" : ""}`}>{account.account_name}</span>
                    </div>
                </TableCell>
                <TableCell className={`text-right font-mono py-2 ${isHeader || isSubHeader ? "font-bold" : ""}`}>{formatCurrency(account.opening_debit)}</TableCell>
                <TableCell className={`text-right font-mono py-2 ${isHeader || isSubHeader ? "font-bold" : ""}`}>{formatCurrency(account.opening_credit)}</TableCell>
                <TableCell className={`text-right font-mono py-2 ${isHeader || isSubHeader ? "font-bold" : ""}`}>{formatCurrency(account.debit_movement)}</TableCell>
                <TableCell className={`text-right font-mono py-2 ${isHeader || isSubHeader ? "font-bold" : ""}`}>{formatCurrency(account.credit_movement)}</TableCell>
                <TableCell className={`text-right font-mono py-2 ${isHeader || isSubHeader ? "font-bold" : ""}`}>{formatCurrency(account.closing_debit)}</TableCell>
                <TableCell className={`text-right font-mono py-2 ${isHeader || isSubHeader ? "font-bold" : ""}`}>{formatCurrency(account.closing_credit)}</TableCell>
            </TableRow>
            {isExpanded && hasChildren && account.children.map(child => (
                <AccountRow key={child.account_id} account={child} level={level + 1} />
            ))}
        </Fragment>
    );
};


export default function NeracaSaldoPage() {
    const { accounts, periods, selectedPeriod, totals, initialFilters } = usePage().props;

    const initialPeriodId = initialFilters.period || (periods[0]?.id.toString() ?? "");
    const initialPeriod = periods.find(p => p.id.toString() === initialPeriodId);
    
    const [filters, setFilters] = useState({
        period: initialPeriodId,
        dateRange: {
            from: initialFilters.start_date ? new Date(initialFilters.start_date.replace(/-/g, '/')) : (initialPeriod ? new Date(initialPeriod.start_date.replace(/-/g, '/')) : undefined),
            to: initialFilters.end_date ? new Date(initialFilters.end_date.replace(/-/g, '/')) : (initialPeriod ? new Date(initialPeriod.end_date.replace(/-/g, '/')) : undefined),
        },
    });

    const currentPeriod = useMemo(() => {
        return periods.find(p => p.id.toString() === filters.period);
    }, [filters.period, periods]);
    
    const disabledDates = useMemo(() => {
        if (!currentPeriod) return (date) => true;
        const startDate = new Date(currentPeriod.start_date.replace(/-/g, "/"));
        const endDate = new Date(currentPeriod.end_date.replace(/-/g, "/"));
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
                    from: newPeriod ? new Date(newPeriod.start_date.replace(/-/g, '/')) : undefined,
                    to: newPeriod ? new Date(newPeriod.end_date.replace(/-/g, '/')) : undefined
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
        const query = { period: filters.period };
        if (filters.dateRange?.from) {
            query.start_date = new Date(filters.dateRange.from.getTime() - (filters.dateRange.from.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        }
        if (filters.dateRange?.to) {
            query.end_date = new Date(filters.dateRange.to.getTime() - (filters.dateRange.to.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        }
        router.get(route('neraca-saldo'), query, {
            preserveState: true,
            preserveScroll: true,
        });
    };
    
    return (
        <>
            <Head title="Neraca Saldo" />
            <AppLayouts breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-2xl font-bold">Neraca Saldo</h1>
                        <p className="text-muted-foreground">
                            Lihat keseimbangan debit dan kredit dari semua akun pada periode tertentu.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Filter Laporan</CardTitle>
                            <CardDescription>
                                Pilih periode dan tanggal untuk melihat neraca saldo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                                <Select
                                    value={filters.period}
                                    onValueChange={(value) => handleFilterChange('period', value)}
                                >
                                    <SelectTrigger className="lg:col-span-2">
                                        <SelectValue placeholder="Pilih Periode Fiskal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periods.map((period) => (
                                            <SelectItem key={period.id} value={period.id.toString()}>
                                                {period.period_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <DateRangePicker
                                    date={filters.dateRange}
                                    onDateChange={handleDateRangeChange}
                                    disabledDates={disabledDates}
                                    className="lg:col-span-2"
                                />
                                <Button onClick={handleSearch} disabled={!filters.period} className="w-full lg:w-auto">
                                    <Search className="h-4 w-4 mr-2" />
                                    Tampilkan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {accounts && (
                         <Card>
                         <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                             <div>
                                 <CardTitle>Laporan Neraca Saldo</CardTitle>
                                 <CardDescription>
                                     Untuk periode <span className="font-semibold">{currentPeriod?.period_name}</span>
                                 </CardDescription>
                             </div>
                             <Button variant="outline" asChild>
                                <a href={route('neraca-saldo.export', { 
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
                             <div className="border rounded-lg overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead rowSpan={2} className="align-center ">Akun</TableHead>
                                            <TableHead colSpan={2} className="text-center border-l">Saldo Awal</TableHead>
                                            <TableHead colSpan={2} className="text-center border-l">Pergerakan</TableHead>
                                            <TableHead colSpan={2} className="text-center border-l">Saldo Akhir</TableHead>
                                        </TableRow>
                                        <TableRow>
                                            <TableHead className="text-right border-l w-36">Debit</TableHead>
                                            <TableHead className="text-right w-36">Kredit</TableHead>
                                            <TableHead className="text-right border-l w-36">Debit</TableHead>
                                            <TableHead className="text-right w-36">Kredit</TableHead>
                                            <TableHead className="text-right border-l w-36">Debit</TableHead>
                                            <TableHead className="text-right w-36">Kredit</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {accounts.length > 0 ? (
                                            accounts.map(account => (
                                                <AccountRow key={account.account_id} account={account} level={0} />
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center h-24">
                                                    Tidak ada data untuk ditampilkan.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow className="bg-primary text-primary-foreground hover:bg-primary/90">
                                            <TableCell className="font-bold text-right">TOTAL</TableCell>
                                            <TableCell className="font-bold text-right font-mono">{formatCurrency(totals.opening_debit)}</TableCell>
                                            <TableCell className="font-bold text-right font-mono">{formatCurrency(totals.opening_credit)}</TableCell>
                                            <TableCell className="font-bold text-right font-mono">{formatCurrency(totals.debit_movement)}</TableCell>
                                            <TableCell className="font-bold text-right font-mono">{formatCurrency(totals.credit_movement)}</TableCell>
                                            <TableCell className="font-bold text-right font-mono">{formatCurrency(totals.closing_debit)}</TableCell>
                                            <TableCell className="font-bold text-right font-mono">{formatCurrency(totals.closing_credit)}</TableCell>
                                        </TableRow>
                                    </TableFooter>
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
