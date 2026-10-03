import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { diagnosticStatusVariant } from "@/components/diagnostics/diagnostic-status";
import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DIAGNOSTIC_STATUS_LABELS,
  DiagnosticStatus,
} from "@/domain/diagnostics";
import { diagnosticService } from "@/mocks/diagnostics/service";
import { workOrderService } from "@/mocks/work-orders/service";

export function DiagnosticList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const diagnosticsQuery = useQuery({
    queryKey: ["diagnostics", { pageSize: 100, sortBy: "updatedAt" }],
    queryFn: () =>
      diagnosticService.list({
        pageSize: 100,
        sortBy: "updatedAt",
        sortDir: "desc",
      }),
  });

  const ordersQuery = useQuery({
    queryKey: ["work-orders", { pageSize: 500 }],
    queryFn: () => workOrderService.list({ pageSize: 500, sortBy: "code" }),
  });

  const orders = useMemo(
    () =>
      new Map(
        (ordersQuery.data?.items ?? []).map((order) => [order.id, order]),
      ),
    [ordersQuery.data?.items],
  );

  const items = diagnosticsQuery.data?.items ?? [];
  const rows = useMemo(() => {
    const all = diagnosticsQuery.data?.items ?? [];
    const needle = search.trim().toLowerCase();
    return all.filter((diagnostic) => {
      if (status !== "all" && diagnostic.status !== status) {
        return false;
      }
      if (!needle) {
        return true;
      }
      const order = orders.get(diagnostic.workOrderId);
      return [diagnostic.id, order?.code ?? "", diagnostic.summary]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [diagnosticsQuery.data?.items, orders, search, status]);

  const loading = diagnosticsQuery.isLoading || ordersQuery.isLoading;

  return (
    <div className="space-y-4">
      <ListToolbar>
        <ListToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Buscar por código, orden o resumen"
          ariaLabel="Buscar diagnósticos"
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
            <SelectItem value={DiagnosticStatus.Draft}>Borrador</SelectItem>
            <SelectItem value={DiagnosticStatus.Completed}>
              Completado
            </SelectItem>
            <SelectItem value={DiagnosticStatus.Reviewed}>Revisado</SelectItem>
          </SelectContent>
        </Select>
      </ListToolbar>

      <SectionCard title="Diagnósticos" subtitle={`${rows.length} registros`}>
        {loading && <LoadingState variant="table" rows={4} />}
        {diagnosticsQuery.isError && (
          <ErrorState onRetry={() => void diagnosticsQuery.refetch()} />
        )}
        {!loading && !diagnosticsQuery.isError && items.length === 0 && (
          <EmptyState title="Sin diagnósticos" />
        )}
        {!loading &&
          !diagnosticsQuery.isError &&
          items.length > 0 &&
          rows.length === 0 && (
            <EmptyState
              title="Sin resultados"
              description="No hay diagnósticos con los filtros actuales."
            />
          )}
        {!loading && !diagnosticsQuery.isError && rows.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Resumen</TableHead>
                <TableHead>Hallazgos</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((diagnostic) => {
                const order = orders.get(diagnostic.workOrderId);
                return (
                  <TableRow
                    key={diagnostic.id}
                    className="cursor-pointer"
                    onClick={() =>
                      void navigate({
                        to: "/taller/ordenes/$id",
                        params: { id: diagnostic.workOrderId },
                      })
                    }
                  >
                    <TableCell className="text-xs font-bold tabular-nums">
                      {diagnostic.id}
                    </TableCell>
                    <TableCell className="text-xs font-semibold tabular-nums">
                      {order?.code ?? diagnostic.workOrderId}
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate text-xs">
                      {diagnostic.summary}
                    </TableCell>
                    <TableCell className="text-xs tabular-nums">
                      {diagnostic.findings.length}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        variant={diagnosticStatusVariant(diagnostic.status)}
                      >
                        {DIAGNOSTIC_STATUS_LABELS[diagnostic.status]}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
}
