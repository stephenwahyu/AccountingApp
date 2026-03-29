import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Link } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ResetPasswordForm({ token, email, className, ...props }) {
    const { data, setData, put, processing, errors } = useForm({
        token: token || "",
        email: email || "",
        password: "",
        password_confirmation: "",
    });

    function handleSubmit(e) {
        e.preventDefault();
        put(route("password.update"), {
            onSuccess: () => {
                toast.success(
                    "Kata sandi Anda telah berhasil diatur ulang. Silakan login.",
                );
            },
            onError: (errors) => {
                if (errors.password) {
                    toast.error(errors.password);
                } else if (errors.email) {
                    toast.error(errors.email);
                } else {
                    toast.error(
                        "Gagal mengatur ulang kata sandi. Silakan coba lagi.",
                    );
                }
            },
        });
    }

    return (
        <div
            className={cn("flex flex-col items-center gap-6", className)}
            {...props}
        >
            {/* Logo & Title above card */}
            <div className="flex flex-col items-center text-center gap-6">
                <img
                    src="/logo.webp"
                    srcSet="/logo-sm.webp 80w, /logo.webp 160w"
                    sizes="80px"
                    alt="Logo PT. SPR Trada"
                    width={80}
                    height={80}
                    className="h-20 w-auto object-contain transition-transform hover:scale-105 duration-300 dark:brightness-110 mb-2"
                />
                <div className="space-y-1">
                    <p className="text-xl font-bold text-foreground tracking-tight leading-tight transition-colors duration-500">
                        Sistem Akuntansi
                    </p>
                    <p className="text-1/2xl font-bold text-muted-foreground leading-tight transition-colors duration-500">
                        PT. Sarana Pembangunan Riau Trada
                    </p>
                </div>
            </div>

            {/* Card */}
            <Card className="w-full max-w-[450px] overflow-hidden p-0 shadow-2xl rounded-2xl border-border transition-colors duration-500">
                <CardContent className="p-8 md:p-12 bg-card transition-colors duration-500">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-8">
                            {/* Heading */}
                            <div className="flex flex-col gap-3">
                                <h1 className="text-2xl font-bold text-foreground tracking-tight transition-colors duration-500">
                                    Masukan kata sandi baru.
                                </h1>
                                <p className="text-[15px] text-muted-foreground leading-relaxed font-medium transition-colors duration-500">
                                    Pastikan untuk mengingat kata sandi baru
                                    anda.
                                </p>
                            </div>

                            <div className="flex flex-col gap-5">
                                {/* Password */}
                                <div className="grid gap-2.5">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-bold text-foreground/80 ml-1 transition-colors duration-500"
                                    >
                                        Kata Sandi Baru
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="m@example.com"
                                        required
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        autoFocus
                                        className="h-12 px-4 border-input bg-muted/30 focus:bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-xl placeholder:text-muted-foreground/40"
                                    />
                                    {errors.password && (
                                        <p className="text-sm font-medium text-destructive ml-1 transition-colors duration-500">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Password Confirmation */}
                                <div className="grid gap-2.5">
                                    <Label
                                        htmlFor="password_confirmation"
                                        className="text-sm font-bold text-foreground/80 ml-1 transition-colors duration-500"
                                    >
                                        Konfirmasi Kata Sandi Baru
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        placeholder="m@example.com"
                                        required
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                "password_confirmation",
                                                e.target.value,
                                            )
                                        }
                                        className="h-12 px-4 border-input bg-muted/30 focus:bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-xl placeholder:text-muted-foreground/40"
                                    />
                                    {errors.password_confirmation && (
                                        <p className="text-sm font-medium text-destructive ml-1 transition-colors duration-500">
                                            {errors.password_confirmation}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full h-12 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-base rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.99]"
                                disabled={processing}
                            >
                                {processing && (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                )}
                                Ganti
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
