import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";

import { CUSTOMER_BRANCHES } from "@/components/customers/customer-list-filters";
import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { ListToolbar } from "@/components/erp/list-toolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EMPTY_WORK_ORDER_FILTERS,
  WORK_ORDER_STATUS_CHIPS,
  filterWorkOrders,
  workOrderBranchName,
  workOrderStatusVariant,
  type WorkOrderListFilters,
  type WorkOrderListRow,
} from "@/components/work-orders/work-order-list-filters";
import { vehicleDisplayName } from "@/domain/vehicles";
import { WORK_ORDER_STATUS_LABELS } from "@/domain/work-orders/status";
import { customerService } from "@/mocks/customers/service";
import { vehicleService } from "@/mocks/vehicles/service";
import { workOrderService } from "@/mocks/work-orders/service";
import { cn } from "@/lib/utils";

export function WorkOrderList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<WorkOrderListFilters>(
    EMPTY_WORK_ORDER_FILTERS,
  );

  const ordersQuery = useQuery({
    queryKey: ["work-orders", { pageSize: 200, sortBy: "code" }],
    queryFn: () =>
      workOrderService.list({ pageSize: 200, sortBy: "code", sortDir: "desc" }),
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

  const rows = useMemo(() => {
    const customers = new Map(
      (customersQuery.data?.items ?? []).map((customer) => [
        customer.id,
        customer.displayName,
      ]),
    );
    const vehicles = new Map(
      (vehiclesQuery.data?.items ?? []).map((vehicle) => [vehicle.id, vehicle]),
    );

    const items: WorkOrderListRow[] = (ordersQuery.data?.items ?? []).map(
      (order) => {
        const vehicle = vehicles.get(order.vehicleId);
        return {
          id: order.id,
          code: order.code,
          status: order.status,
          customerName: customers.get(order.customerId) ?? order.customerId,
          plate: vehicle?.plate ?? "—",
          vehicleLabel: vehicle ? vehicleDisplayName(vehicle) : order.vehicleId,
          branchId: order.branchId,
          reason: order.reason,
        };
      },
    );

    return filterWorkOrders(items, filters);
  }, [
    customersQuery.data?.items,
    filters,
    ordersQuery.data?.items,
    vehiclesQuery.data?.items,
  ]);

  const updateFilter = <K extends keyof WorkOrderListFilters>(
    key: K,
    value: WorkOrderListFilters[K],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const loading =
    ordersQuery.isLoading ||
    customersQuery.isLoading ||
    vehiclesQuery.isLoading;
  const errored =
    ordersQuery.isError || customersQuery.isError || vehiclesQuery.isError;

  return (
    <div className="space-y-4">
      <ListToolbar className="sm:flex-col sm:items-stretch">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Buscar por código o placa"
              className="border-input bg-white/70 shadow-none pl-9"
              aria-label="Buscar órdenes"
            />
          </div>
          <Select
            value={filters.branchId}
            onValueChange={(value) => updateFilter("branchId", value)}
          >
            <SelectTrigger className="w-full border-input bg-white/70 shadow-none sm:w-48">
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
          <Button onClick={() => void navigate({ to: "/taller/recepcion" })}>
            <Plus /> Nueva orden
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {WORK_ORDER_STATUS_CHIPS.map((chip) => {
            const active = filters.status === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => updateFilter("status", chip.id)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[11px] font-semibold",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-white/70 text-muted-foreground",
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </ListToolbar>

      <SectionCard
        title="Órdenes de trabajo"
        subtitle="Flujo operativo del taller"
        action={
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {rows.length} registros
          </span>
        }
      >
        {loading && <LoadingState variant="table" rows={6} />}
        {errored && (
          <ErrorState
            onRetry={() => {
              void ordersQuery.refetch();
              void customersQuery.refetch();
              void vehiclesQuery.refetch();
            }}
          />
        )}
        {!loading && !errored && rows.length === 0 && (
          <EmptyState
            title="Sin órdenes"
            description="No hay resultados con los filtros actuales."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => void navigate({ to: "/taller/recepcion" })}
              >
                Abrir recepción
              </Button>
            }
          />
        )}
        {!loading && !errored && rows.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead className="hidden md:table-cell">Motivo</TableHead>
                <TableHead className="hidden sm:table-cell">Sede</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer"
                  onClick={() =>
                    void navigate({
                      to: "/taller/ordenes/$id",
                      params: { id: order.id },
                    })
                  }
                >
                  <TableCell>
                    <span className="text-xs font-bold tabular-nums">
                      {order.code}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-semibold">
                    {order.customerName}
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-semibold">{order.plate}</p>
                    <p className="hidden text-[11px] text-muted-foreground lg:block">
                      {order.vehicleLabel}
                    </p>
                  </TableCell>
                  <TableCell className="hidden max-w-48 truncate text-xs md:table-cell">
                    {order.reason}
                  </TableCell>
                  <TableCell className="hidden text-xs sm:table-cell">
                    {workOrderBranchName(order.branchId)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={workOrderStatusVariant(order.status)}>
                      {WORK_ORDER_STATUS_LABELS[order.status]}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
}
