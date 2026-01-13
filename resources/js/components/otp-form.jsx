import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useForm } from "@inertiajs/react"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

export function OTPForm({ token, email, className, ...props }) {
    const { data, setData, post, processing, errors } = useForm({
        token: token || "",
        email: email || "",
        otp: "",
    })

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
        e.preventDefault()
        post(route("password.store", { token: data.token, email: data.email, otp: data.otp}))
    }

    function handleResend() {
        post(route("password.resend", { token: data.token }), {
            preserveScroll: true,
            onSuccess: () => {
                setTimer(600);
            },
        })
    }
    
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;

  return (
    <div
      className={cn("flex flex-col gap-6 md:min-h-[450px]", className)}
      {...props}
    >
      <Card className="flex-1 overflow-hidden p-0">
        <CardContent className="grid flex-1 p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="flex flex-col justify-center gap-6 p-6 md:p-8">
            <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Reset Password</h1>
                <p className="text-balance text-sm text-muted-foreground">
                    Enter the 6-digit code sent to <strong>{email}</strong>, then set
                    your new password.
                </p>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="otp">Verification Code</Label>
                <InputOTP
                    maxLength={6}
                    id="otp"
                    required
                    value={data.otp}
                    onChange={(value) => setData("otp", value)}
                    containerClassName="gap-4"
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
                {errors.otp && <p className="text-sm text-destructive mt-1">{errors.otp}</p>}
            </div>
            <Button type="submit" disabled={processing} className="w-full">
                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify OTP
            </Button>
            <div className="text-center text-sm text-muted-foreground">
                {timer > 0 ? (
                    <p>Resend OTP in {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</p>
                ) : (
                    <Button
                        variant="link"
                        onClick={handleResend}
                        disabled={processing || !resendDisabled}
                    >
                        Resend OTP
                    </Button>
                )}
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-muted-foreground">
        Remembered your password? <a href={route('login')} className="underline underline-offset-4">Login</a>
      </div>
    </div>
  )
}
