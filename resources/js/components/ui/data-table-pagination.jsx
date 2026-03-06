import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function DataTablePagination({
  rowsPerPage,
  onRowsPerPageChange,
  currentPage,
  onPageChange,
  totalPages,
  totalRows,
  paginatedRows,
}) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
      <p className="text-sm text-muted-foreground">
        Menampilkan {paginatedRows.length} dari {totalRows} baris.
      </p>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Baris per halaman</span>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(value) => onRowsPerPageChange(Number(value))}
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
              className="h-8 w-8 bg-accent"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              aria-label="Halaman Pertama"
            >
              <ChevronLeft className="h-4 w-4" />
              <ChevronLeft className="h-4 w-4 -ml-2.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-accent"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Halaman Sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-accent"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Halaman Selanjutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-accent"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Halaman Terakhir"
            >
              <ChevronRight className="h-4 w-4" />
              <ChevronRight className="h-4 w-4 -ml-2.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
