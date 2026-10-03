import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";

import {
  CustomerForm,
  type CustomerFormValues,
} from "@/components/customers/customer-form";
import {
  CUSTOMER_BRANCHES,
  customerStatusLabel,
  customerStatusVariant,
  customerTypeLabel,
} from "@/components/customers/customer-list-filters";
import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { useRegisterPageChrome } from "@/components/erp/use-page-chrome";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { Customer } from "@/domain/customers/types";
import { asEntityId } from "@/domain/shared";
import { vehicleDisplayName } from "@/domain/vehicles/types";
import { customerService } from "@/mocks/customers/service";
import { vehicleService } from "@/mocks/vehicles/service";

function toFormValues(customer: Customer): Partial<CustomerFormValues> {
  return {
    type: customer.type,
    documentType: customer.documentType,
    documentNumber: customer.documentNumber,
    phones: customer.phones.map((phone) => ({ ...phone })),
    ...(customer.firstName !== undefined
      ? { firstName: customer.firstName }
      : {}),
    ...(customer.lastName !== undefined ? { lastName: customer.lastName } : {}),
    ...(customer.businessName !== undefined
      ? { businessName: customer.businessName }
      : {}),
    ...(customer.email !== undefined ? { email: customer.email } : {}),
    ...(customer.address !== undefined ? { address: customer.address } : {}),
    ...(customer.preferredBranch !== undefined
      ? { preferredBranch: customer.preferredBranch }
      : {}),
    ...(customer.notes !== undefined ? { notes: customer.notes } : {}),
  };
}

export function CustomerDetail({ customerId }: { customerId: string }) {
  const id = asEntityId(customerId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);

  const customerQuery = useQuery({
    queryKey: ["customers", id],
    queryFn: () => customerService.getById(id),
  });

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles", "customer", id],
    queryFn: () => vehicleService.listByCustomer(id, { pageSize: 50 }),
    enabled: customerQuery.data !== undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (values: CustomerFormValues) =>
      customerService.update(id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      setEditOpen(false);
    },
  });

  const loaded = customerQuery.data;
  useRegisterPageChrome({
    title: loaded?.displayName ?? "Cliente",
    breadcrumb: loaded
      ? `Inicio / Clientes / ${loaded.displayName}`
      : "Inicio / Clientes / Detalle",
  });

  const createVehicleMutation = useMutation({
    mutationFn: (values: VehicleFormValues) => vehicleService.create(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["vehicles", "customer", id],
      });
      setVehicleOpen(false);
    },
  });

  if (customerQuery.isLoading) {
    return <LoadingState />;
  }

  if (customerQuery.isError) {
    return <ErrorState onRetry={() => void customerQuery.refetch()} />;
  }

  const customer = customerQuery.data;
  if (!customer) {
    return (
      <EmptyState
        title="Cliente no encontrado"
        description="El identificador no existe en el directorio."
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/clientes">Volver al listado</Link>
          </Button>
        }
      />
    );
  }

  const vehicles = vehiclesQuery.data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/clientes">Volver a clientes</Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil /> Editar
          </Button>
          <Button onClick={() => setVehicleOpen(true)}>
            <Plus /> Agregar vehículo
          </Button>
        </div>
      </div>

      <SectionCard
        title={customer.displayName}
        subtitle={`${customerTypeLabel(customer.type)} · ${customer.documentType} ${customer.documentNumber}`}
        action={
          <StatusBadge variant={customerStatusVariant(customer.status)}>
            {customerStatusLabel(customer.status)}
          </StatusBadge>
        }
      >
        <dl className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-[11px] text-muted-foreground">Teléfono</dt>
            <dd className="font-semibold tabular-nums">
              {customer.phones[0]?.number ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Correo</dt>
            <dd className="truncate font-semibold">{customer.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Sede</dt>
            <dd className="font-semibold">
              {customer.preferredBranch?.name ?? "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[11px] text-muted-foreground">Dirección</dt>
            <dd className="font-semibold">{customer.address?.line1 ?? "—"}</dd>
          </div>
          {customer.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-[11px] text-muted-foreground">Notas</dt>
              <dd>{customer.notes}</dd>
            </div>
          )}
        </dl>
      </SectionCard>

      <SectionCard
        title="Vehículos"
        subtitle="Unidades asociadas a este cliente"
        action={
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {vehicles.length} unidades
          </span>
        }
      >
        {vehiclesQuery.isLoading && <LoadingState variant="table" rows={3} />}
        {vehiclesQuery.isError && (
          <ErrorState onRetry={() => void vehiclesQuery.refetch()} />
        )}
        {vehiclesQuery.isSuccess && vehicles.length === 0 && (
          <EmptyState
            title="Sin vehículos"
            description="Este cliente aún no tiene unidades registradas."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVehicleOpen(true)}
              >
                Agregar vehículo
              </Button>
            }
          />
        )}
        {vehiclesQuery.isSuccess && vehicles.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead className="hidden sm:table-cell">Km</TableHead>
                <TableHead className="hidden md:table-cell">Sede</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
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
                  <TableCell className="text-xs font-semibold">
                    {vehicleDisplayName(vehicle)}
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
            <DialogDescription>
              Los cambios se guardan en el directorio mock.
            </DialogDescription>
          </DialogHeader>
          {updateMutation.isError && (
            <ErrorState
              title="No se pudo guardar"
              message={
                updateMutation.error instanceof Error
                  ? updateMutation.error.message
                  : "Revisa los datos e inténtalo de nuevo."
              }
            />
          )}
          <CustomerForm
            key={customer.updatedAt}
            mode="edit"
            initialValues={toFormValues(customer)}
            branches={CUSTOMER_BRANCHES}
            submitting={updateMutation.isPending}
            onSubmit={async (values) => {
              await updateMutation.mutateAsync(values);
            }}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={vehicleOpen} onOpenChange={setVehicleOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar vehículo</DialogTitle>
            <DialogDescription>
              Quedará asociado a {customer.displayName}.
            </DialogDescription>
          </DialogHeader>
          {createVehicleMutation.isError && (
            <ErrorState
              title="No se pudo registrar"
              message={
                createVehicleMutation.error instanceof Error
                  ? createVehicleMutation.error.message
                  : "Revisa los datos e inténtalo de nuevo."
              }
            />
          )}
          <VehicleForm
            lockedCustomerId={id}
            customers={[{ id, displayName: customer.displayName }]}
            submitting={createVehicleMutation.isPending}
            onSubmit={async (values) => {
              await createVehicleMutation.mutateAsync(values);
            }}
            onCancel={() => setVehicleOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
