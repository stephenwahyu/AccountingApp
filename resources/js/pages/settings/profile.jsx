import { router, usePage } from "@inertiajs/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

import HeadingSmall from "@/components/heading-small";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SettingsLayout from "@/pages/layouts/settings/layout";

const profileSchema = z.object({
    name: z
        .string()
        .min(1, "Nama wajib diisi")
        .max(255, "Nama tidak boleh melebihi 255 karakter")
        .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh berisi huruf dan spasi")
        .trim(),
    email: z
        .string()
        .email("Silakan masukkan alamat email yang valid")
        .max(255, "Email tidak boleh melebihi 255 karakter")
        .toLowerCase(),
});

const statusMessages = {
    'profile-updated': {
        title: 'Profil berhasil diperbarui!',
        description: 'Perubahan Anda telah disimpan.',
        type: 'success'
    },
    'profile-updated-email-changed': {
        title: 'Profil berhasil diperbarui!',
        description: 'Silakan verifikasi alamat email baru Anda.',
        type: 'success'
    },
    'no-changes': {
        title: 'Tidak ada perubahan terdeteksi',
        description: 'Lakukan beberapa perubahan sebelum menyimpan.',
        type: 'info'
    },
    'update-failed': {
        title: 'Pembaruan gagal',
        description: 'Terjadi kesalahan. Silakan coba lagi.',
        type: 'error'
    },
    'validation-failed': {
        title: 'Validasi gagal',
        description: 'Harap perbaiki kesalahan di bawah ini.',
        type: 'error'
    }
};

export default function Profile() {
    const { auth, flash } = usePage().props;
    const [processing, setProcessing] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        setError,
        reset,
        clearErrors,
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: auth.user?.name || "",
            email: auth.user?.email || "",
        },
        mode: "onBlur",
    });

    // Handle flash messages with toast
    useEffect(() => {
        if (flash?.status && statusMessages[flash.status]) {
            const { title, description, type } = statusMessages[flash.status];
            
            switch (type) {
                case 'success':
                    toast.success(title, { description });
                    break;
                case 'info':
                    toast.info(title, { description });
                    break;
                case 'error':
                    toast.error(title, { description });
                    break;
                default:
                    toast(title, { description });
            }
            
            // Reset form to current user data on successful update
            if (flash.status === 'profile-updated' || flash.status === 'profile-updated-email-changed') {
                reset({
                    name: auth.user?.name || "",
                    email: auth.user?.email || "",
                });
                clearErrors();
            }
        }
    }, [flash?.status, flash?.message, auth.user, reset, clearErrors]);

    const onSubmit = useCallback((data) => {
        if (!isDirty) {
            toast.info("Tidak ada perubahan terdeteksi", {
                description: "Lakukan beberapa perubahan sebelum menyimpan.",
            });
            return;
        }

        setProcessing(true);
        
        // Show loading toast
        const loadingToast = toast.loading("Memperbarui profil...", {
            description: "Mohon tunggu sementara kami menyimpan perubahan Anda.",
        });

        router.patch("/settings/profile", data, {
            preserveScroll: true,
            onSuccess: () => {
                toast.dismiss(loadingToast);
                // Success will be handled by the flash message effect
            },
            onError: (errors) => {
                toast.dismiss(loadingToast);
                
                // Show specific error toast
                toast.error("Gagal memperbarui profil", {
                    description: "Harap periksa kesalahan di bawah ini dan coba lagi.",
                });
                
                // Set server validation errors
                Object.entries(errors).forEach(([key, message]) => {
                    setError(key, {
                        type: "server",
                        message: Array.isArray(message) ? message[0] : message,
                    });
                });
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    }, [isDirty, setError]);

    return (
        <SettingsLayout>
            <div className="space-y-6">
                <HeadingSmall
                    title="Informasi Profil"
                    description="Perbarui nama dan alamat email Anda"
                />

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama</Label>
                        <Input
                            id="name"
                            {...register("name")}
                            autoComplete="name"
                            placeholder="Masukkan nama lengkap Anda"
                            disabled={processing}
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Alamat Email</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register("email")}
                            autoComplete="username"
                            placeholder="Masukkan alamat email Anda"
                            disabled={processing}
                            className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            disabled={processing || !isDirty}
                            type="submit"
                            className="min-w-24"
                        >
                            {processing ? "Menyimpan..." : "Simpan"}
                        </Button>
                        
                        {isDirty && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    reset({
                                        name: auth.user?.name || "",
                                        email: auth.user?.email || "",
                                    });
                                    clearErrors();
                                    toast.info("Perubahan dibatalkan", {
                                        description: "Formulir telah dikembalikan ke nilai asli.",
                                    });
                                }}
                                disabled={processing}
                            >
                                Batal
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </SettingsLayout>
    );
}
