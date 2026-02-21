import React, { useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { usePage } from "@inertiajs/react";

export function AppLayouts({ children, breadcrumbs = [] }) {
  const { flash } = usePage().props;

  useEffect(() => {
    if (flash.success) {
      toast.success(flash.success);
    }
    if (flash.error) {
      toast.error(flash.error, {
        duration: 5000,
      });
    }
  }, [flash]);

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader breadcrumbs={breadcrumbs} />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
      <Toaster position="top-right" closeButton richColors />
    </div>
  );
}