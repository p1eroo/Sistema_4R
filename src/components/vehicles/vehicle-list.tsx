import { ListToolbar } from "@/components/erp/list-toolbar";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";

import { SectionCard } from "@/components/erp/dashboard-ui";
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
  VehicleForm,
  type VehicleFormValues,
} from "@/components/vehicles/vehicle-form";
import type { ListQuery } from "@/domain/shared/list-query";
import { vehicleDisplayName } from "@/domain/vehicles/types";
import { customerService } from "@/mocks/customers/service";
import { vehicleService } from "@/mocks/vehicles/service";

export function VehicleList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const listQuery: ListQuery = {
    pageSize: 100,
    sortBy: "plate",
  };

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles", listQuery],
    queryFn: () => vehicleService.list(listQuery),
  });

  const customersQuery = useQuery({
    queryKey: ["customers", { pageSize: 100 }],
    queryFn: () =>
      customerService.list({ pageSize: 100, sortBy: "displayName" }),
  });

  const createMutation = useMutation({
    mutationFn: (values: VehicleFormValues) => vehicleService.create(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setCreateOpen(false);
    },
  });

  const ownerById = useMemo(() => {
    const map = new Map<string, string>();
    for (const customer of customersQuery.data?.items ?? []) {
      map.set(customer.id, customer.displayName);
    }
    return map;
  }, [customersQuery.data?.items]);

  const customers = (customersQuery.data?.items ?? []).map((customer) => ({
    id: customer.id,
    displayName: customer.displayName,
  }));

  const rows = useMemo(() => {
    const items = vehiclesQuery.data?.items ?? [];
    const needle = search.trim().toLowerCase();
    if (!needle) {
      return items;
    }

    return items.filter((vehicle) => {
      const owner = ownerById.get(vehicle.customerId) ?? "";
      return (
        vehicle.plate.toLowerCase().includes(needle) ||
        vehicle.brand.toLowerCase().includes(needle) ||
        vehicle.model.toLowerCase().includes(needle) ||
        owner.toLowerCase().includes(needle)
      );
    });
  }, [ownerById, search, vehiclesQuery.data?.items]);

  return (
    <div className="space-y-4">
      <ListToolbar>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por placa, marca o VIN"
            className="border-input bg-white/70 shadow-none pl-9"
            aria-label="Buscar vehículos"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus /> Nuevo vehículo
        </Button>
      </ListToolbar>

      <SectionCard
        title="Vehículos"
        subtitle="Unidades del taller"
        action={
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {rows.length} unidades
          </span>
        }
      >
        {vehiclesQuery.isLoading && <LoadingState variant="table" rows={6} />}
        {vehiclesQuery.isError && (
          <ErrorState onRetry={() => void vehiclesQuery.refetch()} />
        )}
        {vehiclesQuery.isSuccess && rows.length === 0 && (
          <EmptyState
            title="Sin vehículos"
            description="No hay resultados con la búsqueda actual."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreateOpen(true)}
              >
                Registrar vehículo
              </Button>
            }
          />
        )}
        {vehiclesQuery.isSuccess && rows.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Marca / modelo</TableHead>
                <TableHead>Dueño</TableHead>
                <TableHead className="hidden sm:table-cell">Km</TableHead>
                <TableHead className="hidden md:table-cell">Sede</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((vehicle) => (
                <TableRow
                  key={vehicle.id}
                  className="cursor-pointer"
                  onClick={() =>
                    void navigate({
                      to: "/taller/vehiculos/$id",
                      params: { id: vehicle.id },
                    })
                  }
                >
                  <TableCell>
                    <span className="inline-flex rounded-md bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">
                      {vehicle.plate}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-semibold">
                      {vehicleDisplayName(vehicle)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {vehicle.color}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs">
                    {ownerById.get(vehicle.customerId) ?? vehicle.customerId}
                  </TableCell>
                  <TableCell className="hidden text-xs tabular-nums sm:table-cell">
                    {vehicle.odometerKm.toLocaleString("es-PE")}
                  </TableCell>
                  <TableCell className="hidden text-xs md:table-cell">
                    {vehicle.usualBranch?.name ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo vehículo</DialogTitle>
            <DialogDescription>
              Asocia la unidad a un cliente del directorio.
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
          <VehicleForm
            customers={customers}
            submitting={createMutation.isPending}
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
            }}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
