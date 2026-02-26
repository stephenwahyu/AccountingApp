import * as React from "react";
import { Command } from "lucide-react";
import { usePage } from "@inertiajs/react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    AccountTree,
    Balance,
    CalendarMonth,
    Dashboard,
    Description,
    ManageAccounts,
    MenuBook,
    TableChart,
} from "@material-symbols-svg/react-rounded";

export function AppSidebar({ ...props }) {
    const { auth } = usePage().props;
    const { url } = usePage();
    const { user } = auth;

    const navMain = [
        {
            title: "Dashboard",
            url: route("dashboard"),
            icon: Dashboard,
            isActive: url === "/dashboard",
        },
        {
            title: "Bagan Perkiraan",
            url: route("bagan-perkiraan.index"),
            icon: AccountTree,
            isActive: url.startsWith("/bagan-perkiraan"),
            hidden: user.role?.name === "Direktur",
            items: [
                {
                    title: "Akun",
                    url: route("bagan-perkiraan.akun"),
                    isActive: url.startsWith("/bagan-perkiraan/akun"),
                },
                {
                    title: "Kategori Akun",
                    url: route("bagan-perkiraan.kategori-akun"),
                    isActive: url.startsWith("/bagan-perkiraan/kategori-akun"),
                },
                {
                    title: "Tipe Akun",
                    url: route("bagan-perkiraan.tipe-akun"),
                    isActive: url.startsWith("/bagan-perkiraan/tipe-akun"),
                },
            ],
        },
        {
            title: "Jurnal",
            url: route("jurnal.index"),
            icon: MenuBook,
            isActive: url.startsWith("/jurnal"),
            hidden: user.role?.name === "Direktur",
            items: [
                {
                    title: "Jurnal Umum",
                    url: route("jurnal.umum"),
                    isActive: url.startsWith("/jurnal/umum"),
                },
                {
                    title: "Jurnal Kas",
                    url: route("jurnal.kas"),
                    isActive: url.startsWith("/jurnal/kas"),
                },
                {
                    title: "Jurnal Bank",
                    url: route("jurnal.bank"),
                    isActive: url.startsWith("/jurnal/bank"),
                },
            ],
        },
        {
            title: "Buku Besar",
            url: route("buku-besar"),
            icon: TableChart,
            isActive: url.startsWith("/buku-besar"),
        },
        {
            title: "Neraca Saldo",
            url: route("neraca-saldo"),
            icon: Balance,
            isActive: url.startsWith("/neraca-saldo"),
        },
        {
            title: "Periode",
            url: route("periode.index"),
            icon: CalendarMonth,
            isActive: url.startsWith("/periode"),
            hidden: user.role?.name === "Direktur",
        },
        {
            title: "Laporan Keuangan",
            url: route("laporan-keuangan.semua"),
            icon: Description,
            isActive: url.startsWith("/laporan-keuangan"),
            items: [
                {
                    title: "Posisi Keuangan",
                    url: route("laporan-keuangan.posisi-keuangan"),
                    isActive: url.startsWith(
                        "/laporan-keuangan/posisi-keuangan",
                    ),
                },
                {
                    title: "Laba Rugi",
                    url: route("laporan-keuangan.laba-rugi"),
                    isActive: url.startsWith("/laporan-keuangan/laba-rugi"),
                },
                {
                    title: "Arus Kas",
                    url: route("laporan-keuangan.arus-kas"),
                    isActive: url.startsWith("/laporan-keuangan/arus-kas"),
                },
                {
                    title: "Perubahan Ekuitas",
                    url: route("laporan-keuangan.perubahan-ekuitas"),
                    isActive: url.startsWith(
                        "/laporan-keuangan/perubahan-ekuitas",
                    ),
                },
            ],
        },
        {
            title: "Pengguna",
            url: route("pengguna.index"),
            icon: ManageAccounts,
            isActive: url.startsWith("/pengguna"),
            hidden: user.role?.name === "Direktur",
        },
    ].filter(item => !item.hidden);

    return (
        <Sidebar
            className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
            {...props}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#" className="flex items-center gap-3">
                                <div className=" text-sidebar-primary-foreground flex size-8 aspect-square items-center justify-center rounded-lg overflow-hidden">
                                    <img
                                        src="/logo.png"
                                        alt="Logo"
                                        className="h-5 w-auto object-contain transition-transform duration-300 hover:scale-105"
                                    />
                                </div>

                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        Sistem Akuntansi
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        PT. SPR Trada
                                    </span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}
