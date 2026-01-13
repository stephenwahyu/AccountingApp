import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@inertiajs/react";
import { Plus } from "lucide-react";

export function QuickShortcuts() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>
                    Buat entri jurnal baru dengan cepat.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
                <Button asChild>
                    <Link href={route("jurnal.umum.create")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Jurnal Umum
                    </Link>
                </Button>
                <Button asChild variant="secondary">
                    <Link href={route("jurnal.kas.pemasukan.create")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Pemasukan Kas
                    </Link>
                </Button>
                 <Button asChild variant="secondary">
                    <Link href={route("jurnal.kas.pengeluaran.create")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Pengeluaran Kas
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
