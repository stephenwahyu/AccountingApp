import React, { useState, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
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
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { MoreVertical, Plus, Search, Users } from "lucide-react";

const breadcrumbs = [
  { title: "Pengguna", href: "/pengguna" },
];

export default function PenggunaList({ users: initialUsers = [] }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchTermLower) ||
        user.email.toLowerCase().includes(searchTermLower) ||
        user.role.toLowerCase().includes(searchTermLower)
      );
    });
  }, [users, searchTerm]);

  const totalRows = filteredUsers.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUsers, currentPage, rowsPerPage]);

  const getRoleVariant = (role) => {
    switch (role?.toLowerCase()) {
      case 'administrator':
        return 'destructive';
      case 'manager':
        return 'success';
      case 'staff':
        return 'secondary';
      default:
        return 'outline';
    }
  };


  return (
    <>
      <Head title="Manajemen Pengguna" />
      <AppLayouts breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
              <p className="text-muted-foreground">
                Kelola semua pengguna yang terdaftar di sistem.
              </p>
            </div>
            <Link href={route("pengguna.create")}>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pengguna
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Pengguna</CardTitle>
              <CardDescription>
                Anda dapat mencari, memfilter, dan mengelola pengguna dari sini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mb-4">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Cari pengguna..."
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
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="w-16 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user, index) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            {(currentPage - 1) * rowsPerPage + index + 1}.
                          </TableCell>
                          <TableCell className="font-medium">
                            {user.name}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={getRoleVariant(user.role)}>
                                {user.role}
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
                                    <Link href={route('pengguna.edit', user.id)}>Edit</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
                                            router.delete(route('pengguna.destroy', user.id), {
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
                        <TableCell colSpan={5} className="text-center h-24">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Users className="w-12 h-12 text-muted-foreground" />
                            <p className="text-muted-foreground">Tidak ada data pengguna.</p>
                          </div>
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
                paginatedRows={paginatedUsers}
              />
            </CardContent>
          </Card>
        </div>
      </AppLayouts>
    </>
  );
}