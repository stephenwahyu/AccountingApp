import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react"

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

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Dashboard,
      isActive: true,
    },
    {
      title: "Bagan Perkiraan",
      url: "/bagan-perkiraan",
      icon: AccountTree,
      isActive: false,
      items: [
        {
          title: "Akun",
          url: "#",
        },
        {
          title: "Kategori Akun",
          url: "#",
        },
        {
          title: "Jenis Akun",
          url: "#",
        },
      ],
    },
    {
      title: "Jurnal",
      url: "/jurnal",
      icon: MenuBook,
      isActive: false,
      items: [
        {
          title: "Jurnal Umum",
          url: "/jurnal/umum",
        },
        {
          title: "Jurnal Kas",
          url: "/jurnal/kas",
        },
        {
          title: "Jurnal Bank",
          url: "/jurnal/bank",
        },
      ],
    },
    {
      title: "Buku Besar",
      url: "/buku-besar",
      icon: TableChart,
      isActive: true,
    },
    {
      title: "Neraca Saldo",
      url: "/neraca-saldo",
      icon: Balance,
      isActive: true,
    },
    {
      title: "Periode",
      url: "/periode",
      icon: CalendarMonth,
      isActive: true,
    },
    {
      title: "Laporan Keuangan",
      url: "/laporan-keuangan/posisi-keuangan",
      icon: Description,
      isActive: false,
      items: [
        {
          title: "Posisi Keuangan",
          url: "/laporan-keuangan/posisi-keuangan",
        },
        {
          title: "Laba Rugi",
          url: "/laporan-keuangan/laba-rugi",
        },
        {
          title: "Arus Kas",
          url: "/laporan-keuangan/arus-kas",
        },
        {
          title: "Perubahan Ekuitas",
          url: "/laporan-keuangan/perubahan-ekuitas",
        },
      ],
    },
    
    {
      title: "Pengguna",
      url: "/pengguna",
      icon: ManageAccounts,
      isActive: true,
    },
    
  ],
}

export function AppSidebar({
  ...props
}) {
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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
