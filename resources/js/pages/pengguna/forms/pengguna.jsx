import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { AppLayouts } from '@/pages/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function FormPengguna({ user = null, roles = [] }) {
    const isEdit = !!user;
    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        role_id: user?.role_id?.toString() || '',
        password: '',
        password_confirmation: '',
    });

    const breadcrumbs = [
        { title: 'Pengguna', href: route('pengguna.index') },
        { title: isEdit ? 'Edit Pengguna' : 'Tambah Pengguna', href: '#' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = isEdit ? route('pengguna.update', user.id) : route('pengguna.store');
        
        const options = {
            preserveScroll: true,
            onError: () => toast.error("Terjadi kesalahan validasi. Harap periksa kembali form Anda."),
        };

        if (isEdit) {
            put(url, options);
        } else {
            post(url, options);
        }
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Pengguna' : 'Tambah Pengguna'} />
            <AppLayouts breadcrumbs={breadcrumbs}>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">{isEdit ? 'Edit Pengguna' : 'Tambah Pengguna'}</h1>
                            <p className="text-muted-foreground">
                                Isi form di bawah ini untuk {isEdit ? 'mengubah' : 'menambah'} pengguna.
                            </p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('pengguna.index')}>
                                    <X className="h-4 w-4 mr-2" />
                                    Batal
                                </Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Pengguna</CardTitle>
                            <CardDescription>Masukkan detail dan peran pengguna.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="cth. John Doe"
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Alamat Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="cth. john@example.com"
                                    />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>
                                 <div className="grid gap-2">
                                    <Label htmlFor="role_id">Role</Label>
                                    <Select
                                        value={data.role_id}
                                        onValueChange={(value) => setData('role_id', value)}
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
                                    {errors.role_id && <p className="text-sm text-destructive">{errors.role_id}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Minimal 8 karakter'}
                                        />
                                        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Ulangi password"
                                        />
                                        {errors.password_confirmation && <p className="text-sm text-destructive">{errors.password_confirmation}</p>}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </AppLayouts>
        </>
    );
}