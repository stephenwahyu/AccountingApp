import React, { useState, useMemo, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { MoreVertical, Plus, Search, FileDown } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { parseSafeDate } from "@/lib/utils";

const breadcrumbs = [{ title: "Jurnal", href: "/jurnal" }];

const formatDateForQuery = (date) => {
    if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) {
        return null;
    }
    try {
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    } catch (e) {
        return null;
    }
}

export default function JurnalSemua({ journals = [], periods = [], initialFilters = {} }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialFilters.status || "all");
  const [periodFilter, setPeriodFilter] = useState(initialFilters.period || "all");
  
  const initialPeriod = useMemo(() => periods.find(p => p.id.toString() === periodFilter), [periodFilter, periods]);

  const [dateRange, setDateRange] = useState({
    from: initialFilters.start_date ? parseSafeDate(initialFilters.start_date) : (initialPeriod ? parseSafeDate(initialPeriod.start_date) : undefined),
    to: initialFilters.end_date ? parseSafeDate(initialFilters.end_date) : (initialPeriod ? parseSafeDate(initialPeriod.end_date) : undefined),
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState(null);

  const currentPeriod = useMemo(() => {
    return periods.find(p => p.id.toString() === periodFilter);
  }, [periodFilter, periods]);

  const disabledDates = useMemo(() => {
    if (!currentPeriod) return undefined; // Allow all if no period selected (Semua Periode)
    const startDate = parseSafeDate(currentPeriod.start_date);
    const endDate = parseSafeDate(currentPeriod.end_date);
    
    if (!startDate || !endDate) return undefined;

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return (date) => date < startDate || date > endDate;
  }, [currentPeriod]);

  const handleTabChange = (value) => {
    router.visit(value);
  };

  const handlePeriodChange = (value) => {
    setPeriodFilter(value);
    if (value !== "all") {
        const selected = periods.find(p => p.id.toString() === value);
        if (selected) {
            setDateRange({
                from: parseSafeDate(selected.start_date),
                to: parseSafeDate(selected.end_date)
            });
        }
    } else {
        setDateRange({ from: undefined, to: undefined });
    }
  };

  const handleSearch = () => {
    const query = {
        status: statusFilter,
        period: periodFilter,
        start_date: formatDateForQuery(dateRange?.from),
        end_date: formatDateForQuery(dateRange?.to)
    };

    router.get(route('jurnal.index'), query, {
        preserveState: true,
        preserveScroll: true,
    });
  };

  const handleDownloadExcel = () => {
    const query = {
        status: statusFilter,
        period: periodFilter,
        start_date: formatDateForQuery(dateRange?.from),
        end_date: formatDateForQuery(dateRange?.to)
    };

    window.open(route('jurnal.export.excel', query), '_blank');
  };

  const filteredJournals = useMemo(() => {
    return journals.filter((journal) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        journal.entry_number.toLowerCase().includes(searchTermLower) ||
        journal.entry_date.toLowerCase().includes(searchTermLower) ||
        journal.period.toLowerCase().includes(searchTermLower) ||
        journal.journal_type.toLowerCase().includes(searchTermLower);

      return matchesSearch;
    });
  }, [journals, searchTerm]);

  const totalRows = filteredJournals.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const paginatedJournals = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredJournals.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredJournals, currentPage, rowsPerPage]);

  const getStatusVariant = (status) => {
    switch (status) {
      case "Posted":
        return "success";
      case "Draft":
        return "secondary";
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleConfirmDelete = () => {
    if (journalToDelete) {
      router.delete(route('jurnal.destroy', journalToDelete.id), {
        preserveScroll: true,
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setJournalToDelete(null);
        }
      });
    }
  };

  return (
    <>
      <Head title="Jurnal - Semua" />
      <AppLayouts breadcrumbs={breadcrumbs}>
        <DeleteConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          title="Hapus Jurnal"
          description={journalToDelete ? `Apakah Anda yakin ingin menghapus jurnal ${journalToDelete.entry_number}?` : ""}
        />
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">Semua Jurnal</h1>
            <p className="text-muted-foreground">
              Berikut adalah daftar semua jurnal yang telah tercatat.
            </p>
          </div>

          <Tabs value="/jurnal" onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="/jurnal">Semua</TabsTrigger>
              <TabsTrigger value="/jurnal/umum">Jurnal Umum</TabsTrigger>
              <TabsTrigger value="/jurnal/kas">Jurnal Kas</TabsTrigger>
              <TabsTrigger value="/jurnal/bank">Jurnal Bank</TabsTrigger>
            </TabsList>
          </Tabs>

          <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle>Daftar Jurnal</CardTitle>
                <CardDescription>
                    Anda dapat mencari, memfilter, dan mengelola semua jurnal dari
                    sini.
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleDownloadExcel} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                <FileDown className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-end w-full">
  {/* Kolom Cari */}
  <div className="grid gap-2 w-full md:flex-1">
    <Label className="text-xs uppercase text-muted-foreground font-semibold">Cari</Label>
    <div className="flex items-center border rounded-md px-2 w-full">
      <Search className="h-4 w-4 text-muted-foreground mr-2" />
      <Input
        type="search"
        placeholder="No. Jurnal..."
        className="flex-1 border-none focus:ring-0 w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  </div>

  {/* Kolom Periode */}
  <div className="grid gap-2 w-full md:w-auto">
    <Label className="text-xs uppercase text-muted-foreground font-semibold">Periode</Label>
    <Select value={periodFilter} onValueChange={handlePeriodChange}>
      <SelectTrigger>
        <SelectValue placeholder="Semua Periode" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua Periode</SelectItem>
        {periods.map((p) => (
          <SelectItem key={p.id} value={p.id.toString()}>
            {p.period_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  {/* Kolom Status */}
  <div className="grid gap-2 w-full md:w-auto">
    <Label className="text-xs uppercase text-muted-foreground font-semibold">Status</Label>
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger>
        <SelectValue placeholder="Semua Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua Status</SelectItem>
        <SelectItem value="Posted">Diposting</SelectItem>
        <SelectItem value="Draft">Draf</SelectItem>
        <SelectItem value="Cancelled">Dibatalkan</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Kolom Rentang Tanggal */}
  <div className="grid gap-2 w-full md:w-auto">
    <Label className="text-xs uppercase text-muted-foreground font-semibold">Rentang Tanggal</Label>
    <DateRangePicker
      date={dateRange}
      onDateChange={setDateRange}
      disabledDates={disabledDates}
    />
  </div>

  {/* Tombol Tampilkan */}
  <div className="flex justify-end w-full md:w-auto">
    <Button onClick={handleSearch} className="w-full md:w-auto">
      <Search className="h-4 w-4 mr-2" />
      Tampilkan
    </Button>
  </div>
</div>
              </div>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">No.</TableHead>
                      <TableHead>No. Jurnal</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Periode</TableHead>
                      <TableHead>Tipe Jurnal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-16 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedJournals.length > 0 ? (
                      paginatedJournals.map((journal, index) => (
                        <TableRow key={journal.id}>
                          <TableCell>
                            {(currentPage - 1) * rowsPerPage + index + 1}.
                          </TableCell>
                          <TableCell className="font-medium">
                            {journal.entry_number}
                          </TableCell>
                          <TableCell>{journal.entry_date}</TableCell>
                          <TableCell>{journal.period}</TableCell>
                          <TableCell>{journal.journal_type}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(journal.status)}>
                              {journal.status === 'Posted' ? 'Diposting' : journal.status === 'Draft' ? 'Draf' : 'Dibatalkan'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={route('jurnal.show', journal.id)}>
                                    Lihat Detail
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={
                                    journal.journal_type === 'Umum' ? route('jurnal.umum.edit', journal.id) :
                                    journal.journal_type === 'Kas Masuk' ? route('jurnal.kas.pemasukan.edit', journal.id) :
                                    journal.journal_type === 'Kas Keluar' ? route('jurnal.kas.pengeluaran.edit', journal.id) :
                                    journal.journal_type === 'Bank Masuk' ? route('jurnal.bank.pemasukan.edit', journal.id) :
                                    route('jurnal.bank.pengeluaran.edit', journal.id)
                                  }>
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => {
                                        setJournalToDelete(journal);
                                        setIsDeleteDialogOpen(true);
                                    }}
                                    disabled={journal.status === 'Posted'}
                                >
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">
                          Tidak ada data jurnal.
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
                paginatedRows={paginatedJournals}
              />
            </CardContent>
          </Card>
        </div>
      </AppLayouts>
    </>
  );
}
