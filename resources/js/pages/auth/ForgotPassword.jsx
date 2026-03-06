import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { Head, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    return (
        <>
            <Head title="Lupa Kata Sandi" />
            <main className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10 transition-colors duration-500">
                <div className="w-full max-w-[450px]">
                    <ForgotPasswordForm />
                </div>
            </main>
        </>
    );
}
