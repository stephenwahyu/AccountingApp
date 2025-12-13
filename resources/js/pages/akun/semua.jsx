import React, { useState, Fragment } from "react";
import { Head, router } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

const breadcrumbs = [
    { title: "Bagan Perkiraan", href: route('bagan-perkiraan.index') },
];

const AccountRow = ({ account, level = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = account.descendants && account.descendants.length > 0;

    return (
        <Fragment>
            <TableRow>
                <TableCell style={{ paddingLeft: `${level * 2}rem` }}>
                    <div className="flex items-center gap-2">
                        {hasChildren && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="h-8 w-8"
                            >
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                        )}
                         {!hasChildren && <span className="w-8 h-8 inline-block" />}
                        <span className="font-medium">{account.account_code}</span>
                    </div>
                </TableCell>
                <TableCell>{account.account_name}</TableCell>
                <TableCell>{account.account_category?.name}</TableCell>
                <TableCell>{account.account_category?.account_type?.name}</TableCell>
            </TableRow>
            {isExpanded && hasChildren && account.descendants.map(child => (
                <AccountRow key={child.id} account={child} level={level + 1} />
            ))}
        </Fragment>
    );
};

export default function AkunSemua({ accounts: initialAccounts = [] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const handleTabChange = (value) => {
        router.visit(route(value));
    };
    
    // Note: Simple text filter on a nested structure is tricky.
    // This filter will flatten the tree and show only matching accounts, losing the hierarchy.
    // A proper search would highlight results within the tree. For now, we'll keep it simple.
    const filterAccounts = (accounts, term) => {
        const lowercasedTerm = term.toLowerCase();
        if (!lowercasedTerm) return accounts;

        let filtered = [];
        
        const search = (accounts) => {
            for (const account of accounts) {
                if (
                    account.account_code.toLowerCase().includes(lowercasedTerm) ||
                    account.account_name.toLowerCase().includes(lowercasedTerm) ||
                    account.account_category?.name.toLowerCase().includes(lowercasedTerm) ||
                    account.account_category?.account_type?.name.toLowerCase().includes(lowercasedTerm)
                ) {
                    filtered.push(account); // Add parent if it matches
                }
                if (account.descendants) {
                    search(account.descendants);
                }
            }
        }
        search(accounts);
        return filtered;
    }

    const displayedAccounts = searchTerm ? filterAccounts(initialAccounts, searchTerm) : initialAccounts;

    return (
        <>
            <Head title="Bagan Perkiraan - Semua" />
            <AppLayouts breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-2xl font-bold">Bagan Perkiraan</h1>
                        <p className="text-muted-foreground">
                            Semua akun dalam bagan perkiraan dengan struktur hierarki.
                        </p>
                    </div>

                    <Tabs value="bagan-perkiraan.index" onValueChange={handleTabChange}>
                        <TabsList>
                            <TabsTrigger value="bagan-perkiraan.index">Semua</TabsTrigger>
                            <TabsTrigger value="bagan-perkiraan.akun">Akun</TabsTrigger>
                            <TabsTrigger value="bagan-perkiraan.kategori-akun">Kategori Akun</TabsTrigger>
                            <TabsTrigger value="bagan-perkiraan.tipe-akun">Tipe Akun</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Akun</CardTitle>
                            <CardDescription>
                                Anda dapat mencari dan melihat semua akun dari sini. Klik panah untuk melihat sub-akun.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mb-4">
                                <div className="relative w-full">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Cari akun (akan menampilkan daftar datar)..."
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
                                            <TableHead>Kode Akun</TableHead>
                                            <TableHead>Nama Akun</TableHead>
                                            <TableHead>Kategori Akun</TableHead>
                                            <TableHead>Tipe Akun</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {displayedAccounts.length > 0 ? (
                                            displayedAccounts.map((account) => (
                                                <AccountRow key={account.id} account={account} />
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24">
                                                    Tidak ada data akun.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayouts>
        </>
    );
}
