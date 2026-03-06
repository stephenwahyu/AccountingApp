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
import { formatCurrency, formatCompactNumber } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    const totalBalance = accounts.reduce((sum, acc) => sum + Number.parseFloat(acc.balance), 0);

    return (
        <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4 border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">Kas & Setara Kas</CardTitle>
                    <div className="bg-primary/10 p-2 rounded-full">
                        <Wallet className="h-4 w-4 text-primary" />
                    </div>
                </div>
                <CardDescription className="mt-1">
                    Total saldo: <span className="font-bold text-foreground">{formatCurrency(totalBalance)}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="hidden md:block">
                    <Table>
                        <TableHeader className="bg-muted/20">
                            <TableRow>
                                <TableHead className="pl-6 h-10">Nama Akun</TableHead>
                                <TableHead className="text-right pr-6 h-10">Saldo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accounts.length > 0 ? (
                                accounts.map((account) => (
                                    <TableRow key={account.id} className="hover:bg-muted/50 border-b last:border-0">
                                        <TableCell className="pl-6">
                                            <div className="font-medium">{account.account_name}</div>
                                            <div className="text-xs text-muted-foreground font-mono">{account.account_code}</div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 font-mono font-semibold text-primary">
                                            {formatCurrency(account.balance)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="h-32 text-center">
                                        <Empty icon={<Wallet className="h-8 w-8 text-muted-foreground/50" />} title="Tidak ada akun" description="Data kas/bank belum tersedia."/>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="md:hidden divide-y">
                    {accounts.length > 0 ? (
                        accounts.map((account) => (
                           <MobileRow key={account.id} account={account} />
                        ))
                    ) : (
                         <div className="h-32 flex items-center justify-center p-6">
                             <p className="text-sm text-muted-foreground">Belum ada data.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
