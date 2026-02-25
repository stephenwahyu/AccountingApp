import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, History } from 'lucide-react';

export function RecentJournals({ journals }) {
    return (
        <Card className="col-span-full xl:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="grid gap-1">
                    <CardTitle>Jurnal Terbaru</CardTitle>
                    <CardDescription>
                        5 transaksi terakhir yang telah diposting.
                    </CardDescription>
                </div>
                <Button asChild size="sm" variant="outline" className="ml-auto gap-1">
                    <Link href={route('jurnal.index')}>
                        Lihat Semua
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {journals.length > 0 ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No. Jurnal</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {journals.map((journal) => (
                                    <TableRow key={journal.id}>
                                        <TableCell>
                                            <div className="font-medium">{journal.entry_number}</div>
                                            <div className="hidden text-sm text-muted-foreground md:inline">
                                                {journal.penerima || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell>{journal.entry_date}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-primary/5">
                                                {journal.journal_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="ghost" size="icon">
                                                <Link href={route('jurnal.show', journal.id)}>
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <History className="h-10 w-10 text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">Belum ada transaksi.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
