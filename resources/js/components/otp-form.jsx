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

    const [timer, setTimer] = useState(600); // 10 minutes in seconds
    const [resendDisabled, setResendDisabled] = useState(true);

    useEffect(() => {
        if (timer > 0) {
            setResendDisabled(true);
            const interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setResendDisabled(false);
        }
    }, [timer]);

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
                    toast.success("OTP berhasil diverifikasi.");
                },
            }
        );
    }

    function handleResend() {
        post(route("password.resend", { token: data.token }), {
            preserveScroll: true,
            onSuccess: () => {
                setTimer(600);
                toast.success("OTP telah dikirim ulang ke email Anda.");
            },
            onError: () => {
                toast.error("Gagal mengirim ulang OTP.");
            }
        });
    }

    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="flex-1 overflow-hidden p-0">
                <CardContent className="grid flex-1 p-0 md:grid-cols-2">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col justify-center gap-6 p-6 md:p-8"
                    >
                        <div className="flex flex-col items-center text-center">
                            <h1 className="text-2xl font-bold">
                                Atur Ulang Kata Sandi
                            </h1>
                            <p className="text-balance text-sm text-muted-foreground">
                                Masukkan 6 digit kode yang dikirim ke{" "}
                                <strong>{email}</strong>, lalu atur kata sandi baru Anda.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="otp">Kode Verifikasi</Label>
                            <InputOTP
                                maxLength={6}
                                id="otp"
                                required
                                value={data.otp}
                                onChange={(value) => setData("otp", value)}
                                containerClassName="justify-center gap-4"
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                            {errors.otp && (
                                <p className="text-sm text-destructive mt-1">
                                    {errors.otp}
                                </p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full"
                        >
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Verifikasi OTP
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            {timer > 0 ? (
                                <p>
                                    Kirim ulang OTP dalam {minutes}:
                                    {seconds < 10 ? `0${seconds}` : seconds}
                                </p>
                            ) : (
                                <Button
                                    variant="link"
                                    onClick={handleResend}
                                    disabled={processing}
                                >
                                    Kirim Ulang OTP
                                </Button>
                            )}
                        </div>
                    </form>
                    <div className="relative rounded-xl hidden bg-muted md:block">
                        <img
                            src="image.png"
                            alt="Image"
                            width="1920"
                            height="1080"
                            className="absolute rounded-xs inset-0 h-full w-full object-cover dark:brightness-[0.8]"
                        />
                        <div
                            className="absolute inset-0 rounded-xs pointer-events-none"
                            style={{
                                backgroundColor: "rgba(255, 0, 0, 0.5)", // subtle transparent red
                                mixBlendMode: "screen", // or "soft-light" / "multiply"
                            }}
                        />
                    </div>
                </CardContent>
            </Card>
            <div className="text-center text-xs text-muted-foreground">
                Ingat kata sandi Anda?{" "}
                <Link
                    href={route("login")}
                    className="underline underline-offset-4"
                >
                    Masuk
                </Link>
            </div>
        </div>
    );
}
