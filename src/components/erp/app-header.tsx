import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  LogOut,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { useActiveBranch } from "@/components/erp/branch-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { asEntityId } from "@/domain/shared";
import { resolveGlobalSearch } from "@/lib/global-search";
import { cn } from "@/lib/utils";
import { identityService } from "@/mocks/identity/service";
import { notificationService } from "@/mocks/notifications/service";

const CURRENT_USER_ID = "USR-0001";

function userInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function primaryRoleLabel(
  roleIds: readonly string[],
  roles: Awaited<ReturnType<typeof identityService.listRoles>>,
): string {
  const match = roles.find((role) => roleIds.includes(role.id));
  return match?.name ?? "Usuario";
}

export function AppHeader() {
  const [search, setSearch] = useState("");
  const [searchPending, setSearchPending] = useState(false);
  const navigate = useNavigate();

  const { branches, activeBranch, setActiveBranchId } = useActiveBranch();

  const userQuery = useQuery({
    queryKey: ["identity", "users", CURRENT_USER_ID],
    queryFn: () => identityService.getUserById(asEntityId(CURRENT_USER_ID)),
  });
  const rolesQuery = useQuery({
    queryKey: ["identity", "roles"],
    queryFn: () => identityService.listRoles(),
  });
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.list(),
  });

  const user = userQuery.data;
  const roleLabel = user
    ? primaryRoleLabel(user.roleIds, rolesQuery.data ?? [])
    : "Administrador";
  const branchLabel = activeBranch?.name ?? "Sede La Molina";
  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.length;

  async function submitSearch() {
    const term = search.trim();
    if (!term || searchPending) {
      return;
    }
    setSearchPending(true);
    try {
      const hit = await resolveGlobalSearch(term);
      if (!hit) {
        toast.message("Sin resultados", {
          description: "Prueba con una placa, código de OT o cliente.",
        });
        return;
      }
      await navigate({ to: hit.href });
      setSearch("");
    } finally {
      setSearchPending(false);
    }
  }

  return (
    <header className="glass-bar sticky top-0 z-20 flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <SidebarTrigger
          className="size-9 shrink-0 border border-border md:hidden"
          aria-label="Abrir navegación"
        />
        <label className="relative hidden min-w-0 flex-1 sm:block lg:max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void submitSearch();
              }
            }}
            placeholder="Buscar orden, placa o cliente"
            className="w-full border-input bg-card pl-9 shadow-none"
            aria-label="Búsqueda global"
            disabled={searchPending}
          />
        </label>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="hidden h-9 min-w-40 shrink-0 justify-between gap-2 rounded-md border-input bg-card shadow-none hover:bg-accent md:flex"
            >
              <span className="truncate">{branchLabel}</span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <div className="px-2.5 pb-1.5 pt-1">
              <p className="text-xs font-semibold text-foreground">
                Cambiar sede
              </p>
              <p className="text-[11px] text-muted-foreground">
                Selecciona dónde operar
              </p>
            </div>
            <DropdownMenuSeparator />
            {branches.map((branch) => {
              const active = branch.id === activeBranch?.id;

              return (
                <DropdownMenuItem
                  key={branch.id}
                  onSelect={() => setActiveBranchId(branch.id)}
                  className={cn(
                    "pr-2.5",
                    active && "bg-accent/60 font-medium text-accent-foreground",
                  )}
                >
                  <span className="truncate">{branch.name}</span>
                  {active ? (
                    <span className="ml-auto text-[10px] font-medium text-primary">
                      Activa
                    </span>
                  ) : null}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notificaciones"
            >
              <Bell />
              {unreadCount > 0 ? (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-card" />
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <DropdownMenuItem
                disabled
                className="text-xs text-muted-foreground"
              >
                No hay notificaciones pendientes.
              </DropdownMenuItem>
            ) : (
              notifications.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  className="h-auto min-h-9 items-start py-2"
                  asChild
                >
                  <Link to={item.href}>
                    <span className="text-xs">
                      <strong>{item.title}:</strong> {item.body}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:inline-flex"
          aria-label="Ayuda"
        >
          <CircleHelp />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-10 gap-2 rounded-lg px-1.5 hover:bg-accent sm:px-2"
            >
              <span className="grid size-8 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                {user ? userInitials(user.fullName) : "CM"}
              </span>
              <span className="hidden min-w-0 text-left xl:block">
                <span className="block truncate text-xs font-semibold">
                  {user?.fullName ?? "Carlos Mendoza"}
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  {roleLabel}
                </span>
              </span>
              <ChevronDown className="hidden size-4 text-muted-foreground xl:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="flex items-center gap-3 rounded-md bg-muted/60 px-2.5 py-2">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                {user ? userInitials(user.fullName) : "CM"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {user?.fullName ?? "Carlos Mendoza"}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {roleLabel}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {branchLabel}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/usuarios/$id" params={{ id: CURRENT_USER_ID }}>
                <UserRound /> Mi perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/configuracion">
                <Settings /> Preferencias
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                toast.message("Notificaciones", {
                  description:
                    unreadCount > 0
                      ? `Tienes ${unreadCount} notificaciones pendientes.`
                      : "No hay notificaciones pendientes.",
                })
              }
            >
              <Bell /> Notificaciones
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <LogOut /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
