import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { AppointmentForm } from "@/components/appointments/appointment-form";
import {
  dateFromDateKey,
  formatLimaDateLabel,
  formatLimaTime,
  formatLimaWeekday,
  toDateKey,
  weekDateKeys,
} from "@/components/appointments/appointment-datetime";
import { workOrderBranchName } from "@/components/work-orders/work-order-list-filters";
import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  APPOINTMENT_SERVICE_LABELS,
  APPOINTMENT_STATUS_LABELS,
  AppointmentStatus,
  appointmentDateKey,
  todayDateKey,
  type Appointment,
} from "@/domain/appointments";
import type { AppointmentCreateValues } from "@/domain/appointments/schemas";
import { vehicleDisplayName, type Vehicle } from "@/domain/vehicles";
import {
  APPOINTMENT_TIME_BLOCK_LABELS,
  AppointmentTimeBlock,
  filterAppointments,
  groupAppointmentsByTimeBlock,
} from "@/lib/appointments-query";
import { appointmentService } from "@/mocks/appointments/service";
import { customerService } from "@/mocks/customers/service";
import { vehicleService } from "@/mocks/vehicles/service";

function formatVehicleLabel(
  vehicle: Vehicle | undefined,
  fallback: string,
): string {
  return vehicle ? vehicleDisplayName(vehicle) : fallback;
}

function appointmentStatusVariant(
  status: AppointmentStatus,
): "info" | "success" | "warning" | "danger" | "neutral" {
  switch (status) {
    case AppointmentStatus.Confirmed:
      return "success";
    case AppointmentStatus.Scheduled:
      return "info";
    case AppointmentStatus.InProgress:
      return "warning";
    case AppointmentStatus.Completed:
      return "neutral";
    case AppointmentStatus.Cancelled:
    case AppointmentStatus.NoShow:
      return "danger";
  }
}

export function AppointmentCalendar() {
  const queryClient = useQueryClient();
  const [selectedKey, setSelectedKey] = useState(todayDateKey);
  const [view, setView] = useState<"day" | "week">("day");
  const [selectedId, setSelectedId] = useState<string>();
  const [createOpen, setCreateOpen] = useState(false);

  const appointmentsQuery = useQuery({
    queryKey: ["appointments", { pageSize: 200 }],
    queryFn: () =>
      appointmentService.list({ pageSize: 200, sortBy: "scheduledAt" }),
  });

  const customersQuery = useQuery({
    queryKey: ["customers", { pageSize: 100 }],
    queryFn: () =>
      customerService.list({ pageSize: 100, sortBy: "displayName" }),
  });

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles", { pageSize: 100 }],
    queryFn: () => vehicleService.list({ pageSize: 100, sortBy: "plate" }),
  });

  const createMutation = useMutation({
    mutationFn: (values: AppointmentCreateValues) =>
      appointmentService.create(values),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setSelectedKey(appointmentDateKey(created.scheduledAt));
      setSelectedId(created.id);
      setCreateOpen(false);
    },
  });

  const customers = useMemo(
    () =>
      new Map(
        (customersQuery.data?.items ?? []).map((customer) => [
          customer.id,
          customer,
        ]),
      ),
    [customersQuery.data?.items],
  );

  const vehicles = useMemo(
    () =>
      new Map(
        (vehiclesQuery.data?.items ?? []).map((vehicle) => [
          vehicle.id,
          vehicle,
        ]),
      ),
    [vehiclesQuery.data?.items],
  );

  const all = appointmentsQuery.data?.items ?? [];
  const weekKeys = weekDateKeys(selectedKey);
  const dayItems = filterAppointments(all, { date: selectedKey }).items;
  const weekItems = filterAppointments(all, {
    fromDate: weekKeys[0],
    toDate: weekKeys[6],
  }).items;
  const groups = groupAppointmentsByTimeBlock(dayItems);
  const selected = all.find((item) => item.id === selectedId);
  const bookedDays = [
    ...new Set(all.map((item) => appointmentDateKey(item.scheduledAt))),
  ].map((key) => dateFromDateKey(key));

  const loading =
    appointmentsQuery.isLoading ||
    customersQuery.isLoading ||
    vehiclesQuery.isLoading;

  if (loading) {
    return <LoadingState />;
  }

  if (appointmentsQuery.isError) {
    return <ErrorState onRetry={() => void appointmentsQuery.refetch()} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={view === "day" ? "default" : "outline"}
            onClick={() => setView("day")}
          >
            Día
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === "week" ? "default" : "outline"}
            onClick={() => setView("week")}
          >
            Semana
          </Button>
        </div>
        <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus /> Nueva cita
        </Button>
      </div>

      <div className="grid gap-3 xl:grid-cols-[auto_minmax(0,1fr)]">
        <SectionCard title="Calendario" subtitle="Sede Lima · zona horaria">
          <Calendar
            mode="single"
            selected={dateFromDateKey(selectedKey)}
            onSelect={(date) => {
              if (date) {
                setSelectedKey(toDateKey(date));
                setSelectedId(undefined);
              }
            }}
            modifiers={{ booked: bookedDays }}
            modifiersClassNames={{
              booked: "font-bold text-primary",
            }}
          />
        </SectionCard>

        <SectionCard
          title={
            view === "day"
              ? formatLimaDateLabel(selectedKey)
              : `Semana del ${weekKeys[0]}`
          }
          subtitle={
            view === "day"
              ? `${dayItems.length} citas`
              : `${weekItems.length} citas`
          }
        >
          {view === "day" ? (
            dayItems.length === 0 ? (
              <EmptyState
                title="Sin citas"
                description="No hay citas en este día."
                action={
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setCreateOpen(true)}
                  >
                    Agendar
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {(
                  [
                    AppointmentTimeBlock.Morning,
                    AppointmentTimeBlock.Afternoon,
                    AppointmentTimeBlock.Evening,
                  ] as const
                ).map((block) =>
                  groups[block].length === 0 ? null : (
                    <div key={block} className="space-y-2">
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        {APPOINTMENT_TIME_BLOCK_LABELS[block]}
                      </p>
                      <ul className="space-y-2">
                        {groups[block].map((appointment) => (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            customerName={
                              customers.get(appointment.customerId)
                                ?.displayName ?? appointment.customerId
                            }
                            vehicleLabel={formatVehicleLabel(
                              vehicles.get(appointment.vehicleId),
                              appointment.vehicleId,
                            )}
                            selected={selectedId === appointment.id}
                            onSelect={() => setSelectedId(appointment.id)}
                          />
                        ))}
                      </ul>
                    </div>
                  ),
                )}
              </div>
            )
          ) : (
            <div className="grid gap-2 md:grid-cols-7">
              {weekKeys.map((key) => {
                const items = filterAppointments(all, { date: key }).items;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedKey(key);
                      setView("day");
                    }}
                    className={cn(
                      "min-w-0 rounded-lg border border-border p-2 text-left",
                      key === selectedKey && "border-primary bg-primary/5",
                    )}
                  >
                    <p className="text-[11px] font-semibold">
                      {formatLimaWeekday(key)}
                    </p>
                    {items.length === 0 ? (
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Sin citas
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-1">
                        {items.map((appointment) => (
                          <li
                            key={appointment.id}
                            className="truncate text-[11px] tabular-nums"
                          >
                            {formatLimaTime(appointment.scheduledAt)}{" "}
                            {customers.get(appointment.customerId)
                              ?.displayName ?? ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {selected && (
        <SectionCard
          title={
            customers.get(selected.customerId)?.displayName ??
            selected.customerId
          }
          subtitle={`${formatLimaTime(selected.scheduledAt)} · ${
            APPOINTMENT_SERVICE_LABELS[selected.serviceType]
          }`}
          action={
            <StatusBadge variant={appointmentStatusVariant(selected.status)}>
              {APPOINTMENT_STATUS_LABELS[selected.status]}
            </StatusBadge>
          }
        >
          <dl className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-[11px] text-muted-foreground">Cliente</dt>
              <dd className="font-semibold">
                <Link to="/clientes/$id" params={{ id: selected.customerId }}>
                  {customers.get(selected.customerId)?.displayName ??
                    selected.customerId}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">Vehículo</dt>
              <dd className="font-semibold">
                <Link
                  to="/taller/vehiculos/$id"
                  params={{ id: selected.vehicleId }}
                >
                  {formatVehicleLabel(
                    vehicles.get(selected.vehicleId),
                    selected.vehicleId,
                  )}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">Sede</dt>
              <dd className="font-semibold">
                {workOrderBranchName(selected.branchId)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">Duración</dt>
              <dd className="font-semibold tabular-nums">
                {selected.durationMinutes} min
              </dd>
            </div>
            {selected.notes && (
              <div className="sm:col-span-2">
                <dt className="text-[11px] text-muted-foreground">Notas</dt>
                <dd>{selected.notes}</dd>
              </div>
            )}
          </dl>
          <Button asChild size="sm" variant="outline" className="mt-4">
            <Link to="/taller/recepcion">Ir a recepción</Link>
          </Button>
        </SectionCard>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva cita</DialogTitle>
            <DialogDescription>
              {formatLimaDateLabel(selectedKey)}
            </DialogDescription>
          </DialogHeader>
          {createMutation.isError && (
            <ErrorState
              title="No se pudo crear la cita"
              message={
                createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "Revisa los datos."
              }
            />
          )}
          <AppointmentForm
            dateKey={selectedKey}
            customers={customersQuery.data?.items ?? []}
            vehicles={vehiclesQuery.data?.items ?? []}
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

function AppointmentCard({
  appointment,
  customerName,
  vehicleLabel,
  selected,
  onSelect,
}: {
  appointment: Appointment;
  customerName: string;
  vehicleLabel: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "w-full rounded-lg border border-border/60 bg-white/50 p-3 text-left",
          selected && "border-primary bg-primary/5",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold tabular-nums">
              {formatLimaTime(appointment.scheduledAt)}
            </p>
            <p className="mt-0.5 text-xs font-semibold">{customerName}</p>
            <p className="text-[11px] text-muted-foreground">{vehicleLabel}</p>
          </div>
          <StatusBadge variant={appointmentStatusVariant(appointment.status)}>
            {APPOINTMENT_STATUS_LABELS[appointment.status]}
          </StatusBadge>
        </div>
      </button>
    </li>
  );
}
