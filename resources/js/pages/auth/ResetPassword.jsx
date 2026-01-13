import { ResetPasswordForm } from "@/components/reset-password-form";

export default function ResetPasswordPage({ token, email }) {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                <ResetPasswordForm token={token} email={email} />
            </div>
        </div>
    );
}
