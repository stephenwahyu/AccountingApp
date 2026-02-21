import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm, Link } from "@inertiajs/react"
import { Loader2 } from "lucide-react"

export function ForgotPasswordForm({ className, ...props }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    })

    function handleSubmit(e) {
        e.preventDefault()
        post(route("password.email"))
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <h1 className="text-2xl font-bold">Forgot Password</h1>
                                <p className="text-balance text-muted-foreground">
                                    Enter your email to receive a password reset link.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    autoFocus
                                />
                                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Password Reset Link
                            </Button>
                        </div>
                    </form>
                    <div className="relative hidden bg-muted md:block rounded-xl">
                        <img
                            src="/image.png"
                            alt="Finance"
                            width="1920"
                            height="1080"
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>
            <div className="text-center text-xs text-muted-foreground">
                <Link href={route("login")} className="underline underline-offset-4 hover:text-primary">
                    Back to login
                </Link>
            </div>
        </div>
    )
}
