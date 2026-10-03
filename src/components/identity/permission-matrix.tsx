import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SectionCard } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PERMISSIONS,
  PERMISSION_LABELS,
  type Permission,
} from "@/domain/identity/types";
import { asEntityId } from "@/domain/shared";
import { identityService } from "@/mocks/identity/service";

export function PermissionMatrix() {
  const queryClient = useQueryClient();

  const rolesQuery = useQuery({
    queryKey: ["identity", "roles"],
    queryFn: () => identityService.listRoles(),
  });

  const roles = rolesQuery.data ?? [];

  const permissionMutation = useMutation({
    mutationFn: ({
      roleId,
      permission,
      enabled,
    }: {
      roleId: string;
      permission: Permission;
      enabled: boolean;
    }) =>
      identityService.setRolePermission(
        asEntityId(roleId),
        permission,
        enabled,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["identity", "roles"] });
    },
  });

  const roleColumns = useMemo(
    () => roles.filter((role) => role.code !== "admin"),
    [roles],
  );

  return (
    <SectionCard
      title="Matriz de permisos"
      subtitle="Qué puede hacer cada rol en el prototipo"
    >
      {rolesQuery.isLoading && <LoadingState variant="table" rows={8} />}
      {rolesQuery.isError && (
        <ErrorState onRetry={() => void rolesQuery.refetch()} />
      )}
      {rolesQuery.isSuccess && roles.length === 0 && (
        <EmptyState
          title="Sin roles"
          description="No hay roles configurados en el mock."
        />
      )}
      {rolesQuery.isSuccess && roles.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-48">Permiso</TableHead>
                {roleColumns.map((role) => (
                  <TableHead key={role.id} className="min-w-28 text-center">
                    <span className="text-xs font-semibold">{role.name}</span>
                  </TableHead>
                ))}
                <TableHead className="min-w-28 text-center text-muted-foreground">
                  Administrador
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERMISSIONS.map((permission) => (
                <TableRow key={permission}>
                  <TableCell className="text-xs">
                    {PERMISSION_LABELS[permission]}
                    <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                      {permission}
                    </span>
                  </TableCell>
                  {roleColumns.map((role) => {
                    const enabled = role.permissions.includes(permission);
                    const pending =
                      permissionMutation.isPending &&
                      permissionMutation.variables?.roleId === role.id &&
                      permissionMutation.variables?.permission === permission;

                    return (
                      <TableCell key={role.id} className="text-center">
                        <Switch
                          checked={enabled}
                          disabled={pending}
                          aria-label={`${role.name}: ${PERMISSION_LABELS[permission]}`}
                          onCheckedChange={(checked) =>
                            permissionMutation.mutate({
                              roleId: role.id,
                              permission,
                              enabled: checked,
                            })
                          }
                        />
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center">
                    <Switch
                      checked
                      disabled
                      aria-label="Administrador: acceso total"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SectionCard>
  );
}
