import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil } from "lucide-react";

import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import { ModulePage } from "@/components/erp/module-page";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Branch } from "@/domain/branches";
import { branchService } from "@/mocks/branches/service";

export const Route = createFileRoute("/_erp/usuarios/sedes")({
  head: () => ({
    meta: [{ title: "Sedes | 4 RUEDAS" }],
  }),
  component: SedesPage,
});

type BranchForm = {
  name: string;
  address: string;
  phone: string;
  capacity: string;
  isDefault: boolean;
};

function toForm(branch: Branch): BranchForm {
  return {
    name: branch.name,
    address: branch.address,
    phone: branch.phone,
    capacity: String(branch.capacity),
    isDefault: branch.isDefault,
  };
}

function SedesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchForm | null>(null);

  const branchesQuery = useQuery({
    queryKey: ["branches", "list"],
    queryFn: () => branchService.list({ pageSize: 100 }),
  });

  const branches = useMemo(
    () => branchesQuery.data?.items ?? [],
    [branchesQuery.data],
  );

  const updateMutation = useMutation({
    mutationFn: (payload: { id: Branch["id"]; form: BranchForm }) =>
      branchService.update(payload.id, {
        name: payload.form.name.trim(),
        address: payload.form.address.trim(),
        phone: payload.form.phone.trim(),
        capacity: Number(payload.form.capacity) || 0,
        isDefault: payload.form.isDefault,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["branches"] });
      setEditing(null);
      setForm(null);
    },
  });

  return (
    <ModulePage title="Sedes" breadcrumb="Inicio / Usuarios y sedes / Sedes">
      <SectionCard title="Sedes" subtitle="Datos editables de las sedes">
        {branchesQuery.isLoading && <LoadingState variant="table" rows={3} />}
        {branchesQuery.isError && (
          <ErrorState onRetry={() => void branchesQuery.refetch()} />
        )}
        {branchesQuery.isSuccess && branches.length === 0 && (
          <EmptyState title="Sin sedes" />
        )}
        {branchesQuery.isSuccess && branches.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sede</TableHead>
                <TableHead className="hidden md:table-cell">
                  Dirección
                </TableHead>
                <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell>
                    <p className="text-xs font-semibold">{branch.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {branch.slug}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs">
                    {branch.address}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs">
                    {branch.phone}
                  </TableCell>
                  <TableCell className="text-xs tabular-nums">
                    {branch.capacity}
                  </TableCell>
                  <TableCell>
                    {branch.isDefault ? (
                      <StatusBadge variant="info">Predeterminada</StatusBadge>
                    ) : (
                      <StatusBadge variant="neutral">Activa</StatusBadge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar ${branch.name}`}
                      onClick={() => {
                        setEditing(branch);
                        setForm(toForm(branch));
                      }}
                    >
                      <Pencil />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            setForm(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar sede</DialogTitle>
            <DialogDescription>
              {editing?.slug ?? ""} · los cambios son locales del prototipo.
            </DialogDescription>
          </DialogHeader>
          {form && (
            <div className="space-y-3">
              <Input
                placeholder="Nombre"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
              <Input
                placeholder="Dirección"
                value={form.address}
                onChange={(event) =>
                  setForm({ ...form, address: event.target.value })
                }
              />
              <Input
                placeholder="Teléfono"
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Capacidad"
                value={form.capacity}
                onChange={(event) =>
                  setForm({ ...form, capacity: event.target.value })
                }
              />
              <label className="flex items-center gap-2 text-xs">
                <Checkbox
                  checked={form.isDefault}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, isDefault: checked === true })
                  }
                />
                Sede por defecto
              </label>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setEditing(null);
                setForm(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              disabled={updateMutation.isPending || !form}
              onClick={() => {
                if (editing && form) {
                  updateMutation.mutate({ id: editing.id, form });
                }
              }}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModulePage>
  );
}
