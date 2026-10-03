import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { DiagnosticPanel } from "@/components/diagnostics/diagnostic-form";
import { EstimatePanel } from "@/components/estimates/estimate-builder";
import { DeliveryPanel } from "@/components/workshop/delivery-form";
import { QualityPanel } from "@/components/workshop/quality-check-form";
import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { useRegisterPageChrome } from "@/components/erp/use-page-chrome";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { asEntityId } from "@/domain/shared";
import { FuelLevel } from "@/domain/reception";
import { vehicleDisplayName } from "@/domain/vehicles";
import {
  WORK_ORDER_PRIORITY_LABELS,
  WorkOrderPriority,
} from "@/domain/work-orders";
import {
  WORK_ORDER_STATUS_LABELS,
  WorkOrderStatus,
} from "@/domain/work-orders/status";
import {
  WORK_ORDER_TRANSITIONS,
  WorkOrderTransitionError,
} from "@/domain/work-orders/transitions";
import { customerService } from "@/mocks/customers/service";
import { inspectionService } from "@/mocks/inspections/service";
import { receptionService } from "@/mocks/reception/service";
import { vehicleService } from "@/mocks/vehicles/service";
import { workOrderService } from "@/mocks/work-orders/service";
import {
  workOrderBranchName,
  workOrderStatusVariant,
} from "@/components/work-orders/work-order-list-filters";

const STAFF_LABELS: Record<string, string> = {
  "USR-0001": "Carlos Mendoza",
  "TEC-0001": "Técnico 1",
  "TEC-0002": "Técnico 2",
  "TEC-0003": "Técnico 3",
};

const ALL_STATUSES = Object.values(WorkOrderStatus);

const FUEL_LABELS: Record<FuelLevel, string> = {
  [FuelLevel.Empty]: "Vacío",
  [FuelLevel.Quarter]: "1/4",
  [FuelLevel.Half]: "1/2",
  [FuelLevel.ThreeQuarters]: "3/4",
  [FuelLevel.Full]: "Lleno",
};

const TABS = [
  { id: "resumen", label: "Resumen" },
  { id: "diagnostico", label: "Diagnóstico" },
  { id: "presupuesto", label: "Presupuesto" },
  { id: "wip", label: "WIP" },
  { id: "qc", label: "QC" },
  { id: "entrega", label: "Entrega" },
] as const;

function staffName(id: string | undefined): string {
  if (!id) {
    return "—";
  }
  return STAFF_LABELS[id] ?? id;
}

function formatDateTime(value: string | undefined): string {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function priorityVariant(
  priority: WorkOrderPriority,
): "info" | "success" | "warning" | "danger" | "neutral" {
  switch (priority) {
    case WorkOrderPriority.Urgent:
      return "danger";
    case WorkOrderPriority.High:
      return "warning";
    case WorkOrderPriority.Normal:
      return "info";
    case WorkOrderPriority.Low:
      return "neutral";
  }
}

export function WorkOrderDetail({ workOrderId }: { workOrderId: string }) {
  const id = asEntityId(workOrderId);
  const queryClient = useQueryClient();
  const [nextStatus, setNextStatus] = useState<WorkOrderStatus | "">("");

  const orderQuery = useQuery({
    queryKey: ["work-orders", id],
    queryFn: async () => (await workOrderService.getById(id)) ?? null,
  });

  const customerQuery = useQuery({
    queryKey: ["customers", orderQuery.data?.customerId],
    queryFn: async () => {
      const customerId = orderQuery.data?.customerId;
      if (!customerId) {
        return null;
      }
      return (await customerService.getById(customerId)) ?? null;
    },
    enabled: orderQuery.data?.customerId !== undefined,
  });

  const vehicleQuery = useQuery({
    queryKey: ["vehicles", orderQuery.data?.vehicleId],
    queryFn: async () => {
      const vehicleId = orderQuery.data?.vehicleId;
      if (!vehicleId) {
        return null;
      }
      return (await vehicleService.getById(vehicleId)) ?? null;
    },
    enabled: orderQuery.data?.vehicleId !== undefined,
  });

  const receptionQuery = useQuery({
    queryKey: ["receptions", orderQuery.data?.receptionId],
    queryFn: async () => {
      const receptionId = orderQuery.data?.receptionId;
      if (!receptionId) {
        return null;
      }
      return (await receptionService.getById(receptionId)) ?? null;
    },
    enabled: orderQuery.data?.receptionId !== undefined,
  });

  const inspectionQuery = useQuery({
    queryKey: ["inspections", "reception", orderQuery.data?.receptionId],
    queryFn: async () => {
      const receptionId = orderQuery.data?.receptionId;
      if (!receptionId) {
        return null;
      }
      return (await inspectionService.getByReception(receptionId)) ?? null;
    },
    enabled: orderQuery.data?.receptionId !== undefined,
  });

  const statusMutation = useMutation({
    mutationFn: (status: WorkOrderStatus) =>
      workOrderService.updateStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["work-orders"] });
      setNextStatus("");
    },
  });

  const loaded = orderQuery.data ?? undefined;
  const vehicle = vehicleQuery.data ?? undefined;
  useRegisterPageChrome({
    title: loaded?.code ?? "Orden de trabajo",
    breadcrumb: loaded
      ? `Inicio / Taller / Órdenes de trabajo / ${loaded.code}`
      : "Inicio / Taller / Órdenes de trabajo / Detalle",
  });

  if (orderQuery.isLoading) {
    return <LoadingState />;
  }

  if (orderQuery.isError) {
    return <ErrorState onRetry={() => void orderQuery.refetch()} />;
  }

  const order = orderQuery.data;
  if (!order) {
    return (
      <EmptyState
        title="Orden no encontrada"
        description="El identificador no existe en el taller."
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/taller/ordenes">Volver al listado</Link>
          </Button>
        }
      />
    );
  }

  const customer = customerQuery.data;
  const reception = receptionQuery.data ?? undefined;
  const linkedInspection = inspectionQuery.data ?? undefined;
  const allowed = WORK_ORDER_TRANSITIONS[order.status];
  const statusError =
    statusMutation.error instanceof WorkOrderTransitionError
      ? statusMutation.error.message
      : statusMutation.error instanceof Error
        ? statusMutation.error.message
        : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/taller/ordenes">Volver a órdenes</Link>
        </Button>
      </div>

      <SectionCard
        title={order.code}
        subtitle={order.reason}
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            {vehicle && (
              <span className="inline-flex rounded-md bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">
                {vehicle.plate}
              </span>
            )}
            <StatusBadge variant={workOrderStatusVariant(order.status)}>
              {WORK_ORDER_STATUS_LABELS[order.status]}
            </StatusBadge>
          </div>
        }
      >
        <dl className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-[11px] text-muted-foreground">Cliente</dt>
            <dd className="font-semibold">
              {customer ? (
                <Link
                  to="/clientes/$id"
                  params={{ id: customer.id }}
                  className="text-primary hover:underline"
                >
                  {customer.displayName}
                </Link>
              ) : (
                order.customerId
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Vehículo</dt>
            <dd className="font-semibold">
              {vehicle ? (
                <Link
                  to="/taller/vehiculos/$id"
                  params={{ id: vehicle.id }}
                  className="text-primary hover:underline"
                >
                  {vehicleDisplayName(vehicle)}
                </Link>
              ) : (
                order.vehicleId
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Asesor</dt>
            <dd className="font-semibold">{staffName(order.advisorId)}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Técnico</dt>
            <dd className="font-semibold">{staffName(order.technicianId)}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Sede</dt>
            <dd className="font-semibold">
              {workOrderBranchName(order.branchId)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Prioridad</dt>
            <dd>
              <StatusBadge variant={priorityVariant(order.priority)}>
                {WORK_ORDER_PRIORITY_LABELS[order.priority]}
              </StatusBadge>
            </dd>
          </div>
        </dl>
      </SectionCard>

      <Tabs defaultValue="resumen">
        <TabsList className="h-auto w-full flex-wrap justify-start">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="resumen" className="mt-4 space-y-4">
          <SectionCard title="Operación" subtitle="Datos de la orden">
            <dl className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-[11px] text-muted-foreground">
                  Kilometraje
                </dt>
                <dd className="font-semibold tabular-nums">
                  {order.odometerKm.toLocaleString("es-PE")} km
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted-foreground">Apertura</dt>
                <dd className="font-semibold">
                  {formatDateTime(order.openedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted-foreground">Promesa</dt>
                <dd className="font-semibold">
                  {formatDateTime(order.promisedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted-foreground">Cierre</dt>
                <dd className="font-semibold">
                  {formatDateTime(order.closedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted-foreground">Recepción</dt>
                <dd className="font-semibold">{order.receptionId ?? "—"}</dd>
              </div>
              {order.notes ? (
                <div className="sm:col-span-2 lg:col-span-3">
                  <dt className="text-[11px] text-muted-foreground">Notas</dt>
                  <dd>{order.notes}</dd>
                </div>
              ) : null}
            </dl>
          </SectionCard>

          <SectionCard
            title="Ingreso / Recepción"
            subtitle="Datos capturados al recibir el vehículo"
            action={
              linkedInspection ? (
                <Button asChild variant="outline" size="sm">
                  <Link
                    to="/taller/inspecciones/$id"
                    params={{ id: linkedInspection.id }}
                  >
                    Ver inspección completa
                  </Link>
                </Button>
              ) : undefined
            }
          >
            {receptionQuery.isLoading ? (
              <LoadingState />
            ) : reception ? (
              <dl className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-[11px] text-muted-foreground">
                    Kilometraje
                  </dt>
                  <dd className="font-semibold tabular-nums">
                    {reception.odometerKm.toLocaleString("es-PE")} km
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-muted-foreground">
                    Combustible
                  </dt>
                  <dd className="font-semibold">
                    {FUEL_LABELS[reception.fuelLevel]}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-muted-foreground">
                    Pertenencias
                  </dt>
                  <dd className="font-semibold tabular-nums">
                    {
                      reception.belongings.filter(
                        (item) => item.label !== "Foto",
                      ).length
                    }
                  </dd>
                </div>
                {reception.observations ? (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <dt className="text-[11px] text-muted-foreground">
                      Observaciones
                    </dt>
                    <dd className="text-muted-foreground">
                      {reception.observations}
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Esta orden no tiene una recepción enlazada.
              </p>
            )}
          </SectionCard>

          <SectionCard
            title="Cambio de estado"
            subtitle="El sistema valida cada cambio de estado."
          >
            <div className="space-y-3">
              <p className="text-[11px] text-muted-foreground">
                Permitidos desde {WORK_ORDER_STATUS_LABELS[order.status]}:{" "}
                {allowed.length > 0
                  ? allowed
                      .map((status) => WORK_ORDER_STATUS_LABELS[status])
                      .join(", ")
                  : "ninguno"}
                .
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Select
                  value={nextStatus}
                  onValueChange={(value) =>
                    setNextStatus(value as WorkOrderStatus)
                  }
                >
                  <SelectTrigger
                    className="bg-white/70 sm:w-64"
                    aria-label="Nuevo estado"
                  >
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_STATUSES.filter(
                      (status) => status !== order.status,
                    ).map((status) => (
                      <SelectItem key={status} value={status}>
                        {WORK_ORDER_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  disabled={!nextStatus || statusMutation.isPending}
                  onClick={() => {
                    if (nextStatus) {
                      statusMutation.mutate(nextStatus);
                    }
                  }}
                >
                  {statusMutation.isPending
                    ? "Actualizando…"
                    : "Aplicar estado"}
                </Button>
              </div>
              {statusMutation.isError && (
                <ErrorState
                  title="Transición no permitida"
                  message={
                    statusError ?? "No se puede cambiar al estado seleccionado."
                  }
                />
              )}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="diagnostico" className="mt-4">
          <DiagnosticPanel workOrderId={order.id} />
        </TabsContent>

        <TabsContent value="presupuesto" className="mt-4">
          <EstimatePanel
            customerId={order.customerId}
            vehicleId={order.vehicleId}
            workOrderId={order.id}
          />
        </TabsContent>

        <TabsContent value="qc" className="mt-4">
          <QualityPanel workOrderId={order.id} />
        </TabsContent>

        <TabsContent value="entrega" className="mt-4">
          <DeliveryPanel workOrderId={order.id} />
        </TabsContent>

        {TABS.filter(
          (tab) =>
            tab.id !== "resumen" &&
            tab.id !== "diagnostico" &&
            tab.id !== "presupuesto" &&
            tab.id !== "qc" &&
            tab.id !== "entrega",
        ).map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4">
            <SectionCard title={tab.label} subtitle="Módulo pendiente">
              <EmptyState
                title={`${tab.label} se gestiona en su módulo`}
                description="Abre el módulo correspondiente en el menú Taller para trabajar esta etapa."
              />
            </SectionCard>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
