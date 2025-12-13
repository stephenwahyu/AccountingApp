import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { AppLayouts } from '@/pages/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X } from 'lucide-react';

export default function FormAkun({ account = null, categories = [] }) {
    const isEdit = !!account;
    const { data, setData, post, put, processing, errors } = useForm({
        account_code: account?.account_code || '',
        account_name: account?.account_name || '',
        account_category_id: account?.account_category_id?.toString() || '',
    });

    const breadcrumbs = [
        { title: 'Bagan Perkiraan', href: route('bagan-perkiraan.index') },
        { title: 'Akun', href: route('bagan-perkiraan.akun') },
        { title: isEdit ? 'Edit Akun' : 'Tambah Akun', href: '#' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = isEdit ? route('bagan-perkiraan.akun.update', account.id) : route('bagan-perkiraan.akun.store');
        
        if (isEdit) {
            put(url, { preserveScroll: true });
        } else {
            post(url, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Akun' : 'Tambah Akun'} />
            <AppLayouts breadcrumbs={breadcrumbs}>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">{isEdit ? 'Edit Akun' : 'Tambah Akun'}</h1>
                            <p className="text-muted-foreground">
                                Isi form di bawah ini untuk {isEdit ? 'mengubah' : 'menambah'} akun.
                            </p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('bagan-perkiraan.akun')}>
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
                            <CardTitle>Informasi Akun</CardTitle>
                            <CardDescription>Masukkan detail akun.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="account_code">Kode Akun</Label>
                                    <Input
                                        id="account_code"
                                        value={data.account_code}
                                        onChange={(e) => setData('account_code', e.target.value)}
                                        placeholder="cth. 1101"
                                    />
                                    {errors.account_code && <p className="text-sm text-destructive">{errors.account_code}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="account_name">Nama Akun</Label>
                                    <Input
                                        id="account_name"
                                        value={data.account_name}
                                        onChange={(e) => setData('account_name', e.target.value)}
                                        placeholder="cth. Kas Kecil"
                                    />
                                    {errors.account_name && <p className="text-sm text-destructive">{errors.account_name}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="account_category_id">Kategori Akun</Label>
                                    <Select
                                        value={data.account_category_id}
                                        onValueChange={(value) => setData('account_category_id', value)}
                                    >
                                        <SelectTrigger id="account_category_id">
                                            <SelectValue placeholder="Pilih Kategori Akun" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.account_category_id && <p className="text-sm text-destructive">{errors.account_category_id}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </AppLayouts>
        </>
    );
}
