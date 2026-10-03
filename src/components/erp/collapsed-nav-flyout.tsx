import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

import { isNavPathActive, type NavLeaf } from "@/components/erp/nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const CLOSE_DELAY_MS = 140;

export function CollapsedNavFlyout({
  label,
  icon: Icon,
  items,
  activePath,
  isActive,
  onNavigate,
}: {
  label: string;
  icon: LucideIcon;
  items: readonly NavLeaf[];
  activePath: string;
  isActive: boolean;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openMenu = () => {
    cancelClose();
    setOpen(true);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  useEffect(() => cancelClose, []);

  return (
    <SidebarMenuItem>
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            isActive={isActive}
            aria-haspopup="menu"
            aria-expanded={open}
            onPointerEnter={openMenu}
            onPointerLeave={scheduleClose}
            className="h-10"
          >
            <Icon />
            <span>{label}</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={8}
          collisionPadding={8}
          onPointerEnter={openMenu}
          onPointerLeave={scheduleClose}
          onOpenAutoFocus={(event: Event) => event.preventDefault()}
          className="min-w-56 rounded-lg border-border/70 shadow-lg"
        >
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {items.map((item) => {
            const active = isNavPathActive(activePath, item.path);

            return (
              <DropdownMenuItem key={item.path} asChild>
                <Link
                  to={item.path}
                  onClick={onNavigate}
                  data-active={active || undefined}
                  className={cn(
                    "flex w-full items-center justify-between gap-2",
                    active && "bg-accent font-medium text-accent-foreground",
                  )}
                >
                  <span className="truncate">{item.label}</span>
                  {active && (
                    <span
                      className="size-1.5 shrink-0 rounded-full bg-primary"
                      aria-hidden
                    />
                  )}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
