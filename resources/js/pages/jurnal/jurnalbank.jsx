import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
import { Button } from "@/components/ui/button";
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
import { MoreVertical, ChevronLeft, ChevronRight, Plus } from "lucide-react";

const breadcrumbs = [
  { title: "Jurnal", href: "/jurnal" },
  { title: "Jurnal Bank", href: "/jurnal/bank" },
];

export default function JurnalBank({ journals = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dummy data untuk demo
  const dummyJournals = journals.length > 0 ? journals : [
    {
      id: "01012025-1",
      entry_date: "1 Januari 2025",
      period: "Januari 2025",
      journal_type: "Pemasukan Bank",
    },
    {
      id: "01012025-2",
      entry_date: "1 Januari 2025",
      period: "Januari 2025",
      journal_type: "Pemasukan Bank",
    },
    {
      id: "01012025-3",
      entry_date: "1 Januari 2025",
      period: "Januari 2025",
      journal_type: "Pengeluaran Bank",
    },
    {
      id: "02012025-1",
      entry_date: "2 Januari 2025",
      period: "Januari 2025",
      journal_type: "Pengeluaran Bank",
    },
  ];

  const totalRows = dummyJournals.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const handleTabChange = (value) => {
    router.visit(value);
  };

  return (
    <>
      <Head title="Jurnal - Jurnal Bank" />
      <AppLayouts breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Jurnal</h1>
            <p className="text-muted-foreground">Jurnal Bank</p>
          </div>

          {/* Tabs Navigation with Action Buttons */}
          <div className="flex items-center justify-between">
            <Tabs value="/jurnal/bank" onValueChange={handleTabChange}>
              <TabsList className="bg-transparent h-auto p-0 gap-0">
                <TabsTrigger
                  value="/jurnal"
                  className="data-[state=active]:bg-[#ef4444] data-[state=active]:text-white bg-[#fca5a5] text-white rounded-none first:rounded-l-md last:rounded-r-md border-0 shadow-none"
                >
                  Semua
                </TabsTrigger>
                <TabsTrigger
                  value="/jurnal/umum"
                  className="data-[state=active]:bg-[#ef4444] data-[state=active]:text-white bg-[#fca5a5] text-white rounded-none first:rounded-l-md last:rounded-r-md border-0 shadow-none"
                >
                  Jurnal Umum
                </TabsTrigger>
                <TabsTrigger
                  value="/jurnal/kas"
                  className="data-[state=active]:bg-[#ef4444] data-[state=active]:text-white bg-[#fca5a5] text-white rounded-none first:rounded-l-md last:rounded-r-md border-0 shadow-none"
                >
                  Jurnal Kas
                </TabsTrigger>
                <TabsTrigger
                  value="/jurnal/bank"
                  className="data-[state=active]:bg-[#ef4444] data-[state=active]:text-white bg-[#fca5a5] text-white rounded-none first:rounded-l-md last:rounded-r-md border-0 shadow-none"
                >
                  Jurnal Bank
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              <Button className="bg-[#ef4444] hover:bg-[#dc2626] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pengeluaran Bank
              </Button>
              <Button className="bg-[#ef4444] hover:bg-[#dc2626] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pemasukan Bank
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">No.</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Tanggal Jurnal</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Tipe Jurnal</TableHead>
                  <TableHead className="w-20">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyJournals.map((journal, index) => (
                  <TableRow key={journal.id}>
                    <TableCell>{index + 1}.</TableCell>
                    <TableCell>{journal.id}</TableCell>
                    <TableCell>{journal.entry_date}</TableCell>
                    <TableCell>{journal.period}</TableCell>
                    <TableCell>{journal.journal_type}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {rowsPerPage} of {totalRows} baris.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Rows per page</span>
                <Select value={rowsPerPage.toString()} onValueChange={(value) => setRowsPerPage(Number(value))}>
                  <SelectTrigger className="w-[70px] h-9 bg-[#ef4444] text-white border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 bg-[#fca5a5] text-white border-0 hover:bg-[#ef4444]"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <ChevronLeft className="h-4 w-4 -ml-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 bg-[#fca5a5] text-white border-0 hover:bg-[#ef4444]"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 bg-[#ef4444] text-white border-0 hover:bg-[#ef4444]"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 bg-[#ef4444] text-white border-0 hover:bg-[#ef4444]"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4 -ml-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayouts>
    </>
  );
}