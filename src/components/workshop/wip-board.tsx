import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { CUSTOMER_BRANCHES } from "@/components/customers/customer-list-filters";
import { StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { ListToolbar, ListToolbarSearch } from "@/components/erp/list-toolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { vehicleDisplayName } from "@/domain/vehicles";
import type { WorkOrder } from "@/domain/work-orders";
import {
  WORK_ORDER_STATUS_LABELS,
  WorkOrderStatus,
} from "@/domain/work-orders/status";
import { WORK_ORDER_TRANSITIONS } from "@/domain/work-orders/transitions";
import { vehicleService } from "@/mocks/vehicles/service";
import { wipService } from "@/mocks/workshop-ops/bays-service";
import {
  workOrderBranchName,
  workOrderStatusVariant,
} from "@/components/work-orders/work-order-list-filters";

const COLUMNS = [
  WorkOrderStatus.Diagnosis,
  WorkOrderStatus.InRepair,
  WorkOrderStatus.Quality,
  WorkOrderStatus.Ready,
] as const;

function daysOpen(openedAt: string): string {
  const days = Math.max(
    0,
    Math.floor((Date.now() - Date.parse(openedAt)) / 86_400_000),
  );
  return `${days}d`;
}

export function WipBoard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState("all");

  const boardQuery = useQuery({
    queryKey: ["wip", "board"],
    queryFn: () => wipService.getBoard(),
  });

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles", { pageSize: 100 }],
    queryFn: () => vehicleService.list({ pageSize: 100, sortBy: "plate" }),
  });

  const moveMutation = useMutation({
    mutationFn: ({
      workOrderId,
      status,
    }: {
      workOrderId: WorkOrder["id"];
      status: WorkOrderStatus;
    }) => wipService.moveStatus(workOrderId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["wip"] });
      await queryClient.invalidateQueries({ queryKey: ["work-orders"] });
    },
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

  if (boardQuery.isLoading || vehiclesQuery.isLoading) {
    return <LoadingState />;
  }

  if (boardQuery.isError) {
    return <ErrorState onRetry={() => void boardQuery.refetch()} />;
  }

  const board = boardQuery.data;
  if (!board) {
    return <EmptyState title="Sin tablero" />;
  }

  const needle = search.trim().toLowerCase();
  const matches = (order: WorkOrder): boolean => {
    if (branchId !== "all" && order.branchId !== branchId) {
      return false;
    }
    if (!needle) {
      return true;
    }
    const vehicle = vehicles.get(order.vehicleId);
    return [
      order.code,
      order.reason,
      vehicle?.plate ?? "",
      vehicle ? vehicleDisplayName(vehicle) : "",
      workOrderBranchName(order.branchId),
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  };

  return (
    <div className="space-y-3">
      <ListToolbar>
        <ListToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Buscar por código, placa o vehículo"
          ariaLabel="Buscar en trabajos en proceso"
        />
        <Select value={branchId} onValueChange={setBranchId}>
          <SelectTrigger
            className="w-full border-input bg-white/70 shadow-none sm:w-48"
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
      </ListToolbar>
      {moveMutation.isError && (
        <ErrorState
          title="No se pudo mover la orden"
          message={
            moveMutation.error instanceof Error
              ? moveMutation.error.message
              : "La transición no es válida."
          }
        />
      )}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((status) => {
          const cards = board[status].filter(matches);
          return (
            <section key={status} className="min-w-0 glass p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <StatusBadge variant={workOrderStatusVariant(status)}>
                  {WORK_ORDER_STATUS_LABELS[status]}
                </StatusBadge>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {cards.length}
                </span>
              </div>
              {cards.length === 0 ? (
                <EmptyState
                  title="Sin órdenes"
                  description="Esta columna está vacía."
                  className="py-8"
                />
              ) : (
                <ul className="space-y-2">
                  {cards.map((order) => {
                    const vehicle = vehicles.get(order.vehicleId);
                    const destinations = WORK_ORDER_TRANSITIONS[order.status];
                    return (
                      <li
                        key={order.id}
                        className="rounded-lg border border-border/60 bg-white/50 p-3"
                      >
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
                          <p className="text-xs font-bold tabular-nums">
                            {order.code}
                          </p>
                          <p className="mt-1 text-xs font-semibold">
                            {vehicle?.plate ?? "—"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {vehicle
                              ? vehicleDisplayName(vehicle)
                              : order.reason}
                          </p>
                          <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">
                            {daysOpen(order.openedAt)} en taller
                          </p>
                        </button>
                        {destinations.length > 0 && (
                          <div className="mt-2">
                            <Select
                              onValueChange={(value) =>
                                moveMutation.mutate({
                                  workOrderId: order.id,
                                  status: value as WorkOrderStatus,
                                })
                              }
                            >
                              <SelectTrigger
                                className="h-8 bg-white/70 text-[11px]"
                                aria-label={`Mover ${order.code}`}
                              >
                                <SelectValue placeholder="Mover a" />
                              </SelectTrigger>
                              <SelectContent>
                                {destinations.map((next) => (
                                  <SelectItem key={next} value={next}>
                                    {WORK_ORDER_STATUS_LABELS[next]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
