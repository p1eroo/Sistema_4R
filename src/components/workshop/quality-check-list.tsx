import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { QualityCheckForm } from "@/components/workshop/quality-check-form";
import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { ListToolbar, ListToolbarSearch } from "@/components/erp/list-toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { vehicleDisplayName } from "@/domain/vehicles";
import {
  WORK_ORDER_STATUS_LABELS,
  WorkOrderStatus,
} from "@/domain/work-orders";
import { customerService } from "@/mocks/customers/service";
import { vehicleService } from "@/mocks/vehicles/service";
import { workOrderService } from "@/mocks/work-orders/service";
import { workOrderStatusVariant } from "@/components/work-orders/work-order-list-filters";
import { cn } from "@/lib/utils";

export function QualityCheckList() {
  const [selectedId, setSelectedId] = useState<string>();
  const [search, setSearch] = useState("");

  const pendingQuery = useQuery({
    queryKey: ["work-orders", "quality", { pageSize: 100 }],
    queryFn: () =>
      workOrderService.listByStatus(WorkOrderStatus.Quality, {
        pageSize: 100,
        sortBy: "code",
      }),
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

  const customers = useMemo(
    () =>
      new Map(
        (customersQuery.data?.items ?? []).map((customer) => [
          customer.id,
          customer.displayName,
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

  const items = pendingQuery.data?.items ?? [];
  const rows = useMemo(() => {
    const all = pendingQuery.data?.items ?? [];
    const needle = search.trim().toLowerCase();
    if (!needle) {
      return all;
    }
    return all.filter((order) => {
      const vehicle = vehicles.get(order.vehicleId);
      return [
        order.code,
        order.reason,
        customers.get(order.customerId) ?? "",
        vehicle ? vehicleDisplayName(vehicle) : "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [customers, pendingQuery.data?.items, search, vehicles]);
  const selected = rows.find((order) => order.id === selectedId) ?? rows[0];
  const loading =
    pendingQuery.isLoading ||
    customersQuery.isLoading ||
    vehiclesQuery.isLoading;

  return (
    <div className="space-y-3">
      <ListToolbar>
        <ListToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Buscar por orden, cliente o vehículo"
          ariaLabel="Buscar pendientes de QC"
        />
      </ListToolbar>
      <SectionCard
        title="Pendientes de QC"
        subtitle={`${rows.length} órdenes en control`}
      >
        {loading && <LoadingState variant="table" rows={4} />}
        {pendingQuery.isError && (
          <ErrorState onRetry={() => void pendingQuery.refetch()} />
        )}
        {!loading && !pendingQuery.isError && items.length === 0 && (
          <EmptyState
            title="Sin pendientes"
            description="No hay órdenes en control de calidad."
          />
        )}
        {!loading &&
          !pendingQuery.isError &&
          items.length > 0 &&
          rows.length === 0 && (
            <EmptyState
              title="Sin resultados"
              description="No hay pendientes con los filtros actuales."
            />
          )}
        {!loading && !pendingQuery.isError && rows.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Orden</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((order) => {
                const vehicle = vehicles.get(order.vehicleId);
                return (
                  <TableRow
                    key={order.id}
                    className={cn(
                      "cursor-pointer",
                      selected?.id === order.id && "bg-primary/5",
                    )}
                    onClick={() => setSelectedId(order.id)}
                  >
                    <TableCell className="font-semibold tabular-nums">
                      <Link
                        to="/taller/ordenes/$id"
                        params={{ id: order.id }}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {order.code}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {customers.get(order.customerId) ?? order.customerId}
                    </TableCell>
                    <TableCell>
                      {vehicle ? vehicleDisplayName(vehicle) : order.vehicleId}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        variant={workOrderStatusVariant(order.status)}
                      >
                        {WORK_ORDER_STATUS_LABELS[order.status]}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      {selected && (
        <QualityCheckForm
          key={selected.id}
          workOrderId={selected.id}
          workOrderCode={selected.code}
          onRecorded={() => {
            if (selectedId === selected.id) {
              setSelectedId(undefined);
            }
          }}
        />
      )}
    </div>
  );
}
