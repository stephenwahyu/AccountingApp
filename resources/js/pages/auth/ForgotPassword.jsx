import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { usePage } from "@inertiajs/react";
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
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                <ForgotPasswordForm />
            </div>
        </div>
    );
}
