import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

import { CollapsedNavFlyout } from "@/components/erp/collapsed-nav-flyout";
import { CashSessionPanel } from "@/components/pos/cash-session-panel";
import { useCashSession } from "@/components/pos/use-cash-session";
import { formatCashShiftLabel } from "@/components/pos/cash-session-format";
import { CashSessionStatus } from "@/domain/cash";

import {
  isNavPathActive,
  navGroups,
  type NavGroup,
} from "@/components/erp/nav";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

function BrandMark() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <div
      className={cn(
        "flex h-16 w-full items-center justify-center",
        collapsed ? "px-0" : "px-2",
      )}
    >
      <img
        src="/4ruedas.png"
        alt="4 RUEDAS Mecánica Automotriz"
        className={cn(
          "shrink-0 object-contain",
          collapsed ? "h-auto w-8" : "h-12 w-auto",
        )}
      />
    </div>
  );
}

function groupContainsPath(group: NavGroup, pathname: string): boolean {
  if (group.path) {
    return isNavPathActive(pathname, group.path);
  }

  return Boolean(
    group.children?.some((child) => isNavPathActive(pathname, child.path)),
  );
}

function MenuEntry({ group }: { group: NavGroup }) {
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const containsActive = groupContainsPath(group, pathname);
  const [open, setOpen] = useState(group.label === "Taller" || containsActive);

  useEffect(() => {
    if (containsActive) {
      setOpen(true);
    }
  }, [containsActive]);

  if (!group.children && group.path) {
    const active = isNavPathActive(pathname, group.path);

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={group.label}
          isActive={active}
          asChild
          className="h-10 rounded-lg font-medium data-[active=true]:bg-primary data-[active=true]:font-semibold data-[active=true]:text-primary-foreground data-[active=true]:shadow-[0_8px_18px_-10px_var(--primary)] data-[active=true]:hover:bg-primary/90 data-[active=true]:hover:text-primary-foreground"
        >
          <Link to={group.path} onClick={() => setOpenMobile(false)}>
            <group.icon />
            <span>{group.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  if (collapsed) {
    return (
      <CollapsedNavFlyout
        label={group.label}
        icon={group.icon}
        items={group.children ?? []}
        activePath={pathname}
        isActive={containsActive}
        onNavigate={() => setOpenMobile(false)}
      />
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={group.label}
            className="h-10 rounded-lg font-medium"
          >
            <group.icon />
            <span>{group.label}</span>
            <ChevronDown className="ml-auto transition-transform data-[state=open]:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {group.children?.map((child) => {
              const active = isNavPathActive(pathname, child.path);

              return (
                <SidebarMenuSubItem key={child.path}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={active}
                    className="rounded-lg data-[active=true]:font-semibold data-[active=true]:text-primary"
                  >
                    <Link to={child.path} onClick={() => setOpenMobile(false)}>
                      <span>{child.label}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [cashPanelOpen, setCashPanelOpen] = useState(false);
  const cashQuery = useCashSession();
  const cashSession = cashQuery.data;
  const cashIsOpen = cashSession?.status === CashSessionStatus.Open;

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="px-3 py-0 group-data-[collapsible=icon]:px-0">
        <BrandMark />
      </SidebarHeader>
      <SidebarContent className="px-2 py-3 group-data-[collapsible=icon]:px-0">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase">
            Operación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navGroups.map((group) => (
                <MenuEntry key={group.label} group={group} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 group-data-[collapsible=icon]:p-1.5">
        <button
          type="button"
          className={cn(
            "flex w-full items-center overflow-hidden rounded-xl border border-border bg-white/80 text-left shadow-sm transition-colors hover:bg-white",
            collapsed ? "justify-center gap-0 p-2.5" : "gap-3 px-3 py-2.5",
          )}
          onClick={() => setCashPanelOpen(true)}
        >
          <span
            className={cn(
              "size-2.5 shrink-0 rounded-full",
              cashIsOpen
                ? "bg-success ring-4 ring-success/20"
                : "bg-muted-foreground/50 ring-4 ring-muted-foreground/15",
            )}
            aria-hidden
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">
                {cashIsOpen ? "Caja abierta" : "Caja cerrada"}
              </p>
              <p className="truncate text-[11px] text-sidebar-foreground/55">
                {cashIsOpen && cashSession
                  ? formatCashShiftLabel(cashSession.openedAt)
                  : "Abre turno para vender"}
              </p>
            </div>
          )}
        </button>
        <CashSessionPanel
          open={cashPanelOpen}
          onOpenChange={setCashPanelOpen}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
