import React, { useState, useMemo, lazy, Suspense } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayouts from "@/pages/layouts/app-layout";
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
import { MoreVertical, Plus, Search } from "lucide-react";

const DeleteConfirmDialog = lazy(() => import("@/components/delete-confirm-dialog").then(m => ({ default: m.DeleteConfirmDialog })));

const breadcrumbs = [
  { title: "Bagan Perkiraan", href: "/bagan-perkiraan" },
  { title: "Akun", href: "/bagan-perkiraan/akun" },
];

export default function AkunList({ accounts = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

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

  const handleConfirmDelete = () => {
    if (accountToDelete) {
      router.delete(route('bagan-perkiraan.akun.destroy', accountToDelete.id), {
        preserveScroll: true,
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setAccountToDelete(null);
        }
      });
    }
  };

  return (
    <>
      <Head title="Bagan Perkiraan - Akun" />
      <AppLayouts breadcrumbs={breadcrumbs}>
        <Suspense fallback={null}>
          <DeleteConfirmDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleConfirmDelete}
            title="Hapus Akun"
            description={accountToDelete ? `Apakah Anda yakin ingin menghapus akun ${accountToDelete.account_code} - ${accountToDelete.account_name}? Seluruh sejarah transaksi akun ini akan terpengaruh.` : ""}
          />
        </Suspense>
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
                                  aria-label="Menu Aksi"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={route('bagan-perkiraan.akun.show', account.id)}>Lihat Detail</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={route('bagan-perkiraan.akun.edit', account.id)}>Edit</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                        setAccountToDelete(account);
                                        setIsDeleteDialogOpen(true);
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
                paginatedRows={paginatedAccounts}
              />
            </CardContent>
          </Card>
        </div>
      </AppLayouts>
    </>
  );
}
