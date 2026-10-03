import type { ReactNode } from "react";

import { BranchProvider } from "@/components/erp/branch-context";
import { PageChromeProvider } from "@/components/erp/page-chrome";
import { Toaster } from "@/components/ui/sonner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <PageChromeProvider>
      <BranchProvider>
        <SidebarProvider
          className="w-full"
          style={
            {
              "--sidebar-width": "16.5rem",
              "--sidebar-width-icon": "4.5rem",
            } as React.CSSProperties
          }
        >
          <AppSidebar />
          <SidebarInset className="min-w-0 overflow-x-clip">
            <AppHeader />
            {children}
          </SidebarInset>
        </SidebarProvider>
        <Toaster richColors closeButton position="top-right" />
      </BranchProvider>
    </PageChromeProvider>
  );
}
