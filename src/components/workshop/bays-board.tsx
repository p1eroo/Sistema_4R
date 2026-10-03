import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { CarFront } from "lucide-react";

import { CUSTOMER_BRANCHES } from "@/components/customers/customer-list-filters";
import { MetricCard, StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { ListToolbar, ListToolbarSearch } from "@/components/erp/list-toolbar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workOrderBranchName } from "@/components/work-orders/work-order-list-filters";
import {
  bayOccupancy,
  formatBayCapacity,
} from "@/components/workshop/bay-occupancy";
import { vehicleDisplayName } from "@/domain/vehicles";
import { isWorkOrderOpen, type WorkOrder } from "@/domain/work-orders";
import {
  BAY_STATUS_LABELS,
  BayStatus,
  type WorkshopBay,
} from "@/domain/workshop-ops";
import { vehicleService } from "@/mocks/vehicles/service";
import { workOrderService } from "@/mocks/work-orders/service";
import { baysService } from "@/mocks/workshop-ops/bays-service";

function bayStatusVariant(status: BayStatus): "success" | "warning" | "danger" {
  switch (status) {
    case BayStatus.Free:
      return "success";
    case BayStatus.Occupied:
      return "warning";
    case BayStatus.Blocked:
      return "danger";
  }
}

export function BaysBoard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState("all");
  const [status, setStatus] = useState("all");

  const baysQuery = useQuery({
    queryKey: ["bays", { pageSize: 100, sortBy: "code" }],
    queryFn: () =>
      baysService.list({ pageSize: 100, sortBy: "code", sortDir: "asc" }),
  });

  const ordersQuery = useQuery({
    queryKey: ["work-orders", { pageSize: 500 }],
    queryFn: () => workOrderService.list({ pageSize: 500, sortBy: "code" }),
  });

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles", { pageSize: 100 }],
    queryFn: () => vehicleService.list({ pageSize: 100, sortBy: "plate" }),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["bays"] });
    await queryClient.invalidateQueries({ queryKey: ["work-orders"] });
  };

  const assignMutation = useMutation({
    mutationFn: ({
      bayId,
      workOrderId,
    }: {
      bayId: WorkshopBay["id"];
      workOrderId: WorkOrder["id"];
    }) => baysService.assign(bayId, workOrderId),
    onSuccess: invalidate,
  });

  const releaseMutation = useMutation({
    mutationFn: (bayId: WorkshopBay["id"]) => baysService.release(bayId),
    onSuccess: invalidate,
  });

  const statusMutation = useMutation({
    mutationFn: ({
      bayId,
      status,
    }: {
      bayId: WorkshopBay["id"];
      status: BayStatus;
    }) => baysService.setStatus(bayId, status),
    onSuccess: invalidate,
  });

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

  const orders = useMemo(
    () =>
      new Map(
        (ordersQuery.data?.items ?? []).map((order) => [order.id, order]),
      ),
    [ordersQuery.data?.items],
  );

  const bays = baysQuery.data?.items ?? [];
  const assignedIds = new Set(
    bays
      .map((bay) => bay.currentWorkOrderId)
      .filter((id): id is WorkOrder["id"] => Boolean(id)),
  );
  const assignable = (ordersQuery.data?.items ?? []).filter(
    (order) => isWorkOrderOpen(order.status) && !assignedIds.has(order.id),
  );

  const busy =
    assignMutation.isPending ||
    releaseMutation.isPending ||
    statusMutation.isPending;
  const actionError =
    assignMutation.error ?? releaseMutation.error ?? statusMutation.error;

  if (baysQuery.isLoading || ordersQuery.isLoading || vehiclesQuery.isLoading) {
    return <LoadingState />;
  }

  if (baysQuery.isError) {
    return <ErrorState onRetry={() => void baysQuery.refetch()} />;
  }

  if (bays.length === 0) {
    return <EmptyState title="Sin bahías" />;
  }

  const stats = bayOccupancy(bays);

  const needle = search.trim().toLowerCase();
  const filteredBays = bays.filter((bay) => {
    if (branchId !== "all" && bay.branchId !== branchId) {
      return false;
    }
    if (status !== "all" && bay.status !== status) {
      return false;
    }
    if (!needle) {
      return true;
    }
    const order = bay.currentWorkOrderId
      ? orders.get(bay.currentWorkOrderId)
      : undefined;
    const vehicle = order ? vehicles.get(order.vehicleId) : undefined;
    return [
      bay.code,
      bay.name,
      order?.code ?? "",
      vehicle?.plate ?? "",
      workOrderBranchName(bay.branchId),
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  return (
    <div className="space-y-3">
      <ListToolbar>
        <ListToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Buscar por bahía, OT o placa"
          ariaLabel="Buscar bahías"
        />
        <Select value={branchId} onValueChange={setBranchId}>
          <SelectTrigger
            className="w-full border-input bg-white/70 shadow-none sm:w-44"
            aria-label="Filtrar por sede"
          >
            <SelectValue placeholder="Sede" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las sedes</SelectItem>
            {CUSTOMER_BRANCHES.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger
            className="w-full border-input bg-white/70 shadow-none sm:w-44"
            aria-label="Filtrar por estado"
          >
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value={BayStatus.Free}>Libre</SelectItem>
            <SelectItem value={BayStatus.Occupied}>Ocupada</SelectItem>
            <SelectItem value={BayStatus.Blocked}>Bloqueada</SelectItem>
          </SelectContent>
        </Select>
      </ListToolbar>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Vehículos en taller"
          value={String(stats.occupied)}
          detail={`${stats.percent}% de capacidad`}
          icon={CarFront}
        />
        <MetricCard
          label="Bahías libres"
          value={String(stats.free)}
          detail={`${stats.capacity} bahías · ${formatBayCapacity(stats)}`}
          icon={CarFront}
        />
        <MetricCard
          label="Bloqueadas"
          value={String(stats.blocked)}
          detail="No aceptan órdenes"
          icon={CarFront}
          emphasis={stats.blocked > 0 ? "danger" : "default"}
        />
      </div>
      {actionError && (
        <ErrorState
          title="No se pudo actualizar la bahía"
          message={
            actionError instanceof Error
              ? actionError.message
              : "La operación no es válida."
          }
        />
      )}
      {filteredBays.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="No hay bahías con los filtros actuales."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredBays.map((bay) => {
            const order = bay.currentWorkOrderId
              ? orders.get(bay.currentWorkOrderId)
              : undefined;
            const vehicle = order ? vehicles.get(order.vehicleId) : undefined;
            return (
              <article key={bay.id} className="min-w-0 glass p-3">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold tabular-nums">{bay.code}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {bay.name} · {workOrderBranchName(bay.branchId)}
                    </p>
                  </div>
                  <StatusBadge variant={bayStatusVariant(bay.status)}>
                    {BAY_STATUS_LABELS[bay.status]}
                  </StatusBadge>
                </div>
                {bay.status === BayStatus.Occupied && (
                  <div className="space-y-2">
                    {order ? (
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() =>
                          void navigate({
                            to: "/taller/ordenes/$id",
                            params: { id: order.id },
                          })
                        }
                      >
                        <p className="text-xs font-semibold tabular-nums">
                          {order.code}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {vehicle ? vehicleDisplayName(vehicle) : order.reason}
                        </p>
                      </button>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">
                        Orden {bay.currentWorkOrderId}
                      </p>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full"
                      disabled={busy}
                      onClick={() => releaseMutation.mutate(bay.id)}
                    >
                      Liberar
                    </Button>
                  </div>
                )}
                {bay.status === BayStatus.Free && (
                  <div className="space-y-2">
                    {assignable.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground">
                        No hay OT disponibles para asignar.
                      </p>
                    ) : (
                      <Select
                        disabled={busy}
                        onValueChange={(value) =>
                          assignMutation.mutate({
                            bayId: bay.id,
                            workOrderId: value as WorkOrder["id"],
                          })
                        }
                      >
                        <SelectTrigger
                          className="h-8 bg-white/70 text-[11px]"
                          aria-label={`Asignar OT a ${bay.code}`}
                        >
                          <SelectValue placeholder="Asignar OT" />
                        </SelectTrigger>
                        <SelectContent>
                          {assignable.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full"
                      disabled={busy}
                      onClick={() =>
                        statusMutation.mutate({
                          bayId: bay.id,
                          status: BayStatus.Blocked,
                        })
                      }
                    >
                      Bloquear
                    </Button>
                  </div>
                )}
                {bay.status === BayStatus.Blocked && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">
                      Bloqueada. No acepta órdenes.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full"
                      disabled={busy}
                      onClick={() =>
                        statusMutation.mutate({
                          bayId: bay.id,
                          status: BayStatus.Free,
                        })
                      }
                    >
                      Desbloquear
                    </Button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
