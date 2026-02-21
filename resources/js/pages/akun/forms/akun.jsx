import React, { useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { AppLayouts } from '@/pages/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';

const buildTree = (accounts) => {
    const accountsById = {};
    accounts.forEach(acc => {
        accountsById[acc.id] = { ...acc, children: [] };
    });

    const tree = [];
    accounts.forEach(acc => {
        if (acc.parent_id && accountsById[acc.parent_id]) {
            accountsById[acc.parent_id].children.push(accountsById[acc.id]);
        } else {
            tree.push(accountsById[acc.id]);
        }
    });

    return tree;
};

const flattenTreeForSelect = (nodes, level = 0, options = []) => {
    for (const node of nodes) {
        options.push({
            value: node.id.toString(),
            label: `${node.account_code} - ${node.account_name}`,
            level: level,
        });
        if (node.children.length > 0) {
            flattenTreeForSelect(node.children, level + 1, options);
        }
    }
    return options;
};


export default function FormAkun({ account = null, categories = [], accounts = [], cashFlowActivities = [] }) {
    const isEdit = !!account;
    const { data, setData, post, put, processing, errors } = useForm({
        account_code: account?.account_code || '',
        account_name: account?.account_name || '',
        account_category_id: account?.account_category_id?.toString() || '',
        parent_id: account?.parent_id ? account.parent_id.toString() : 'null',
        initial_balance: account?.initial_balance || 0,
        is_active: account ? !!account.is_active : true,
        is_cash_account: account ? !!account.is_cash_account : false,
        cash_flow_activity_id: account?.cash_flow_activity_id?.toString() || '',
    });

    const accountOptions = useMemo(() => {
        let availableAccounts = accounts;
        if (isEdit) {
            const descendantIds = new Set([account.id]);
            const findDescendants = (parentId) => {
                accounts
                    .filter(a => a.parent_id === parentId)
                    .forEach(child => {
                        descendantIds.add(child.id);
                        findDescendants(child.id);
                    });
            };
            findDescendants(account.id);
            availableAccounts = accounts.filter(a => !descendantIds.has(a.id));
        }
        const tree = buildTree(availableAccounts);
        return flattenTreeForSelect(tree);
    }, [accounts, isEdit, account]);


    const breadcrumbs = [
        { title: 'Bagan Perkiraan', href: route('bagan-perkiraan.index') },
        { title: 'Akun', href: route('bagan-perkiraan.akun') },
        { title: isEdit ? 'Edit Akun' : 'Tambah Akun', href: '#' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = isEdit ? route('bagan-perkiraan.akun.update', account.id) : route('bagan-perkiraan.akun.store');
        
        const options = {
            preserveScroll: true,
            onError: () => toast.error("Terjadi kesalahan validasi. Harap periksa kembali form Anda."),
        };

        const dataToSend = {
            ...data,
            parent_id: data.parent_id === 'null' ? null : data.parent_id,
            cash_flow_activity_id: data.is_cash_account && data.cash_flow_activity_id !== '' ? data.cash_flow_activity_id : null,
        };

        if (isEdit) {
            put(url, { ...options, data: dataToSend });
        } else {
            post(url, { ...options, data: dataToSend });
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
                            <CardDescription>Masukkan detail dan konfigurasi akun.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="account_code">Kode Akun</Label>
                                    <Input
                                        id="account_code"
                                        value={data.account_code}
                                        onChange={(e) => setData('account_code', e.target.value)}
                                        placeholder="cth. 1-1101"
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
                                <div className="grid gap-2">
                                    <Label htmlFor="parent_id">Induk Akun</Label>
                                    <Select
                                        value={data.parent_id}
                                        onValueChange={(value) => setData('parent_id', value)}
                                    >
                                        <SelectTrigger id="parent_id">
                                            <SelectValue placeholder="Tidak ada induk" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="null">Tidak ada induk</SelectItem>
                                            {accountOptions.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    <span style={{ paddingLeft: `${opt.level * 1.5}rem` }}>
                                                        {opt.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.parent_id && <p className="text-sm text-destructive">{errors.parent_id}</p>}
                                </div>
                                <div className="md:col-span-2 grid gap-2">
                                    <Label htmlFor="initial_balance">Saldo Awal</Label>
                                    <Input
                                        id="initial_balance"
                                        type="number"
                                        value={data.initial_balance}
                                        onChange={(e) => setData('initial_balance', e.target.value)}
                                        placeholder="0"
                                    />
                                    {errors.initial_balance && <p className="text-sm text-destructive">{errors.initial_balance}</p>}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active">Akun Aktif</Label>
                                    {errors.is_active && <p className="text-sm text-destructive">{errors.is_active}</p>}
                                </div>
                               <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_cash_account"
                                        checked={data.is_cash_account}
                                        onCheckedChange={(checked) => setData('is_cash_account', checked)}
                                    />
                                    <Label htmlFor="is_cash_account">Akun Kas/Bank</Label>
                                    {errors.is_cash_account && <p className="text-sm text-destructive">{errors.is_cash_account}</p>}
                                </div>
                                
                                {data.is_cash_account && (
                                    <div className="grid gap-2 md:col-span-2">
                                        <Label htmlFor="cash_flow_activity_id">Kategori Arus Kas</Label>
                                        <Select
                                            value={data.cash_flow_activity_id}
                                            onValueChange={(value) => setData('cash_flow_activity_id', value)}
                                        >
                                            <SelectTrigger id="cash_flow_activity_id">
                                                <SelectValue placeholder="Pilih Kategori Arus Kas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cashFlowActivities.map((activity) => (
                                                    <SelectItem key={activity.id} value={activity.id.toString()}>
                                                        {activity.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.cash_flow_activity_id && <p className="text-sm text-destructive">{errors.cash_flow_activity_id}</p>}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </AppLayouts>
        </>
    );
}
