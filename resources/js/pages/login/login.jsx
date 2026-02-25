import { LoginForm } from "@/components/login-form"
import { Head, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function LoginPage() {
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
      <Head title="Masuk" />
      <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10 transition-colors duration-500">
        <div className="w-full max-w-sm md:max-w-5xl">
          <LoginForm />
        </div>
        <p className="mt-8 text-sm text-muted-foreground font-medium">
          2025 &copy; PT. Sarana Pembangunan Riau Trada
        </p>
      </div>
    </>
  );
}
