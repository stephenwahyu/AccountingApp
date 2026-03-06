import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Link } from "@inertiajs/react";
import { Loader2, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";

export function LoginForm({ className, ...props }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        post(route("login"));
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0 shadow-2xl rounded-2xl border-border transition-colors duration-500">
                <CardContent className="grid p-0 md:grid-cols-2">
                    {/* Left: Form */}
                    <form onSubmit={handleSubmit} className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-card transition-colors duration-500">
                        <div className="flex flex-col gap-8">
                            {/* Logo & Title */}
                            <div className="flex flex-col items-center text-center gap-5">
                                <img
                                    src="/logo.webp"
                                    alt="Logo PT. SPR Trada"
                                    width={80}
                                    height={80}
                                    className="h-20 w-auto object-contain transition-transform hover:scale-105 duration-300 dark:brightness-110"
                                />
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-bold text-foreground tracking-tight leading-tight">
                                        Sistem Akuntansi
                                    </h1>
                                    <h2 className="text-xl font-semibold text-muted-foreground leading-tight">
                                        PT. Sarana Pembangunan Riau Trada
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-2 font-medium">
                                        Masuk untuk menggunakan layanan
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5">
                                {/* Email */}
                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-sm font-bold text-foreground/90 ml-1">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        autoFocus
                                        className={cn(
                                            "h-12 px-4 border-input bg-muted/30 focus:bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-xl",
                                            errors.email && "border-destructive focus:ring-destructive/20"
                                        )}
                                    />
                                    {errors.email && (
                                        <p className="text-xs font-medium text-destructive ml-1">{errors.email}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="grid gap-2">
                                    <Label htmlFor="password" className="text-sm font-bold text-foreground/90 ml-1">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={data.password}
                                            onChange={(e) => setData("password", e.target.value)}
                                            className={cn(
                                                "h-12 px-4 pr-12 border-input bg-muted/30 focus:bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-xl",
                                                errors.password && "border-destructive focus:ring-destructive/20"
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            tabIndex={-1}
                                            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-xs font-medium text-destructive ml-1">{errors.password}</p>
                                    )}
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2.5">
                                        <Checkbox
                                            id="remember"
                                            checked={data.remember}
                                            onCheckedChange={(checked) => setData("remember", checked)}
                                            className="h-5 w-5 rounded-md border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors"
                                        />
                                        <Label htmlFor="remember" className="text-sm text-muted-foreground font-medium cursor-pointer select-none">
                                            Ingat saya
                                        </Label>
                                    </div>
                                    <Link
                                        href={route("password.request")}
                                        className="text-sm font-bold text-primary hover:text-primary-hover transition-colors"
                                    >
                                        Lupa password?
                                    </Link>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-12 mt-2 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-base rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.99]"
                                disabled={processing}
                            >
                                {processing ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : null}
                                Login
                            </Button>
                        </div>
                    </form>

                    {/* Right: Brand Illustration */}
                    <div className="relative hidden md:block bg-muted overflow-hidden border-l border-border transition-colors duration-500">
                        <picture>
                            <source media="(max-width: 767px)" srcSet="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
                            <img
                                src="/image.webp"
                                alt="Finance Illustration"
                                width={600}
                                height={800}
                                fetchpriority="high"
                                loading="eager"
                                className="h-full w-full object-cover opacity-90 transition-opacity hover:opacity-100 duration-500 dark:brightness-[0.8] dark:contrast-125"
                            />
                        </picture>
                        <div className="absolute inset-0 bg-linear-to-l from-transparent to-background/10 pointer-events-none" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
