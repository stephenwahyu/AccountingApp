import React, { useState, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

const breadcrumbs = [
  { title: "Bagan Perkiraan", href: "/bagan-perkiraan" },
  { title: "Akun", href: "/bagan-perkiraan/akun" },
];

export default function AkunList({ accounts: initialAccounts = [] }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleTabChange = (value) => {
    router.visit(route(value));
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        account.account_code.toLowerCase().includes(searchTermLower) ||
        account.account_name.toLowerCase().includes(searchTermLower) ||
        account.category_name.toLowerCase().includes(searchTermLower)
      );
    });
  }, [accounts, searchTerm]);

  const totalRows = filteredAccounts.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const paginatedAccounts = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredAccounts.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAccounts, currentPage, rowsPerPage]);

  return (
    <>
      <Head title="Bagan Perkiraan - Akun" />
      <AppLayouts breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Bagan Perkiraan</h1>
              <p className="text-muted-foreground">
                Akun dalam bagan perkiraan.
              </p>
            </div>
            <Link href={route("bagan-perkiraan.akun.create")}>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Akun
              </Button>
            </Link>
          </div>

          <Tabs value="bagan-perkiraan.akun" onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="bagan-perkiraan.index">Semua</TabsTrigger>
              <TabsTrigger value="bagan-perkiraan.akun">Akun</TabsTrigger>
              <TabsTrigger value="bagan-perkiraan.kategori-akun">
                Kategori Akun
              </TabsTrigger>
              <TabsTrigger value="bagan-perkiraan.tipe-akun">
                Tipe Akun
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Akun</CardTitle>
              <CardDescription>
                Anda dapat mencari, memfilter, dan mengelola akun dari sini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mb-4">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Cari akun..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">No.</TableHead>
                      <TableHead>Kode Akun</TableHead>
                      <TableHead>Nama Akun</TableHead>
                      <TableHead>Kategori Akun</TableHead>
                      <TableHead>Jenis Akun</TableHead>
                      <TableHead className="w-16 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAccounts.length > 0 ? (
                      paginatedAccounts.map((account, index) => (
                        <TableRow key={account.id}>
                          <TableCell>
                            {(currentPage - 1) * rowsPerPage + index + 1}.
                          </TableCell>
                          <TableCell className="font-medium">
                            {account.account_code}
                          </TableCell>
                          <TableCell>{account.account_name}</TableCell>
                          <TableCell>{account.category_name}</TableCell>
                          <TableCell>{account.type_name}</TableCell>
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
                                    <Link href={route('bagan-perkiraan.akun.edit', account.id)}>Edit</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                        if (confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
                                            router.delete(route('bagan-perkiraan.akun.destroy', account.id), {
                                                preserveScroll: true
                                            });
                                        }
                                    }}
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
                        <TableCell colSpan={6} className="text-center h-24">
                          Tidak ada data akun.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Menampilkan {paginatedAccounts.length} dari {totalRows} baris.
                </p>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Baris per halaman</span>
                    <Select
                      value={rowsPerPage.toString()}
                      onValueChange={(value) => {
                        setRowsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[70px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
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
                        className="h-8 w-8"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <ChevronLeft className="h-4 w-4 -ml-2.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <ChevronRight className="h-4 w-4 -ml-2.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayouts>
    </>
  );
}