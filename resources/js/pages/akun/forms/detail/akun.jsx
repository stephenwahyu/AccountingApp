import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayouts from "@/pages/layouts/app-layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

export default function DetailAkun({ account }) {
    const breadcrumbs = [
        { title: 'Bagan Perkiraan', href: route('bagan-perkiraan.index') },
        { title: 'Akun', href: route('bagan-perkiraan.akun') },
        { title: 'Detail Akun', href: '#' },
    ];

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
            router.delete(route('bagan-perkiraan.akun.destroy', account.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Detail Akun" />
            <AppLayouts breadcrumbs={breadcrumbs}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Detail Akun</h1>
                        <p className="text-muted-foreground">
                            Melihat rincian lengkap dari sebuah akun.
                        </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                         <Button variant="outline" asChild>
                            <Link href={route('bagan-perkiraan.akun')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('bagan-perkiraan.akun.edit', account.id)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Akun</CardTitle>
                        <CardDescription>Detail lengkap dari akun.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label>Kode Akun</Label>
                                <Input value={account.account_code} readOnly disabled />
                            </div>
                            <div className="grid gap-2">
                                <Label>Nama Akun</Label>
                                <Input value={account.account_name} readOnly disabled />
                            </div>
                            <div className="grid gap-2">
                                <Label>Kategori Akun</Label>
                                <Input value={account.account_category.name} readOnly disabled />
                            </div>
                            <div className="grid gap-2">
                                <Label>Tipe Akun</Label>
                                <Input value={account.account_category.account_type.name} readOnly disabled />
                            </div>
                             <div className="grid gap-2">
                                <Label>Induk Akun</Label>
                                <Input value={account.parent ? `${account.parent.account_code} - ${account.parent.account_name}` : 'Tidak ada'} readOnly disabled />
                            </div>
                            <div className="grid gap-2">
                                <Label>Saldo Awal</Label>
                                <Input value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(account.initial_balance)} readOnly disabled />
                            </div>
                            <div className="grid gap-2 items-center">
                                <Label>Status</Label>
                                 <div className="flex items-center space-x-2 mt-2">
                                    <Switch
                                        checked={!!account.is_active}
                                        disabled
                                    />
                                    <span>{account.is_active ? 'Aktif' : 'Tidak Aktif'}</span>
                                </div>
                            </div>
                            <div className="grid gap-2 items-center">
                                <Label>Akun Arus Kas</Label>
                                <div className="flex items-center space-x-2 mt-2">
                                    <Switch
                                        checked={!!account.is_cash_account}
                                        disabled
                                    />
                                    <span>{account.is_cash_account ? 'Ya' : 'Tidak'}</span>
                                </div>
                            </div>
                             {account.is_cash_account && (
                                <div className="grid gap-2">
                                    <Label>Kategori Arus Kas</Label>
                                    <Input value={account.cash_flow_activity?.name || 'Tidak ada'} readOnly disabled />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </AppLayouts>
        </>
    );
}
