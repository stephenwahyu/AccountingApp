import * as React from "react"
import {
  Command,
} from "lucide-react"
import { usePage } from "@inertiajs/react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { AccountTree, Balance, CalendarMonth, Dashboard, Description, ManageAccounts, MenuBook, TableChart } from "@material-symbols-svg/react-rounded"

export function AppSidebar({
  ...props
}) {
  const { auth } = usePage().props
  const { user } = auth

  const navMain = [
    {
      title: "Dashboard",
      url: route('dashboard'),
      icon: Dashboard,
    },
    {
      title: "Bagan Perkiraan",
      url: route('bagan-perkiraan.index'),
      icon: AccountTree,
      items: [
        {
          title: "Akun",
          url: route('bagan-perkiraan.akun'),
        },
        {
          title: "Kategori Akun",
          url: route('bagan-perkiraan.kategori-akun'),
        },
        {
          title: "Tipe Akun",
          url: route('bagan-perkiraan.tipe-akun'),
        },
      ],
    },
    {
      title: "Jurnal",
      url: route('jurnal.index'),
      icon: MenuBook,
      items: [
        {
          title: "Jurnal Umum",
          url: route('jurnal.umum'),
        },
        {
          title: "Jurnal Kas",
          url: route('jurnal.kas'),
        },
        {
          title: "Jurnal Bank",
          url: route('jurnal.bank'),
        },
      ],
    },
    {
      title: "Buku Besar",
      url: route('buku-besar'),
      icon: TableChart,
    },
    {
      title: "Neraca Saldo",
      url: route('neraca-saldo'),
      icon: Balance,
    },
    {
      title: "Periode",
      url: route('periode.index'),
      icon: CalendarMonth,
    },
    {
      title: "Laporan Keuangan",
      url: route('laporan-keuangan.posisi-keuangan'),
      icon: Description,
      items: [
        {
          title: "Posisi Keuangan",
          url: route('laporan-keuangan.posisi-keuangan'),
        },
        {
          title: "Laba Rugi",
          url: route('laporan-keuangan.laba-rugi'),
        },
        {
          title: "Arus Kas",
          url: route('laporan-keuangan.arus-kas'),
        },
        {
          title: "Perubahan Ekuitas",
          url: route('laporan-keuangan.perubahan-ekuitas'),
        },
      ],
    },
    {
      title: "Pengguna",
      url: route('pengguna.index'),
      icon: ManageAccounts,
    },
  ]

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div
                  className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Sistem Akuntansi</span>
                  <span className="truncate text-xs">PT. SPR Trada</span>
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
