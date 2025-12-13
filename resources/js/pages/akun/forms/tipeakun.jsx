import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { AppLayouts } from '@/pages/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';

export default function FormTipeAkun({ type = null }) {
    const isEdit = !!type;
    const { data, setData, post, put, processing, errors } = useForm({
        name: type?.name || '',
    });

    const breadcrumbs = [
        { title: 'Bagan Perkiraan', href: route('bagan-perkiraan.index') },
        { title: 'Tipe Akun', href: route('bagan-perkiraan.tipe-akun') },
        { title: isEdit ? 'Edit Tipe Akun' : 'Tambah Tipe Akun', href: '#' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = isEdit ? route('bagan-perkiraan.tipe-akun.update', type.id) : route('bagan-perkiraan.tipe-akun.store');
        const method = isEdit ? 'put' : 'post';
        
        if (isEdit) {
            put(url, {
                preserveScroll: true,
            });
        } else {
            post(url, {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Tipe Akun' : 'Tambah Tipe Akun'} />
            <AppLayouts breadcrumbs={breadcrumbs}>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">{isEdit ? 'Edit Tipe Akun' : 'Tambah Tipe Akun'}</h1>
                            <p className="text-muted-foreground">
                                Isi form di bawah ini untuk {isEdit ? 'mengubah' : 'menambah'} tipe akun.
                            </p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('bagan-perkiraan.tipe-akun')}>
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
                            <CardTitle>Informasi Tipe Akun</CardTitle>
                            <CardDescription>Masukkan nama unik untuk tipe akun.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Tipe Akun</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="cth. Aset Lancar"
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </AppLayouts>
        </>
    );
}
