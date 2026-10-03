import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

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
  INSPECTION_STATUS_LABELS,
  inspectionStatusVariant,
} from "@/components/inspections/inspection-status";
import { InspectionStatus, inspectionDamageCount } from "@/domain/inspections";
import { vehicleDisplayName } from "@/domain/vehicles";
import { inspectionService } from "@/mocks/inspections/service";
import { vehicleService } from "@/mocks/vehicles/service";

export function InspectionList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const inspectionsQuery = useQuery({
    queryKey: ["inspections", { pageSize: 100, sortBy: "id" }],
    queryFn: () =>
      inspectionService.list({
        pageSize: 100,
        sortBy: "id",
        sortDir: "asc",
      }),
  });

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles", { pageSize: 100 }],
    queryFn: () => vehicleService.list({ pageSize: 100, sortBy: "plate" }),
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

  const items = inspectionsQuery.data?.items ?? [];
  const rows = useMemo(() => {
    const all = inspectionsQuery.data?.items ?? [];
    const needle = search.trim().toLowerCase();
    return all.filter((inspection) => {
      if (status !== "all" && inspection.status !== status) {
        return false;
      }
      if (!needle) {
        return true;
      }
      const vehicle = vehicles.get(inspection.vehicleId);
      return [
        inspection.id,
        vehicle?.plate ?? "",
        vehicle ? vehicleDisplayName(vehicle) : "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [inspectionsQuery.data?.items, search, status, vehicles]);

  const loading = inspectionsQuery.isLoading || vehiclesQuery.isLoading;

  return (
    <div className="space-y-4">
      <ListToolbar>
        <ListToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Buscar por código, placa o vehículo"
          ariaLabel="Buscar inspecciones"
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
            <SelectItem value={InspectionStatus.Pending}>Pendiente</SelectItem>
            <SelectItem value={InspectionStatus.InProgress}>
              En curso
            </SelectItem>
            <SelectItem value={InspectionStatus.Completed}>
              Completada
            </SelectItem>
          </SelectContent>
        </Select>
      </ListToolbar>

      <SectionCard title="Inspecciones" subtitle={`${rows.length} registros`}>
        {loading && <LoadingState variant="table" rows={4} />}
        {inspectionsQuery.isError && (
          <ErrorState onRetry={() => void inspectionsQuery.refetch()} />
        )}
        {!loading && !inspectionsQuery.isError && items.length === 0 && (
          <EmptyState title="Sin inspecciones" />
        )}
        {!loading &&
          !inspectionsQuery.isError &&
          items.length > 0 &&
          rows.length === 0 && (
            <EmptyState
              title="Sin resultados"
              description="No hay inspecciones con los filtros actuales."
            />
          )}
        {!loading && !inspectionsQuery.isError && rows.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Daños</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((inspection) => {
                const vehicle = vehicles.get(inspection.vehicleId);
                return (
                  <TableRow
                    key={inspection.id}
                    className="cursor-pointer"
                    onClick={() =>
                      void navigate({
                        to: "/taller/inspecciones/$id",
                        params: { id: inspection.id },
                      })
                    }
                  >
                    <TableCell className="text-xs font-bold tabular-nums">
                      {inspection.id}
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-semibold">
                        {vehicle?.plate ?? "—"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {vehicle
                          ? vehicleDisplayName(vehicle)
                          : inspection.vehicleId}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs tabular-nums">
                      {inspectionDamageCount(inspection)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        variant={inspectionStatusVariant(inspection.status)}
                      >
                        {INSPECTION_STATUS_LABELS[inspection.status]}
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
