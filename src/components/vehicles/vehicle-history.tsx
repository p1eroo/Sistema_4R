import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  CarFront,
  ClipboardCheck,
  Search,
  Wrench,
} from "lucide-react";

import {
  VehicleHistoryKind,
  buildVehicleHistory,
  type VehicleHistoryEvent,
} from "@/components/vehicles/vehicle-history-events";
import { SectionCard } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { vehicleDisplayName } from "@/domain/vehicles";
import { appointmentService } from "@/mocks/appointments/service";
import { inspectionService } from "@/mocks/inspections/service";
import { receptionService } from "@/mocks/reception/service";
import { vehicleService } from "@/mocks/vehicles/service";
import { workOrderService } from "@/mocks/work-orders/service";
import { deliveryService } from "@/mocks/workshop-ops/delivery-service";

function formatEventTime(value: string): string {
  return new Date(value).toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function EventIcon({ kind }: { kind: VehicleHistoryKind }) {
  const Icon =
    kind === VehicleHistoryKind.Reception
      ? ClipboardCheck
      : kind === VehicleHistoryKind.Inspection
        ? CarFront
        : kind === VehicleHistoryKind.WorkOrder
          ? Wrench
          : kind === VehicleHistoryKind.Appointment
            ? CalendarDays
            : CarFront;

  return (
    <div className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-primary">
      <Icon className="size-4" />
    </div>
  );
}

function EventLink({ event }: { event: VehicleHistoryEvent }) {
  if (event.href.to === "/taller/inspecciones/$id") {
    return (
      <Link
        to="/taller/inspecciones/$id"
        params={{ id: event.href.id }}
        className="truncate text-xs font-semibold text-primary hover:underline"
      >
        {event.title}
      </Link>
    );
  }

  if (event.href.to === "/taller/ordenes/$id") {
    return (
      <Link
        to="/taller/ordenes/$id"
        params={{ id: event.href.id }}
        className="truncate text-xs font-semibold text-primary hover:underline"
      >
        {event.title}
      </Link>
    );
  }

  return (
    <Link
      to={event.href.to}
      className="truncate text-xs font-semibold text-primary hover:underline"
    >
      {event.title}
    </Link>
  );
}

export function VehicleHistory({ vehicleId }: { vehicleId: string }) {
  const receptionsQuery = useQuery({
    queryKey: ["receptions", { pageSize: 200 }],
    queryFn: () => receptionService.list({ pageSize: 200 }),
  });
  const inspectionsQuery = useQuery({
    queryKey: ["inspections", { pageSize: 200 }],
    queryFn: () => inspectionService.list({ pageSize: 200 }),
  });
  const ordersQuery = useQuery({
    queryKey: ["work-orders", { pageSize: 200 }],
    queryFn: () => workOrderService.list({ pageSize: 200 }),
  });
  const deliveriesQuery = useQuery({
    queryKey: ["deliveries", { pageSize: 200 }],
    queryFn: () => deliveryService.list({ pageSize: 200 }),
  });
  const appointmentsQuery = useQuery({
    queryKey: ["appointments", { pageSize: 200 }],
    queryFn: () => appointmentService.list({ pageSize: 200 }),
  });

  const events = useMemo(
    () =>
      buildVehicleHistory({
        vehicleId,
        receptions: receptionsQuery.data?.items ?? [],
        inspections: inspectionsQuery.data?.items ?? [],
        workOrders: ordersQuery.data?.items ?? [],
        deliveries: deliveriesQuery.data?.items ?? [],
        appointments: appointmentsQuery.data?.items ?? [],
      }),
    [
      appointmentsQuery.data?.items,
      deliveriesQuery.data?.items,
      inspectionsQuery.data?.items,
      ordersQuery.data?.items,
      receptionsQuery.data?.items,
      vehicleId,
    ],
  );

  const loading =
    receptionsQuery.isLoading ||
    inspectionsQuery.isLoading ||
    ordersQuery.isLoading ||
    deliveriesQuery.isLoading ||
    appointmentsQuery.isLoading;

  const failed =
    receptionsQuery.isError ||
    inspectionsQuery.isError ||
    ordersQuery.isError ||
    deliveriesQuery.isError ||
    appointmentsQuery.isError;

  return (
    <SectionCard
      title="Historial"
      subtitle="Recepciones, inspecciones, OT y entregas"
    >
      {loading && <LoadingState />}
      {failed && (
        <ErrorState
          onRetry={() => {
            void receptionsQuery.refetch();
            void inspectionsQuery.refetch();
            void ordersQuery.refetch();
            void deliveriesQuery.refetch();
            void appointmentsQuery.refetch();
          }}
        />
      )}
      {!loading && !failed && events.length === 0 && (
        <EmptyState
          title="Sin historial"
          description="Esta unidad aún no tiene recepciones ni órdenes."
        />
      )}
      {!loading && !failed && events.length > 0 && (
        <div className="divide-y divide-border">
          {events.map((event) => (
            <div
              key={`${event.kind}-${event.id}`}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <EventIcon kind={event.kind} />
              <div className="min-w-0">
                <EventLink event={event} />
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {event.meta}
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {formatEventTime(event.at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

export function VehicleHistorySearch() {
  const [draft, setDraft] = useState("ABC-123");
  const [plate, setPlate] = useState("");

  const vehicleQuery = useQuery({
    queryKey: ["vehicles", "plate", plate],
    queryFn: async () =>
      plate ? ((await vehicleService.getByPlate(plate)) ?? null) : null,
    enabled: plate.length > 0,
  });

  return (
    <div className="space-y-3">
      <SectionCard
        title="Buscar unidad"
        subtitle="Consulta el timeline por placa"
      >
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            setPlate(draft.trim().toUpperCase());
          }}
        >
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="ABC-123"
            className="bg-background sm:max-w-xs"
            aria-label="Placa"
          />
          <Button type="submit" size="sm">
            <Search /> Buscar
          </Button>
        </form>
      </SectionCard>

      {plate.length === 0 && (
        <EmptyState
          title="Busca por placa"
          description="Ejemplo: ABC-123 para ver el historial seed."
        />
      )}

      {vehicleQuery.isLoading && <LoadingState />}
      {vehicleQuery.isError && (
        <ErrorState onRetry={() => void vehicleQuery.refetch()} />
      )}
      {vehicleQuery.isSuccess && !vehicleQuery.data && (
        <EmptyState
          title="Sin resultados"
          description={`No hay un vehículo con placa ${plate}.`}
        />
      )}
      {vehicleQuery.data && (
        <>
          <SectionCard
            title={vehicleDisplayName(vehicleQuery.data)}
            subtitle={vehicleQuery.data.plate}
            action={
              <Button asChild size="sm" variant="outline">
                <Link
                  to="/taller/vehiculos/$id"
                  params={{ id: vehicleQuery.data.id }}
                >
                  Ver ficha
                </Link>
              </Button>
            }
          >
            <p className="text-xs text-muted-foreground">
              Timeline de visitas y órdenes de esta unidad.
            </p>
          </SectionCard>
          <VehicleHistory vehicleId={vehicleQuery.data.id} />
        </>
      )}
    </div>
  );
}
