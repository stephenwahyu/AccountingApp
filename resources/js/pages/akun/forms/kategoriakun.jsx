import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { AppLayouts } from '@/pages/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X } from 'lucide-react';

export default function FormKategoriAkun({ category = null, types = [] }) {
    const isEdit = !!category;
    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name || '',
        account_type_id: category?.account_type_id?.toString() || '',
    });

    const breadcrumbs = [
        { title: 'Bagan Perkiraan', href: route('bagan-perkiraan.index') },
        { title: 'Kategori Akun', href: route('bagan-perkiraan.kategori-akun') },
        { title: isEdit ? 'Edit Kategori Akun' : 'Tambah Kategori Akun', href: '#' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = isEdit ? route('bagan-perkiraan.kategori-akun.update', category.id) : route('bagan-perkiraan.kategori-akun.store');
        
        if (isEdit) {
            put(url, { preserveScroll: true });
        } else {
            post(url, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Kategori Akun' : 'Tambah Kategori Akun'} />
            <AppLayouts breadcrumbs={breadcrumbs}>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">{isEdit ? 'Edit Kategori Akun' : 'Tambah Kategori Akun'}</h1>
                            <p className="text-muted-foreground">
                                Isi form di bawah ini untuk {isEdit ? 'mengubah' : 'menambah'} kategori akun.
                            </p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('bagan-perkiraan.kategori-akun')}>
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
                            <CardTitle>Informasi Kategori Akun</CardTitle>
                            <CardDescription>Masukkan nama unik dan pilih tipe akun yang sesuai.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Kategori Akun</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="cth. Kas & Bank"
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="account_type_id">Tipe Akun</Label>
                                    <Select
                                        value={data.account_type_id}
                                        onValueChange={(value) => setData('account_type_id', value)}
                                    >
                                        <SelectTrigger id="account_type_id">
                                            <SelectValue placeholder="Pilih Tipe Akun" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {types.map((type) => (
                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.account_type_id && <p className="text-sm text-destructive">{errors.account_type_id}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </AppLayouts>
        </>
    );
}
