import React from "react";
import { Head, Link } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical } from "lucide-react";
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

const breadcrumbs = [
  { title: "Jurnal", href: "/jurnal" },
  { title: "Jurnal Bank", href: "/jurnal/bank" },
];

// Tab navigation component
const JurnalTabs = ({ activeTab = "bank" }) => {
  const tabs = [
    { id: "semua", label: "Semua", href: "/jurnal" },
    { id: "umum", label: "Jurnal Umum", href: "/jurnal/umum" },
    { id: "kas", label: "Jurnal Kas", href: "/jurnal/kas" },
    { id: "bank", label: "Jurnal Bank", href: "/jurnal/bank" },
  ];

  return (
    <div className="flex gap-2 mb-6">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "bg-destructive text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
};

// Pagination component
const Pagination = ({ currentPage = 1, totalPages = 10, rowsPerPage = 10 }) => {
  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-muted-foreground">10 of 100 baris.</div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page</span>
          <Select defaultValue="10">
            <SelectTrigger className="w-[70px] h-9 bg-destructive text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Halaman 1 dari 10</span>
          <div className="flex gap-1">
            <Button
              size="icon-sm"
              variant="outline"
              className="bg-destructive/20 border-destructive/30 hover:bg-destructive/30"
            >
              «
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              className="bg-destructive/20 border-destructive/30 hover:bg-destructive/30"
            >
              ‹
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              className="bg-destructive border-destructive hover:bg-destructive/90 text-white"
            >
              ›
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              className="bg-destructive border-destructive hover:bg-destructive/90 text-white"
            >
              »
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function JurnalBankPage({ journals = [] }) {
  // Sample data
  const sampleData = [
    {
      id: "01012025-1",
      tanggal: "1 Januari 2025",
      periode: "Januari 2025",
      tipe: "Umum",
    },
    {
      id: "01012025-2",
      tanggal: "1 Januari 2025",
      periode: "Januari 2025",
      tipe: "Umum",
    },
    {
      id: "01012025-3",
      tanggal: "1 Januari 2025",
      periode: "Januari 2025",
      tipe: "Umum",
    },
    {
      id: "02012025-1",
      tanggal: "2 Januari 2025",
      periode: "Januari 2025",
      tipe: "Umum",
    },
  ];

  return (
    <>
      <Head title="Jurnal - Jurnal Bank" />
      <AppLayouts breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Jurnal</h1>
              <p className="text-muted-foreground">Jurnal Bank</p>
            </div>
            <div className="flex gap-2">
              <Button className="bg-destructive hover:bg-destructive/90">
                <Plus className="h-4 w-4" />
                Tambah Pengeluaran Bank
              </Button>
              <Button className="bg-destructive hover:bg-destructive/90">
                <Plus className="h-4 w-4" />
                Tambah Pemasukan Bank
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <JurnalTabs activeTab="bank" />

          {/* Table */}
          <div className="bg-card rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      No.
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Tanggal Jurnal
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Periode
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Tipe Jurnal
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sampleData.map((item, index) => (
                    <tr key={item.id} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm">{index + 1}.</td>
                      <td className="px-4 py-3 text-sm">{item.id}</td>
                      <td className="px-4 py-3 text-sm">{item.tanggal}</td>
                      <td className="px-4 py-3 text-sm">{item.periode}</td>
                      <td className="px-4 py-3 text-sm">{item.tipe}</td>
                      <td className="px-4 py-3 text-sm">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t">
              <Pagination />
            </div>
          </div>
        </div>
      </AppLayouts>
    </>
  );
}