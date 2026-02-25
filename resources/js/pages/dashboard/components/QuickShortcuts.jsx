import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Link } from "@inertiajs/react";
import { Plus } from "lucide-react";

export function QuickShortcuts() {
    return (
        <Card className="bg-primary/3 border-primary/10 shadow-sm">
            <CardContent className="flex flex-col md:flex-row items-center justify-between p-4 gap-4">
                <div className="flex flex-col gap-0.5">
                    <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Aksi Cepat
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Buat entri jurnal baru untuk mencatat transaksi keuangan.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                    <Button asChild size="sm" className="shadow-sm">
                        <Link href={route("jurnal.umum.create")}>
                            Jurnal Umum
                        </Link>
                    </Button>

                    <Button asChild size="sm" className=" border shadow-sm">
                        <Link href={route("jurnal.kas.pemasukan.create")}>
                            Pemasukan Kas
                        </Link>
                    </Button>

                    <Button asChild size="sm" className=" border shadow-sm">
                        <Link href={route("jurnal.kas.pengeluaran.create")}>
                            Pengeluaran Kas
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
