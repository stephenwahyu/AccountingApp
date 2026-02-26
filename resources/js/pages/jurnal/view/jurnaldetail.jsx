import React from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil, Trash2, Printer } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { parseSafeDate } from "@/lib/utils";

export default function ViewDetailJurnal({ journal }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    
    const getBreadcrumbTitle = (type) => {
        if (type === 'Umum') return 'Jurnal Umum';
        if (type?.includes('Kas')) return 'Jurnal Kas';
        if (type?.includes('Bank')) return 'Jurnal Bank';
        return 'Jurnal'; // Fallback default
    };

    const getBreadcrumbHref = (type) => {
        if (type === 'Umum') return route('jurnal.umum');
        if (type?.includes('Kas')) return route('jurnal.kas');
        if (type?.includes('Bank')) return route('jurnal.bank');
        return route('jurnal.index'); // Fallback default
    };

    const breadcrumbs = [
        { title: "Jurnal", href: route('jurnal.index') },
        { 
          title: getBreadcrumbTitle(journal.journal_type),
          href: getBreadcrumbHref(journal.journal_type)
        },
        { title: journal.entry_number, href: "#" },
      ];

  const totalDebit = journal.journal_details.reduce(
    (sum, detail) => sum + parseFloat(detail.debit || 0),
    0
  );

  const totalCredit = journal.journal_details.reduce(
    (sum, detail) => sum + parseFloat(detail.credit || 0),
    0
  );

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

  const handleEdit = () => {
    let editRoute;
    switch (journal.journal_type) {
        case 'Umum':
            editRoute = route('jurnal.umum.edit', journal.id);
            break;
        case 'Kas Masuk':
            editRoute = route('jurnal.kas.pemasukan.edit', journal.id);
            break;
        case 'Kas Keluar':
            editRoute = route('jurnal.kas.pengeluaran.edit', journal.id);
            break;
        case 'Bank Masuk':
            editRoute = route('jurnal.bank.pemasukan.edit', journal.id);
            break;
        case 'Bank Keluar':
            editRoute = route('jurnal.bank.pengeluaran.edit', journal.id);
            break;
        default:
            return;
    }
    router.visit(editRoute);
  };

  const handleDelete = () => {
    router.delete(route("jurnal.destroy", journal.id), {
        onSuccess: () => setIsDeleteDialogOpen(false),
    });
  };

  const handlePrintVoucher = () => {
      window.open(route('jurnal.print', journal.id), '_blank');
  }

  return (
    <>
      <Head title={`Detail Jurnal - ${journal.entry_number}`} />
      <AppLayouts breadcrumbs={breadcrumbs}>
        <DeleteConfirmDialog 
            open={isDeleteDialogOpen} 
            onOpenChange={setIsDeleteDialogOpen} 
            onConfirm={handleDelete}
            title="Hapus Jurnal"
            description={`Apakah Anda yakin ingin menghapus jurnal ${journal.entry_number}?`}
        />
        <div className="flex flex-col gap-6 @container">
          <div className="flex flex-col @lg:flex-row items-start @lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Detail Jurnal</h1>
                    <p className="text-muted-foreground">
                        {journal.entry_number}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" onClick={handlePrintVoucher} className="bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary">
                <Printer className="h-4 w-4 mr-2" />
                Cetak
              </Button>
              {/* <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print Layar
              </Button> */}
              <Button variant="outline" onClick={handleEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} disabled={journal.status === 'Posted'}>
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            </div>
          </div>
          
          <Card className="print-section">
            <CardHeader>
                <div className="flex flex-col @lg:flex-row justify-between gap-4">
                    <div>
                        <CardTitle className="mb-1">Jurnal {journal.journal_type}</CardTitle>
                        <CardDescription>{journal.entry_number}</CardDescription>
                    </div>
                    <div className="text-left @lg:text-right">
                        <p className="text-sm text-muted-foreground">Tanggal Jurnal</p>
                        <p className="font-medium">{(() => {
                            const d = parseSafeDate(journal.entry_date);
                            return d ? format(d, "d MMMM yyyy", { locale: id }) : "-";
                        })()}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid grid-cols-2 @lg:grid-cols-4 gap-4 text-sm">
                    <div className="grid gap-1.5">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(journal.status)} className="w-fit">{journal.status}</Badge>
                    </div>
                    <div className="grid gap-1.5">
                        <span className="text-muted-foreground">Periode Fiskal</span>
                        <span className="font-medium">{journal.fiscal_period?.period_name || '-'}</span>
                    </div>
                    <div className="grid gap-1.5">
                        <span className="text-muted-foreground">Penerima/Dibayar Kepada</span>
                        <span className="font-medium">{journal.penerima || '-'}</span>
                    </div>
                    <div className="grid gap-1.5">
                        <span className="text-muted-foreground">Dibuat Oleh</span>
                        <span className="font-medium">{journal.user?.name || '-'}</span>
                    </div>
                </div>

                <div className="border rounded-md overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[100px] @md:w-[200px]">Akun</TableHead>
                        <TableHead>Uraian</TableHead>
                        <TableHead className="text-right w-[120px] @md:w-[150px]">Debit</TableHead>
                        <TableHead className="text-right w-[120px] @md:w-[150px]">Kredit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {journal.journal_details.map((detail) => (
                        <TableRow key={detail.id}>
                            <TableCell>
                                <div className="font-medium">{detail.account.account_code}</div>
                                <div className="text-xs text-muted-foreground">{detail.account.account_name}</div>
                            </TableCell>
                            <TableCell>{detail.description || "-"}</TableCell>
                            <TableCell className="text-right font-mono">
                                {new Intl.NumberFormat('id-ID').format(detail.debit)}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                {new Intl.NumberFormat('id-ID').format(detail.credit)}
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>

                 <div className="flex justify-end mt-4">
                    <div className="w-full max-w-sm space-y-2 rounded-lg bg-muted p-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Debit</span>
                            <span className="font-medium font-mono">{new Intl.NumberFormat('id-ID').format(totalDebit)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Kredit</span>
                            <span className="font-medium font-mono">{new Intl.NumberFormat('id-ID').format(totalCredit)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                            <span className="font-bold">Selisih</span>
                            <span className="font-bold font-mono">{new Intl.NumberFormat('id-ID').format(totalDebit - totalCredit)}</span>
                        </div>
                    </div>
                </div>

            </CardContent>
          </Card>

        </div>
        <style jsx="true" global="true">{`
            @media print {
                body * {
                    visibility: hidden;
                }
                .print-section, .print-section * {
                    visibility: visible;
                }
                .print-section {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                .app-layout-main {
                    padding: 0 !important;
                }
                h1, h2, h3, h4, h5, h6 {
                    break-after: avoid;
                }
                p, blockquote, pre {
                    break-inside: avoid;
                }
                table, thead, tbody, tfoot, tr, td, th {
                    break-inside: avoid;
                }
            }
        `}</style>
      </AppLayouts>
    </>
  );
}
