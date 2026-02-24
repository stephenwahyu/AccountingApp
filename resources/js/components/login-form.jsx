import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Link } from "@inertiajs/react";
import { Loader2 } from "lucide-react";

export function LoginForm({ className, ...props }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route("login"));
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <h1 className="text-2xl font-bold">
                                    Selamat Datang Kembali
                                </h1>
                                <p className="text-balance text-muted-foreground">
                                    Masuk ke akun Anda
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nama@contoh.com"
                                    required
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    autoFocus
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Kata Sandi</Label>
                                    <Link
                                        href={route("password.request")}
                                        className="ml-auto text-sm underline-offset-2 hover:underline"
                                    >
                                        Lupa kata sandi?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Masuk
                            </Button>
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
        </div>
    );
}
