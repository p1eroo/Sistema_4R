import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { useRegisterPageChrome } from "@/components/erp/use-page-chrome";
import { Button } from "@/components/ui/button";
import { VehicleHistory } from "@/components/vehicles/vehicle-history";
import { FuelType, VehicleStatus, vehicleDisplayName } from "@/domain/vehicles";
import { asEntityId } from "@/domain/shared";
import { customerService } from "@/mocks/customers/service";
import { vehicleService } from "@/mocks/vehicles/service";

function vehicleStatusLabel(status: VehicleStatus): string {
  switch (status) {
    case VehicleStatus.Active:
      return "Activo";
    case VehicleStatus.Inactive:
      return "Inactivo";
    case VehicleStatus.Archived:
      return "Archivado";
  }
}

function vehicleStatusVariant(
  status: VehicleStatus,
): "success" | "warning" | "neutral" {
  switch (status) {
    case VehicleStatus.Active:
      return "success";
    case VehicleStatus.Inactive:
      return "warning";
    case VehicleStatus.Archived:
      return "neutral";
  }
}

function fuelTypeLabel(fuelType: FuelType): string {
  switch (fuelType) {
    case FuelType.Gasolina:
      return "Gasolina";
    case FuelType.Diesel:
      return "Diésel";
    case FuelType.GNV:
      return "GNV";
    case FuelType.GLP:
      return "GLP";
    case FuelType.Hibrido:
      return "Híbrido";
    case FuelType.Electrico:
      return "Eléctrico";
  }
}

export function VehicleDetail({ vehicleId }: { vehicleId: string }) {
  const id = asEntityId(vehicleId);

  const vehicleQuery = useQuery({
    queryKey: ["vehicles", id],
    queryFn: async () => (await vehicleService.getById(id)) ?? null,
  });

  const ownerQuery = useQuery({
    queryKey: ["customers", vehicleQuery.data?.customerId],
    queryFn: async () => {
      const customerId = vehicleQuery.data?.customerId;
      if (!customerId) {
        return null;
      }
      return (await customerService.getById(customerId)) ?? null;
    },
    enabled: Boolean(vehicleQuery.data?.customerId),
  });

  const loaded = vehicleQuery.data;
  useRegisterPageChrome({
    title: loaded ? loaded.plate : "Vehículo",
    breadcrumb: loaded
      ? `Inicio / Taller / Vehículos / ${loaded.plate}`
      : "Inicio / Taller / Vehículos / Detalle",
  });

  if (vehicleQuery.isLoading) {
    return <LoadingState />;
  }

  if (vehicleQuery.isError) {
    return <ErrorState onRetry={() => void vehicleQuery.refetch()} />;
  }

  const vehicle = vehicleQuery.data;
  if (!vehicle) {
    return (
      <EmptyState
        title="Vehículo no encontrado"
        description="El identificador no existe en el parque de unidades."
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/taller/vehiculos">Volver al listado</Link>
          </Button>
        }
      />
    );
  }

  const owner = ownerQuery.data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/taller/vehiculos">Volver a vehículos</Link>
        </Button>
      </div>

      <SectionCard
        title={vehicleDisplayName(vehicle)}
        subtitle={`${vehicle.color} · ${fuelTypeLabel(vehicle.fuelType)}`}
        action={
          <StatusBadge variant={vehicleStatusVariant(vehicle.status)}>
            {vehicleStatusLabel(vehicle.status)}
          </StatusBadge>
        }
      >
        <dl className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-[11px] text-muted-foreground">Placa</dt>
            <dd>
              <span className="inline-flex rounded-md bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">
                {vehicle.plate}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Dueño</dt>
            <dd className="font-semibold">
              {ownerQuery.isLoading && (
                <span className="text-muted-foreground">Cargando…</span>
              )}
              {ownerQuery.isError && (
                <span className="text-destructive">No se pudo cargar</span>
              )}
              {owner && (
                <Link
                  to="/clientes/$id"
                  params={{ id: owner.id }}
                  className="text-primary hover:underline"
                >
                  {owner.displayName}
                </Link>
              )}
              {ownerQuery.isSuccess && !owner && (
                <span>{vehicle.customerId}</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Kilometraje</dt>
            <dd className="font-semibold tabular-nums">
              {vehicle.odometerKm.toLocaleString("es-PE")} km
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Sede</dt>
            <dd className="font-semibold">
              {vehicle.usualBranch?.name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">VIN</dt>
            <dd className="font-semibold tabular-nums">{vehicle.vin ?? "—"}</dd>
          </div>
          {vehicle.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-[11px] text-muted-foreground">Notas</dt>
              <dd>{vehicle.notes}</dd>
            </div>
          )}
        </dl>
      </SectionCard>

      <VehicleHistory vehicleId={vehicle.id} />
    </div>
  );
}
