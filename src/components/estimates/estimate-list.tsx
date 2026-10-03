import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { EstimateReadout } from "@/components/estimates/estimate-builder";
import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ESTIMATE_STATUS_LABELS, EstimateStatus } from "@/domain/estimates";
import { formatMoney } from "@/domain/shared";
import { customerService } from "@/mocks/customers/service";
import { estimateService } from "@/mocks/estimates/service";
import { vehicleService } from "@/mocks/vehicles/service";

function estimateStatusVariant(
  status: EstimateStatus,
): "info" | "success" | "warning" | "danger" | "neutral" {
  switch (status) {
    case EstimateStatus.Approved:
      return "success";
    case EstimateStatus.PendingApproval:
      return "warning";
    case EstimateStatus.Rejected:
      return "danger";
    default:
      return "neutral";
  }
}

export function EstimateList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const estimatesQuery = useQuery({
    queryKey: ["estimates", { pageSize: 200, sortBy: "code" }],
    queryFn: () =>
      estimateService.list({ pageSize: 200, sortBy: "code", sortDir: "asc" }),
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

  const approveMutation = useMutation({
    mutationFn: (id: Parameters<typeof estimateService.updateStatus>[0]) =>
      estimateService.updateStatus(id, EstimateStatus.Approved),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["estimates"] });
    },
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

  const plates = useMemo(
    () =>
      new Map(
        (vehiclesQuery.data?.items ?? []).map((vehicle) => [
          vehicle.id,
          vehicle.plate,
        ]),
      ),
    [vehiclesQuery.data?.items],
  );

  const items = estimatesQuery.data?.items ?? [];
  const rows = useMemo(() => {
    const all = estimatesQuery.data?.items ?? [];
    const needle = search.trim().toLowerCase();
    return all.filter((estimate) => {
      if (status !== "all" && estimate.status !== status) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return [
        estimate.code,
        customers.get(estimate.customerId) ?? "",
        plates.get(estimate.vehicleId) ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [customers, estimatesQuery.data?.items, plates, search, status]);
  const pending = rows.filter(
    (estimate) => estimate.status === EstimateStatus.PendingApproval,
  );
  const featured = pending[0] ?? rows[0];

  const loading =
    estimatesQuery.isLoading ||
    customersQuery.isLoading ||
    vehiclesQuery.isLoading;

  return (
    <div className="space-y-4">
      <ListToolbar>
        <ListToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Buscar por código, cliente o placa"
          ariaLabel="Buscar presupuestos"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger
            className="w-full border-input bg-white/70 shadow-none sm:w-48"
            aria-label="Filtrar por estado"
          >
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value={EstimateStatus.Draft}>Borrador</SelectItem>
            <SelectItem value={EstimateStatus.PendingApproval}>
              Pendiente de aprobación
            </SelectItem>
            <SelectItem value={EstimateStatus.Approved}>Aprobado</SelectItem>
            <SelectItem value={EstimateStatus.Rejected}>Rechazado</SelectItem>
            <SelectItem value={EstimateStatus.Expired}>Vencido</SelectItem>
          </SelectContent>
        </Select>
      </ListToolbar>

      <SectionCard
        title="Presupuestos"
        subtitle={`${rows.length} registros · ${pending.length} pendientes de aprobación`}
      >
        {loading && <LoadingState variant="table" rows={6} />}
        {estimatesQuery.isError && (
          <ErrorState onRetry={() => void estimatesQuery.refetch()} />
        )}
        {!loading && !estimatesQuery.isError && items.length === 0 && (
          <EmptyState title="Sin presupuestos" />
        )}
        {!loading &&
          !estimatesQuery.isError &&
          items.length > 0 &&
          rows.length === 0 && (
            <EmptyState
              title="Sin resultados"
              description="No hay presupuestos con los filtros actuales."
            />
          )}
        {!loading && !estimatesQuery.isError && rows.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden sm:table-cell">Placa</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((estimate) => (
                <TableRow
                  key={estimate.id}
                  className={
                    estimate.workOrderId ? "cursor-pointer" : undefined
                  }
                  onClick={() => {
                    if (estimate.workOrderId) {
                      void navigate({
                        to: "/taller/ordenes/$id",
                        params: { id: estimate.workOrderId },
                      });
                    }
                  }}
                >
                  <TableCell className="text-xs font-bold tabular-nums">
                    {estimate.code}
                  </TableCell>
                  <TableCell className="text-xs font-semibold">
                    {customers.get(estimate.customerId) ?? estimate.customerId}
                  </TableCell>
                  <TableCell className="hidden text-xs sm:table-cell">
                    {plates.get(estimate.vehicleId) ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs font-semibold tabular-nums">
                    {formatMoney(estimate.total)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      variant={estimateStatusVariant(estimate.status)}
                    >
                      {ESTIMATE_STATUS_LABELS[estimate.status]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    {estimate.status === EstimateStatus.PendingApproval && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={approveMutation.isPending}
                        onClick={(event) => {
                          event.stopPropagation();
                          approveMutation.mutate(estimate.id);
                        }}
                      >
                        Aprobar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      {featured && !loading && <EstimateReadout estimate={featured} />}
    </div>
  );
}
