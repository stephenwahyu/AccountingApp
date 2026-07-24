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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoreVertical, Plus, Search } from "lucide-react";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

const DeleteConfirmDialog = lazy(() => import("@/components/delete-confirm-dialog").then(m => ({ default: m.DeleteConfirmDialog })));

const breadcrumbs = [
  { title: "Bagan Perkiraan", href: route('bagan-perkiraan.index') },
  { title: "Tipe Akun", href: route('bagan-perkiraan.tipe-akun') },
];

export default function TipeAkunList({ types = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);

  const handleTabChange = (value) => {
    router.visit(route(value));
  };

  const filteredTypes = useMemo(() => {
    return types.filter((type) => {
      const searchTermLower = searchTerm.toLowerCase();
      // Ensure normal_balance exists before calling toLowerCase
      const nameMatch = type.name.toLowerCase().includes(searchTermLower);
      const balanceMatch = type.normal_balance && type.normal_balance.toLowerCase().includes(searchTermLower);
      return nameMatch || balanceMatch;
    });
  }, [types, searchTerm]);

  const totalRows = filteredTypes.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const paginatedTypes = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredTypes.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredTypes, currentPage, rowsPerPage]);

  const handleConfirmDelete = () => {
    if (typeToDelete) {
      router.delete(route('bagan-perkiraan.tipe-akun.destroy', typeToDelete.id), {
        preserveScroll: true,
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setTypeToDelete(null);
        }
      });
    }
  };

  return (
    <>
      <Head title="Bagan Perkiraan - Tipe Akun" />
      <AppLayouts breadcrumbs={breadcrumbs}>
        <Suspense fallback={null}>
          <DeleteConfirmDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleConfirmDelete}
            title="Hapus Tipe Akun"
            description={typeToDelete ? `Apakah Anda yakin ingin menghapus tipe akun ${typeToDelete.name}? Seluruh kategori dan akun di bawah tipe ini juga akan terpengaruh.` : ""}
          />
        </Suspense>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Bagan Perkiraan</h1>
              <p className="text-muted-foreground">
                Tipe akun dalam bagan perkiraan.
              </p>
            </div>
            <Link href={route("bagan-perkiraan.tipe-akun.create")}>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Tipe Akun
              </Button>
            </Link>
          </div>

          <Tabs value="bagan-perkiraan.tipe-akun" onValueChange={handleTabChange}>
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
              <CardTitle>Daftar Tipe Akun</CardTitle>
              <CardDescription>
                Anda dapat mencari, memfilter, dan mengelola tipe akun dari sini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mb-4">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Cari tipe akun atau saldo normal..."
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
                      <TableHead>Tipe Akun</TableHead>
                      <TableHead>Saldo Normal</TableHead>
                      <TableHead className="w-16 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTypes.length > 0 ? (
                      paginatedTypes.map((type, index) => (
                        <TableRow key={type.id}>
                          <TableCell>
                            {(currentPage - 1) * rowsPerPage + index + 1}.
                          </TableCell>
                          <TableCell className="font-medium">
                            {type.name}
                          </TableCell>
                          <TableCell>{type.normal_balance}</TableCell>
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
                                    <Link href={route('bagan-perkiraan.tipe-akun.edit', type.id)}>Edit</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                        setTypeToDelete(type);
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
                        <TableCell colSpan={4} className="text-center h-24">
                          Tidak ada data tipe akun.
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
                paginatedRows={paginatedTypes}
              />
            </CardContent>
          </Card>
        </div>
      </AppLayouts>
    </>
  );
}
