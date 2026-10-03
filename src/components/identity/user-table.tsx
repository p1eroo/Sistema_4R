import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { ListToolbar, ListToolbarSearch } from "@/components/erp/list-toolbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { USER_STATUS_LABELS, UserStatus } from "@/domain/identity/types";
import { asEntityId } from "@/domain/shared";
import { branchService } from "@/mocks/branches/service";
import { identityService } from "@/mocks/identity/service";

const USER_STATUSES = Object.values(UserStatus);

export function UserList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    roleId: "",
    branchId: "",
    status: UserStatus.Active as UserStatus,
  });

  const usersQuery = useQuery({
    queryKey: ["identity", "users"],
    queryFn: () => identityService.listUsers({ pageSize: 100 }),
  });
  const rolesQuery = useQuery({
    queryKey: ["identity", "roles"],
    queryFn: () => identityService.listRoles(),
  });
  const branchesQuery = useQuery({
    queryKey: ["branches", "list"],
    queryFn: () => branchService.list({ pageSize: 100 }),
  });

  const roleMap = useMemo(
    () => new Map((rolesQuery.data ?? []).map((role) => [role.id, role])),
    [rolesQuery.data],
  );
  const branchMap = useMemo(
    () =>
      new Map(
        (branchesQuery.data?.items ?? []).map((branch) => [
          branch.id,
          branch.name,
        ]),
      ),
    [branchesQuery.data],
  );

  const rows = useMemo(() => {
    const items = usersQuery.data?.items ?? [];
    const term = search.trim().toLowerCase();
    if (!term) {
      return items;
    }
    return items.filter((user) =>
      `${user.fullName} ${user.email}`.toLowerCase().includes(term),
    );
  }, [usersQuery.data, search]);

  const createMutation = useMutation({
    mutationFn: () =>
      identityService.createUser({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
        roleIds: form.roleId ? [asEntityId(form.roleId)] : [],
        branchIds: form.branchId ? [asEntityId(form.branchId)] : [],
        status: form.status,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["identity", "users"] });
      setOpen(false);
      setForm({
        fullName: "",
        email: "",
        phone: "",
        roleId: "",
        branchId: "",
        status: UserStatus.Active,
      });
    },
  });

  return (
    <div className="space-y-4">
      <ListToolbar>
        <ListToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre o correo"
          ariaLabel="Buscar usuarios"
        />
        <Button onClick={() => setOpen(true)}>
          <Plus /> Nuevo usuario
        </Button>
      </ListToolbar>

      <SectionCard title="Usuarios" subtitle="Equipo con acceso al sistema">
        {usersQuery.isLoading && <LoadingState variant="table" rows={6} />}
        {usersQuery.isError && (
          <ErrorState onRetry={() => void usersQuery.refetch()} />
        )}
        {usersQuery.isSuccess && rows.length === 0 && (
          <EmptyState
            title="Sin usuarios"
            description="No hay usuarios con los filtros actuales."
          />
        )}
        {usersQuery.isSuccess && rows.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead className="hidden md:table-cell">Roles</TableHead>
                <TableHead className="hidden lg:table-cell">Sedes</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Link
                      to="/usuarios/$id"
                      params={{ id: user.id }}
                      className="truncate text-xs font-semibold text-foreground hover:underline"
                    >
                      {user.fullName}
                    </Link>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {user.email}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs">
                      {user.roleIds
                        .map((id) => roleMap.get(id)?.name ?? id)
                        .join(", ") || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs">
                      {user.branchIds
                        .map((id) => branchMap.get(id) ?? id)
                        .join(", ") || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      variant={
                        user.status === UserStatus.Active
                          ? "success"
                          : "neutral"
                      }
                    >
                      {USER_STATUS_LABELS[user.status]}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>
              Alta simple de usuario del prototipo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nombre completo"
              value={form.fullName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  fullName: event.target.value,
                }))
              }
            />
            <Input
              placeholder="correo@4ruedas.pe"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
            <Input
              placeholder="Teléfono"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
            />
            <Select
              value={form.roleId}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, roleId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                {(rolesQuery.data ?? []).map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={form.branchId}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, branchId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sede" />
              </SelectTrigger>
              <SelectContent>
                {(branchesQuery.data?.items ?? []).map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={form.status}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  status: value as UserStatus,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {USER_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {USER_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={
                createMutation.isPending ||
                !form.fullName.trim() ||
                !form.email.trim()
              }
              onClick={() => createMutation.mutate()}
            >
              Crear usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
