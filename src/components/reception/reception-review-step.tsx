import { useEffect, type MutableRefObject } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { CUSTOMER_BRANCHES } from "@/components/customers/customer-list-filters";
import { StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { SEVERITY_TOKEN } from "@/components/reception/damage-severity";
import {
  findWorkOrderByReception,
  receptionConfirmIssues,
} from "@/components/reception/reception-review-handoff";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DAMAGE_SEVERITY_LABELS, findDamageZone } from "@/domain/inspections";
import { FuelLevel, ReceptionStatus, type Reception } from "@/domain/reception";
import type { EntityId } from "@/domain/shared";
import type { WorkOrder } from "@/domain/work-orders";
import { WORK_ORDER_STATUS_LABELS } from "@/domain/work-orders/status";
import { vehicleDisplayName } from "@/domain/vehicles";
import { customerService } from "@/mocks/customers/service";
import { inspectionService } from "@/mocks/inspections/service";
import { receptionService } from "@/mocks/reception/service";
import { vehicleService } from "@/mocks/vehicles/service";
import { workOrderService } from "@/mocks/work-orders/service";

const PHOTO_LABEL = "Foto";

const FUEL_LABELS: Record<FuelLevel, string> = {
  [FuelLevel.Empty]: "Vacío",
  [FuelLevel.Quarter]: "1/4",
  [FuelLevel.Half]: "1/2",
  [FuelLevel.ThreeQuarters]: "3/4",
  [FuelLevel.Full]: "Lleno",
};

const RECEPTION_STATUS_LABELS: Record<ReceptionStatus, string> = {
  [ReceptionStatus.Draft]: "Borrador",
  [ReceptionStatus.InProgress]: "En progreso",
  [ReceptionStatus.Completed]: "Completada",
  [ReceptionStatus.Cancelled]: "Cancelada",
};

function receptionStatusVariant(
  status: ReceptionStatus,
): "info" | "success" | "warning" | "danger" | "neutral" {
  switch (status) {
    case ReceptionStatus.Completed:
      return "success";
    case ReceptionStatus.InProgress:
      return "info";
    case ReceptionStatus.Cancelled:
      return "danger";
    default:
      return "neutral";
  }
}

function branchName(branchId: EntityId): string {
  return (
    CUSTOMER_BRANCHES.find((branch) => branch.id === branchId)?.name ?? branchId
  );
}

async function findLinkedWorkOrder(
  receptionId: EntityId,
): Promise<WorkOrder | undefined> {
  const result = await workOrderService.list({ pageSize: 500 });
  return findWorkOrderByReception(result.items, receptionId);
}

export function ReceptionReviewStep({
  receptionId,
  submitRef,
  onReadyChange,
  onSaved,
}: {
  receptionId?: EntityId;
  submitRef?: MutableRefObject<(() => void) | null>;
  onReadyChange?: (ready: boolean) => void;
  onSaved?: (reception: Reception, workOrder: WorkOrder) => void;
}) {
  const queryClient = useQueryClient();

  const receptionQuery = useQuery({
    queryKey: ["receptions", receptionId],
    queryFn: async () => {
      if (!receptionId) {
        return null;
      }
      return (await receptionService.getById(receptionId)) ?? null;
    },
    enabled: receptionId !== undefined,
  });

  const customerQuery = useQuery({
    queryKey: ["customers", receptionQuery.data?.customerId],
    queryFn: async () => {
      const customerId = receptionQuery.data?.customerId;
      if (!customerId) {
        return null;
      }
      return (await customerService.getById(customerId)) ?? null;
    },
    enabled: receptionQuery.data?.customerId !== undefined,
  });

  const vehicleQuery = useQuery({
    queryKey: ["vehicles", receptionQuery.data?.vehicleId],
    queryFn: async () => {
      const vehicleId = receptionQuery.data?.vehicleId;
      if (!vehicleId) {
        return null;
      }
      return (await vehicleService.getById(vehicleId)) ?? null;
    },
    enabled: receptionQuery.data?.vehicleId !== undefined,
  });

  const inspectionQuery = useQuery({
    queryKey: ["inspections", "reception", receptionId],
    queryFn: async () => {
      if (!receptionId) {
        return null;
      }
      return (await inspectionService.getByReception(receptionId)) ?? null;
    },
    enabled: receptionId !== undefined,
  });

  const linkedOrderQuery = useQuery({
    queryKey: ["work-orders", "reception", receptionId],
    queryFn: async () => {
      if (!receptionId) {
        return null;
      }
      return (await findLinkedWorkOrder(receptionId)) ?? null;
    },
    enabled: receptionId !== undefined,
  });

  const reception = receptionQuery.data ?? undefined;
  const issues = receptionConfirmIssues(reception);
  const linkedOrder = linkedOrderQuery.data ?? undefined;
  const canConfirm = issues.length === 0 && !linkedOrder;

  const confirmMutation = useMutation({
    mutationFn: async () => {
      if (!receptionId) {
        throw new Error("Guarda el cliente y el vehículo primero.");
      }

      const current = await receptionService.getById(receptionId);
      const currentIssues = receptionConfirmIssues(current);
      if (currentIssues.length > 0) {
        throw new Error(currentIssues[0]);
      }

      const existing = await findLinkedWorkOrder(receptionId);
      if (existing) {
        if (!current) {
          throw new Error("No se encontró la recepción.");
        }
        return { reception: current, workOrder: existing };
      }

      const completed =
        current?.status === ReceptionStatus.Completed
          ? current
          : await receptionService.complete(receptionId);

      const afterComplete = await findLinkedWorkOrder(receptionId);
      if (afterComplete) {
        return { reception: completed, workOrder: afterComplete };
      }

      const workOrder = await workOrderService.createFromReception(receptionId);
      return { reception: completed, workOrder };
    },
    onSuccess: async ({ reception: saved, workOrder }) => {
      await queryClient.invalidateQueries({ queryKey: ["receptions"] });
      await queryClient.invalidateQueries({ queryKey: ["work-orders"] });
      onSaved?.(saved, workOrder);
    },
  });

  useEffect(() => {
    onReadyChange?.(canConfirm && !confirmMutation.isPending);
  }, [canConfirm, confirmMutation.isPending, onReadyChange]);

  if (submitRef) {
    submitRef.current = () => {
      if (canConfirm && !confirmMutation.isPending) {
        confirmMutation.mutate();
      }
    };
  }

  if (!receptionId) {
    return (
      <EmptyState
        title="Falta el ingreso"
        description="Completa cliente y vehículo antes de revisar la recepción."
      />
    );
  }

  if (
    receptionQuery.isLoading ||
    customerQuery.isLoading ||
    vehicleQuery.isLoading ||
    inspectionQuery.isLoading ||
    linkedOrderQuery.isLoading
  ) {
    return <LoadingState />;
  }

  if (receptionQuery.isError || receptionQuery.data === null || !reception) {
    return (
      <ErrorState
        title="No se encontró la recepción"
        onRetry={() => void receptionQuery.refetch()}
      />
    );
  }

  const customer = customerQuery.data;
  const vehicle = vehicleQuery.data;
  const inspection = inspectionQuery.data;
  const workOrder = linkedOrder ?? confirmMutation.data?.workOrder;
  const belongings = reception.belongings.filter(
    (item) => item.label !== PHOTO_LABEL,
  );
  const photos = reception.belongings.filter(
    (item) => item.label === PHOTO_LABEL && item.notes,
  );
  const damagePoints = inspection?.damagePoints ?? [];

  return (
    <div className="space-y-5">
      {workOrder ? (
        <Alert className="border-success/40 bg-success/5">
          <CheckCircle2 className="size-4 text-success" />
          <AlertTitle>Recepción confirmada</AlertTitle>
          <AlertDescription>
            Se creó la orden {workOrder.code} en{" "}
            {WORK_ORDER_STATUS_LABELS[workOrder.status]}.
          </AlertDescription>
        </Alert>
      ) : issues.length > 0 ? (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>No se puede confirmar</AlertTitle>
          <AlertDescription>
            Completa los pasos anteriores. {issues[0]}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge variant={receptionStatusVariant(reception.status)}>
          {RECEPTION_STATUS_LABELS[reception.status]}
        </StatusBadge>
        <p className="text-xs text-muted-foreground">{reception.code}</p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-[11px] text-muted-foreground">Cliente</dt>
          <dd className="text-xs font-semibold">
            {customer?.displayName ?? reception.customerId}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">Vehículo</dt>
          <dd className="text-xs font-semibold">
            {vehicle ? vehicleDisplayName(vehicle) : reception.vehicleId}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">Sede</dt>
          <dd className="text-xs font-semibold">
            {branchName(reception.branchId)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">Motivo</dt>
          <dd className="text-xs font-semibold">{reception.reason || "—"}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">Kilometraje</dt>
          <dd className="text-xs font-semibold tabular-nums">
            {reception.odometerKm.toLocaleString("es-PE")} km
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">Combustible</dt>
          <dd className="text-xs font-semibold">
            {FUEL_LABELS[reception.fuelLevel]}
          </dd>
        </div>
      </dl>

      <div className="space-y-2">
        <p className="text-xs font-semibold">Checklist de ingreso</p>
        <p className="text-[11px] text-muted-foreground">
          Marcado = OK · Sin marcar = falla.
        </p>
        <ul className="divide-y divide-border/60 rounded-lg border border-border/60 bg-white/50">
          {reception.checklist.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 px-3 py-2"
            >
              <span className="text-xs">{item.label}</span>
              <StatusBadge variant={item.checked ? "success" : "danger"}>
                {item.checked ? "OK" : "Falla"}
              </StatusBadge>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold">Checklist de inspección</p>
        <p className="text-[11px] text-muted-foreground">
          Marcado = OK · Sin marcar = falla.
        </p>
        {(inspection?.checklist.length ?? 0) === 0 ? (
          <p className="text-[11px] text-muted-foreground">
            Sin revisión de inspección.
          </p>
        ) : (
          <ul className="divide-y divide-border/60 rounded-lg border border-border/60 bg-white/50">
            {inspection?.checklist.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 px-3 py-2"
              >
                <span className="text-xs">{item.label}</span>
                <StatusBadge variant={item.checked ? "success" : "danger"}>
                  {item.checked ? "OK" : "Falla"}
                </StatusBadge>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold">Daños registrados</p>
        {damagePoints.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">
            Sin puntos de daño.
          </p>
        ) : (
          <ul className="space-y-2">
            {damagePoints.map((point) => {
              const zone = findDamageZone(point.zoneId);
              return (
                <li
                  key={point.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-white/50 px-3 py-2"
                >
                  <span className="text-xs">
                    {zone?.label ?? point.zoneId}
                    {point.notes ? ` · ${point.notes}` : ""}
                  </span>
                  <StatusBadge variant={SEVERITY_TOKEN[point.severity].token}>
                    {DAMAGE_SEVERITY_LABELS[point.severity]}
                  </StatusBadge>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {(belongings.length > 0 || photos.length > 0) && (
        <div className="space-y-2">
          <p className="text-xs font-semibold">Pertenencias y fotos</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {belongings.map((item) => (
              <li key={item.id}>
                {item.label} × {item.quantity}
              </li>
            ))}
            {photos.map((item) => (
              <li key={item.id} className="truncate">
                Foto · {item.notes}
              </li>
            ))}
          </ul>
        </div>
      )}

      {reception.observations ? (
        <div className="space-y-1">
          <p className="text-xs font-semibold">Observaciones</p>
          <p className="text-xs text-muted-foreground">
            {reception.observations}
          </p>
        </div>
      ) : null}

      {confirmMutation.isError && (
        <ErrorState
          title="No se pudo confirmar la recepción"
          message={
            confirmMutation.error instanceof Error
              ? confirmMutation.error.message
              : "Revisa los datos e inténtalo de nuevo."
          }
        />
      )}

      {workOrder ? (
        <div className="flex justify-end">
          <Button asChild>
            <Link to="/taller/ordenes/$id" params={{ id: workOrder.id }}>
              Ver orden {workOrder.code}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button
            type="button"
            disabled={!canConfirm || confirmMutation.isPending}
            onClick={() => confirmMutation.mutate()}
          >
            {confirmMutation.isPending
              ? "Confirmando…"
              : "Confirmar y crear OT"}
          </Button>
        </div>
      )}
    </div>
  );
}
