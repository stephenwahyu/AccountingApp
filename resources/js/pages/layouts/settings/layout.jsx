import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { AppLayouts } from "@/pages/layouts/app-layout";

const sidebarNavItems = [
    {
        title: 'Profil',
        href: '/settings/profile',
    },
    {
        title: 'Kata Sandi',
        href: '/settings/password',
    },
    {
      title: 'Tampilan',
      href: '/settings/appearance',
      icon: null,
  },
];

export default function SettingsLayout({ children }) {
    const { url } = usePage();
    
    return (
        <AppLayouts breadcrumbs={[{ title: 'Pengaturan', href: '/settings/profile' }]}>
            <Heading 
                title="Pengaturan" 
                description="Kelola profil dan pengaturan akun Anda" 
            />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full lg:w-48">
                    <nav className="flex flex-col space-y-1">
                        {sidebarNavItems.map((item) => (
                            <Button
                                key={item.href}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn(
                                    'w-full justify-start',
                                    url === item.href && 'bg-muted'
                                )}
                            >
                                <Link href={item.href}>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <div className="flex-1 max-w-2xl">
                    {children}
                </div>
            </div>
        </AppLayouts>
    );
}
