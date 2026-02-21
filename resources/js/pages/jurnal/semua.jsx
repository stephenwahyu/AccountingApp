import React, { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { MoreVertical, Plus, Search } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";

const breadcrumbs = [{ title: "Jurnal", href: "/jurnal" }];

export default function JurnalSemua({ journals = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState(null);

  const handleTabChange = (value) => {
    router.visit(value);
  };

  const filteredJournals = useMemo(() => {
    return journals.filter((journal) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        journal.entry_number.toLowerCase().includes(searchTermLower) ||
        journal.entry_date.toLowerCase().includes(searchTermLower) ||
        journal.period.toLowerCase().includes(searchTermLower) ||
        journal.journal_type.toLowerCase().includes(searchTermLower);

      const matchesStatus =
        statusFilter === "all" || journal.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [journals, searchTerm, statusFilter]);

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
            <CardHeader>
              <CardTitle>Daftar Jurnal</CardTitle>
              <CardDescription>
                Anda dapat mencari, memfilter, dan mengelola semua jurnal dari
                sini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mb-4">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Cari jurnal..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="Posted">Posted</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
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
                              {journal.status}
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