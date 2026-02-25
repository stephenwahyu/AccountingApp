import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AppLayouts } from '@/pages/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

export default function DetailPengguna({ user, roles = [] }) {
    const breadcrumbs = [
        { title: 'Pengguna', href: route('pengguna.index') },
        { title: 'Detail Pengguna', href: '#' },
    ];

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            router.delete(route('pengguna.destroy', user.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Detail Pengguna" />
            <AppLayouts breadcrumbs={breadcrumbs}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Detail Pengguna</h1>
                        <p className="text-muted-foreground">
                            Melihat rincian pengguna.
                        </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" asChild>
                            <Link href={route('pengguna.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('pengguna.edit', user.id)}>
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
                        <CardTitle>Informasi Pengguna</CardTitle>
                        <CardDescription>Detail lengkap dari pengguna.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    value={user.name}
                                    disabled
                                    readOnly
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Alamat Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={user.email}
                                    disabled
                                    readOnly
                                />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="role_id">Role</Label>
                                <Select
                                    value={user.role_id.toString()}
                                    disabled
                                >
                                    <SelectTrigger id="role_id">
                                        <SelectValue placeholder="Pilih Role Pengguna" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id.toString()}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </AppLayouts>
        </>
    );
}
