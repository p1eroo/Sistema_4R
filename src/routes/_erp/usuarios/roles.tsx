import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { SectionCard } from "@/components/erp/dashboard-ui";
import { ModulePage } from "@/components/erp/module-page";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PERMISSION_LABELS } from "@/domain/identity/types";
import { identityService } from "@/mocks/identity/service";

export const Route = createFileRoute("/_erp/usuarios/roles")({
  head: () => ({
    meta: [{ title: "Roles | 4 RUEDAS" }],
  }),
  component: RolesPage,
});

function RolesPage() {
  const rolesQuery = useQuery({
    queryKey: ["identity", "roles"],
    queryFn: () => identityService.listRoles(),
  });

  const roles = useMemo(() => rolesQuery.data ?? [], [rolesQuery.data]);

  return (
    <ModulePage title="Roles" breadcrumb="Inicio / Usuarios y sedes / Roles">
      <SectionCard
        title="Roles"
        subtitle="Resumen de permisos; edítalos en Permisos"
      >
        {rolesQuery.isLoading && <LoadingState variant="table" rows={5} />}
        {rolesQuery.isError && (
          <ErrorState onRetry={() => void rolesQuery.refetch()} />
        )}
        {rolesQuery.isSuccess && roles.length === 0 && (
          <EmptyState title="Sin roles" />
        )}
        {rolesQuery.isSuccess && roles.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rol</TableHead>
                <TableHead className="hidden md:table-cell">Código</TableHead>
                <TableHead>Permisos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <p className="text-xs font-semibold">{role.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {role.description ?? "—"}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs">
                    {role.code}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {role.permissions.length} permisos ·{" "}
                      {role.permissions
                        .slice(0, 2)
                        .map((permission) => PERMISSION_LABELS[permission])
                        .join(", ")}
                      {role.permissions.length > 2 ? "…" : ""}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </ModulePage>
  );
}
