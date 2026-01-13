import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Empty } from '@/components/ui/empty';
import { Wallet } from 'lucide-react';
// import { formatCurrency } from '@/lib/utils';

const DesktopRow = ({ account, index }) => (
    <TableRow key={account.id} className="hover:bg-muted/50">
        <TableCell className="font-medium">{index + 1}.</TableCell>
        <TableCell>{account.account_code}</TableCell>
        <TableCell>{account.account_name}</TableCell>
        <TableCell className="text-right font-mono">{formatCurrency(account.balance)}</TableCell>
    </TableRow>
);

const MobileRow = ({ account }) => (
    <div className="flex justify-between items-center p-4 border-b last:border-b-0">
        <div>
            <p className="font-medium">{account.account_name}</p>
            <p className="text-sm text-muted-foreground">{account.account_code}</p>
        </div>
        <p className="font-mono font-semibold">{formatCurrency(account.balance)}</p>
    </div>
);

export function CashEquivalentBalance({ accounts }) {
    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Kas & Setara Kas</CardTitle>
                <CardDescription>
                    Total saldo dari semua akun kas dan bank hingga saat ini adalah{" "}
                    <span className="font-bold text-primary">{formatCurrency(totalBalance)}</span>.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="hidden md:block border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16 font-semibold text-muted-foreground">No.</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Kode Akun</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Nama</TableHead>
                                <TableHead className="text-right font-semibold text-muted-foreground">Saldo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accounts.length > 0 ? (
                                accounts.map((account, index) => (
                                    <DesktopRow key={account.id} account={account} index={index} />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <Empty icon={<Wallet className="h-12 w-12 text-muted-foreground" />} title="Tidak ada akun kas/bank" description="Silakan buat akun kas atau bank terlebih dahulu."/>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="md:hidden border rounded-lg">
                    {accounts.length > 0 ? (
                        accounts.map((account, index) => (
                           <MobileRow key={account.id} account={account} index={index} />
                        ))
                    ) : (
                         <div className="h-32 flex items-center justify-center p-10">
                             <Empty icon={<Wallet className="h-12 w-12 text-muted-foreground" />} title="Tidak ada akun kas/bank" description="Silakan buat akun kas atau bank terlebih dahulu."/>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
