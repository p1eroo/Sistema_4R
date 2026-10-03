import { ListToolbar } from "@/components/erp/list-toolbar";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";

import { SupplierForm } from "@/components/suppliers/supplier-form";
import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  PAYMENT_TERMS_LABELS,
  SUPPLIER_STATUS_LABELS,
  SupplierStatus,
  type SupplierCreateValues,
} from "@/domain/suppliers";
import { supplierService } from "@/mocks/suppliers/service";

export function SupplierList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const listQuery = {
    pageSize: 100,
    sortBy: "businessName",
    ...(search.trim() ? { search: search.trim() } : {}),
  };

  const suppliersQuery = useQuery({
    queryKey: ["suppliers", listQuery],
    queryFn: () => supplierService.list(listQuery),
  });

  const rows = suppliersQuery.data?.items ?? [];

  const createMutation = useMutation({
    mutationFn: (values: SupplierCreateValues) =>
      supplierService.create(values),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      window.setTimeout(() => {
        setOpen(false);
        void navigate({
          to: "/proveedores/$id",
          params: { id: created.id },
        });
      }, 0);
    },
  });

  return (
    <div className="space-y-4">
      <ListToolbar>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por RUC o nombre"
            className="pl-9"
            aria-label="Buscar proveedores"
          />
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus /> Nuevo proveedor
        </Button>
      </ListToolbar>

      <SectionCard
        title="Proveedores"
        subtitle="Directorio para compras y órdenes"
        action={
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {rows.length} registros
          </span>
        }
      >
        {suppliersQuery.isLoading && <LoadingState variant="table" rows={6} />}
        {suppliersQuery.isError && (
          <ErrorState onRetry={() => void suppliersQuery.refetch()} />
        )}
        {suppliersQuery.isSuccess && rows.length === 0 && (
          <EmptyState
            title="Sin proveedores"
            description="No hay resultados con la búsqueda actual."
            action={
              <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                Registrar proveedor
              </Button>
            }
          />
        )}
        {suppliersQuery.isSuccess && rows.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>RUC</TableHead>
                <TableHead className="hidden sm:table-cell">Contacto</TableHead>
                <TableHead className="hidden md:table-cell">Pago</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((supplier) => (
                <TableRow
                  key={supplier.id}
                  className="cursor-pointer"
                  onClick={() =>
                    void navigate({
                      to: "/proveedores/$id",
                      params: { id: supplier.id },
                    })
                  }
                >
                  <TableCell>
                    <p className="truncate text-xs font-semibold">
                      {supplier.tradeName ?? supplier.businessName}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {supplier.businessName}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs tabular-nums">
                    {supplier.ruc}
                  </TableCell>
                  <TableCell className="hidden text-xs sm:table-cell">
                    {supplier.contact?.name ?? "—"}
                  </TableCell>
                  <TableCell className="hidden text-xs md:table-cell">
                    {PAYMENT_TERMS_LABELS[supplier.paymentTerms]}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      variant={
                        supplier.status === SupplierStatus.Active
                          ? "success"
                          : "neutral"
                      }
                    >
                      {SUPPLIER_STATUS_LABELS[supplier.status]}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            createMutation.reset();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo proveedor</DialogTitle>
            <DialogDescription>
              RUC, contacto y condición de pago para compras.
            </DialogDescription>
          </DialogHeader>
          {createMutation.isError && (
            <ErrorState
              title="No se pudo registrar"
              message={
                createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "Revisa los datos e inténtalo de nuevo."
              }
            />
          )}
          <SupplierForm
            submitting={createMutation.isPending}
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
            }}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
