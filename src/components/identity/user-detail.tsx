import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { Button } from "@/components/ui/button";
import { USER_STATUS_LABELS, UserStatus } from "@/domain/identity/types";
import { asEntityId } from "@/domain/shared";
import { can } from "@/lib/can";
import { branchService } from "@/mocks/branches/service";
import { identityService } from "@/mocks/identity/service";

function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserDetail({ userId }: { userId: string }) {
  const id = asEntityId(userId);

  const userQuery = useQuery({
    queryKey: ["identity", "users", userId],
    queryFn: () => identityService.getUserById(id),
  });
  const rolesQuery = useQuery({
    queryKey: ["identity", "roles"],
    queryFn: () => identityService.listRoles(),
  });
  const branchesQuery = useQuery({
    queryKey: ["branches", "list"],
    queryFn: () => branchService.list({ pageSize: 100 }),
  });

  const user = userQuery.data;

  const roleNames = useMemo(() => {
    if (!user) {
      return [];
    }
    const roles = rolesQuery.data ?? [];
    return user.roleIds
      .map((roleId) => roles.find((role) => role.id === roleId)?.name ?? roleId)
      .filter(Boolean);
  }, [rolesQuery.data, user]);

  const branchNames = useMemo(() => {
    if (!user) {
      return [];
    }
    const map = new Map(
      (branchesQuery.data?.items ?? []).map((branch) => [
        branch.id,
        branch.name,
      ]),
    );
    return user.branchIds.map((branchId) => map.get(branchId) ?? branchId);
  }, [branchesQuery.data, user]);

  const samplePermissions = useMemo(() => {
    const roles = rolesQuery.data ?? [];
    if (!user || roles.length === 0) {
      return [];
    }
    const checks = [
      "users.manage",
      "settings.manage",
      "workshop.manage",
      "pos.sell",
    ] as const;
    return checks.map((permission) => ({
      permission,
      allowed: can(user, permission, roles),
    }));
  }, [rolesQuery.data, user]);

  if (userQuery.isLoading || rolesQuery.isLoading) {
    return <LoadingState />;
  }

  if (userQuery.isError) {
    return <ErrorState onRetry={() => void userQuery.refetch()} />;
  }

  if (!user) {
    return (
      <EmptyState
        title="Usuario no encontrado"
        description="El identificador no coincide con el mock de identidad."
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to="/usuarios">
              <ArrowLeft /> Volver al listado
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
        <Link to="/usuarios">
          <ArrowLeft /> Usuarios
        </Link>
      </Button>

      <SectionCard title="Perfil" subtitle="Datos del usuario en el ERP">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
            {initials(user.fullName)}
          </span>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-lg font-semibold">{user.fullName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.phone ? (
                <p className="text-sm text-muted-foreground">{user.phone}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge
                variant={
                  user.status === UserStatus.Active ? "success" : "neutral"
                }
              >
                {USER_STATUS_LABELS[user.status]}
              </StatusBadge>
              {roleNames.map((name) => (
                <StatusBadge key={name} variant="info">
                  {name}
                </StatusBadge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Sedes: {branchNames.join(", ") || "—"}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Permisos efectivos (muestra)"
        subtitle="Calculados con can() sobre los roles actuales"
      >
        <ul className="space-y-2">
          {samplePermissions.map(({ permission, allowed }) => (
            <li
              key={permission}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span className="font-mono text-muted-foreground">
                {permission}
              </span>
              <StatusBadge variant={allowed ? "success" : "neutral"}>
                {allowed ? "Permitido" : "Denegado"}
              </StatusBadge>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/usuarios/permisos">Ver matriz completa</Link>
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
