import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { useForm, Link } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function OTPForm({ token, email, className, ...props }) {
    const { data, setData, post, processing, errors } = useForm({
        token: token || "",
        email: email || "",
        otp: "",
    });

    const [timer, setTimer] = useState(() => {
        const storageKey = `otp_expiry_${token}`;
        const savedExpiry = localStorage.getItem(storageKey);
        
        if (savedExpiry) {
            const remaining = Math.floor((Number.parseInt(savedExpiry) - Date.now()) / 1000);
            return remaining > 0 ? remaining : 0;
        }
        
        // Jika belum ada, set expiry 10 menit dari sekarang
        const expiry = Date.now() + 600 * 1000;
        localStorage.setItem(storageKey, expiry.toString());
        return 600;
    });

    const [resendDisabled, setResendDisabled] = useState(true);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            setResendDisabled(true);
            interval = setInterval(() => {
                setTimer((prev) => {
                    const nextValue = prev - 1;
                    if (nextValue <= 0) {
                        localStorage.removeItem(`otp_expiry_${token}`);
                        return 0;
                    }
                    return nextValue;
                });
            }, 1000);
        } else {
            setResendDisabled(false);
            localStorage.removeItem(`otp_expiry_${token}`);
        }
        return () => clearInterval(interval);
    }, [timer, token]);

    function handleSubmit(e) {
        e.preventDefault();
        post(
            route("password.store", {
                token: data.token,
                email: data.email,
                otp: data.otp,
            }),
            {
                onError: (errors) => {
                    if (errors.otp) {
                        toast.error(errors.otp);
                    } else {
                        toast.error("Terjadi kesalahan saat verifikasi OTP.");
                    }
                },
                onSuccess: () => {
                    localStorage.removeItem(`otp_expiry_${token}`);
                    toast.success("OTP berhasil diverifikasi.");
                },
            }
        );
    }

    function handleResend() {
        localStorage.removeItem(`otp_expiry_${token}`);
        post(route("password.resend", { token: data.token }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("OTP telah dikirim ulang ke email Anda.");
            },
            onError: () => {
                toast.error("Gagal mengirim ulang OTP.");
            },
        });
    }

    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;

    return (
        <div className={cn("flex flex-col items-center gap-6", className)} {...props}>
            {/* Logo & Title above card */}
            <div className="flex flex-col items-center text-center gap-6">
                <img
                    src="/logo.webp"
                    alt="Logo"
                    width={48}
                    height={48}
                    className="h-12 w-auto object-contain transition-transform hover:scale-105 duration-300 dark:brightness-110"
                />
                <div className="space-y-1">
                    <p className="text-xl font-bold text-foreground tracking-tight leading-tight transition-colors duration-500">Sistem Akuntansi</p>
                    <p className="text-1/2xl font-bold text-muted-foreground leading-tight transition-colors duration-500">PT. Sarana Pembangunan Riau Trada</p>
                </div>
            </div>

            {/* Card */}
            <Card className="w-full max-w-[450px] overflow-hidden p-0 shadow-2xl rounded-2xl border-border transition-colors duration-500">
                <CardContent className="p-8 md:p-12 bg-card transition-colors duration-500">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-8">
                            {/* Heading */}
                            <div className="flex flex-col gap-3 text-left w-full">
                                <h1 className="text-2xl font-bold text-foreground tracking-tight transition-colors duration-500">Masukan kode verifikasi</h1>
                                <p className="text-[15px] text-muted-foreground leading-relaxed font-medium transition-colors duration-500">
                                    Kami telah mengirimkan 6-digit kode verifikasi.
                                </p>
                            </div>

                            {/* OTP Input */}
                            <div className="grid gap-4">
                                <Label htmlFor="otp" className="text-sm font-bold text-foreground/80 ml-1 transition-colors duration-500">Kode Verifikasi</Label>
                                <InputOTP
                                    maxLength={6}
                                    id="otp"
                                    required
                                    value={data.otp}
                                    onChange={(value) => setData("otp", value)}
                                    className="gap-2"
                                >
                                    <InputOTPGroup className="gap-2">
                                        {[0, 1, 2].map((index) => (
                                            <InputOTPSlot 
                                                key={index}
                                                index={index} 
                                                className="h-12 w-11 md:h-14 md:w-12 text-xl font-bold rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all" 
                                            />
                                        ))}
                                    </InputOTPGroup>
                                    <InputOTPSeparator className="text-muted-foreground/30" />
                                    <InputOTPGroup className="gap-2">
                                        {[3, 4, 5].map((index) => (
                                            <InputOTPSlot 
                                                key={index}
                                                index={index} 
                                                className="h-12 w-11 md:h-14 md:w-12 text-xl font-bold rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all" 
                                            />
                                        ))}
                                    </InputOTPGroup>
                                </InputOTP>
                                <p className="text-[13px] text-muted-foreground font-medium ml-1 transition-colors duration-500">
                                    Masukan kode verifikasi yang telah kami kirim ke email anda
                                </p>
                                {errors.otp && (
                                    <p className="text-sm font-medium text-destructive ml-1 transition-colors duration-500">{errors.otp}</p>
                                )}
                            </div>

                            {/* Submit */}
                            <div className="flex flex-col gap-5">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full h-12 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-base rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.99]"
                                >
                                    {processing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                    Verifikasi
                                </Button>

                                {/* Resend */}
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground font-medium transition-colors duration-500">
                                        Tidak menerima kode verifikasi?{" "}
                                        {timer > 0 ? (
                                            <span className="text-foreground font-bold transition-colors duration-500">
                                                Kirim lagi ({minutes}:{seconds < 10 ? `0${seconds}` : seconds})
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleResend}
                                                disabled={processing}
                                                className="font-bold text-primary hover:text-primary-hover transition-colors underline underline-offset-4 decoration-primary/20 hover:decoration-primary/40 duration-500"
                                            >
                                                Kirim lagi
                                            </button>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
