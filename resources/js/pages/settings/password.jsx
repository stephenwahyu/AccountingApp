import SettingsLayout from '@/pages/layouts/settings/layout';
import { router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const passwordSchema = z
    .object({
        current_password: z.string().min(1, 'Kata sandi saat ini wajib diisi'),
        password: z
            .string()
            .min(8, 'Kata sandi harus minimal 8 karakter')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
                'Kata sandi harus mengandung huruf kecil, huruf besar, angka, dan karakter khusus'
            ),
        password_confirmation: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Kata sandi tidak cocok",
        path: ['password_confirmation'],
    });

const defaultValues = {
    current_password: '',
    password: '',
    password_confirmation: '',
};

const statusMessages = {
    'password-updated': {
        title: 'Kata sandi berhasil diperbarui!',
        description: 'Kata sandi Anda telah diubah dan disimpan dengan aman.',
        type: 'success'
    },
    'password-update-failed': {
        title: 'Gagal memperbarui kata sandi',
        description: 'Terjadi kesalahan. Silakan coba lagi.',
        type: 'error'
    },
    'validation-failed': {
        title: 'Validasi gagal',
        description: 'Harap perbaiki kesalahan di bawah ini.',
        type: 'error'
    }
};

export default function Password() {
    const { flash } = usePage().props;
    const [processing, setProcessing] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setError,
        watch,
        clearErrors,
    } = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues,
        mode: 'onChange',
    });

    const password = watch('password');
    const passwordConfirmation = watch('password_confirmation');

    // Handle flash messages with toast
    useEffect(() => {
        if (flash?.status && statusMessages[flash.status]) {
            const { title, description, type } = statusMessages[flash.status];
            
            switch (type) {
                case 'success':
                    toast.success(title, { description });
                    break;
                case 'error':
                    toast.error(title, { description });
                    break;
                default:
                    toast(title, { description });
            }
            
            // Reset form on successful password update
            if (flash.status === 'password-updated') {
                reset(defaultValues);
                clearErrors();
            }
        }
    }, [flash?.status, flash?.message, reset, clearErrors]);

    const onSubmit = useCallback(async (data) => {
        setProcessing(true);

        // Show loading toast
        const loadingToast = toast.loading("Memperbarui kata sandi...", {
            description: "Mohon tunggu sementara kami menyimpan kata sandi baru Anda.",
        });

        router.put("/settings/password", data, {
            preserveScroll: true,
            onSuccess: () => {
                toast.dismiss(loadingToast);
                // Success will be handled by the flash message effect
            },
            onError: (errors) => {
                toast.dismiss(loadingToast);
                
                // Show error toast
                toast.error("Gagal memperbarui kata sandi", {
                    description: "Harap periksa kesalahan di bawah ini dan coba lagi.",
                });
                
                // Reset sensitive fields on error
                const sensitiveFields = ['current_password'];
                if (errors.password || errors.password_confirmation) {
                    sensitiveFields.push('password', 'password_confirmation');
                }
                
                const fieldsToReset = Object.fromEntries(
                    sensitiveFields.map(field => [field, ''])
                );
                
                reset(prev => ({ ...prev, ...fieldsToReset }));

                // Set server errors
                Object.entries(errors).forEach(([key, message]) => {
                    setError(key, {
                        type: 'server',
                        message: Array.isArray(message) ? message[0] : message,
                    });
                });
            },
            onFinish: () => setProcessing(false),
        });
    }, [reset, setError]);

    const passwordStrength = useMemo(() => {
        if (!password) return { strength: 0, label: '', color: '' };
        
        const checks = [
            password.length >= 8,
            /[a-z]/.test(password),
            /[A-Z]/.test(password),
            /\d/.test(password),
            /[!@#$%^&*(),.?":{}|<>]/.test(password),
            password.length >= 12,
        ];
        
        const strength = checks.filter(Boolean).length;
        
        if (strength <= 2) return { strength, label: 'Lemah', color: 'bg-red-500' };
        if (strength <= 4) return { strength, label: 'Cukup', color: 'bg-yellow-500' };
        if (strength <= 5) return { strength, label: 'Baik', color: 'bg-blue-500' };
        return { strength, label: 'Kuat', color: 'bg-green-500' };
    }, [password]);

    const showPasswordMismatch = password && passwordConfirmation && 
        password !== passwordConfirmation && !errors.password_confirmation;

    const handleCancelChanges = () => {
        reset(defaultValues);
        clearErrors();
        toast.info("Formulir dibersihkan", {
            description: "Semua bidang kata sandi telah diatur ulang.",
        });
    };

    const hasFormData = password || passwordConfirmation || watch('current_password');

    return (
        <SettingsLayout>
            <div className="space-y-6">
                <HeadingSmall
                    title="Perbarui kata sandi"
                    description="Pastikan akun Anda menggunakan kata sandi yang panjang dan acak untuk tetap aman"
                />

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="current_password">Kata sandi saat ini</Label>
                        <Input
                            id="current_password"
                            {...register('current_password')}
                            type="password"
                            autoComplete="current-password"
                            placeholder="Masukkan kata sandi saat ini"
                            disabled={processing}
                            className={errors.current_password ? "border-red-500" : ""}
                        />
                        {errors.current_password && (
                            <p className="text-sm text-red-600">
                                {errors.current_password.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Kata sandi baru</Label>
                        <Input
                            id="password"
                            {...register('password')}
                            type="password"
                            autoComplete="new-password"
                            placeholder="Masukkan kata sandi baru"
                            disabled={processing}
                            className={errors.password ? "border-red-500" : ""}
                        />
                        
                        {password && (
                            <div className="mt-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                            style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">
                                        {passwordStrength.label}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        {errors.password && (
                            <p className="text-sm text-red-600">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Konfirmasi kata sandi</Label>
                        <Input
                            id="password_confirmation"
                            {...register('password_confirmation')}
                            type="password"
                            autoComplete="new-password"
                            placeholder="Konfirmasi kata sandi baru"
                            disabled={processing}
                            className={errors.password_confirmation || showPasswordMismatch ? "border-red-500" : ""}
                        />
                        
                        {showPasswordMismatch && (
                            <p className="text-sm text-orange-600">
                                Kata sandi tidak cocok
                            </p>
                        )}
                        
                        {errors.password_confirmation && (
                            <p className="text-sm text-red-600">
                                {errors.password_confirmation.message}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button 
                            disabled={processing} 
                            type="submit"
                            className="min-w-32"
                        >
                            {processing ? 'Memperbarui...' : 'Perbarui kata sandi'}
                        </Button>
                        
                        {hasFormData && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelChanges}
                                disabled={processing}
                            >
                                Bersihkan formulir
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </SettingsLayout>
    );
}
