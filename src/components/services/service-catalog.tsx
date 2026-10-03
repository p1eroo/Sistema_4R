import { ListToolbar } from "@/components/erp/list-toolbar";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search } from "lucide-react";

import {
  DASHBOARD_SERVICE_RANKING,
  formatServiceDuration,
  isRankingService,
  sortServicesForCatalog,
} from "@/components/services/service-catalog-ranking";
import { ServiceForm } from "@/components/services/service-form";
import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SERVICE_CATEGORY_LABELS,
  SERVICE_STATUS_LABELS,
  ServiceStatus,
  type ServiceCreateValues,
  type ServiceItem,
} from "@/domain/services";
import { formatMoney } from "@/domain/shared";
import { serviceCatalog } from "@/mocks/services/service";

export function ServiceCatalog() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<"create" | ServiceItem | null>(null);

  const servicesQuery = useQuery({
    queryKey: ["services", search.trim()],
    queryFn: () =>
      serviceCatalog.list({
        pageSize: 100,
        sortBy: "name",
        ...(search.trim() ? { search: search.trim() } : {}),
      }),
  });

  const rows = useMemo(
    () => sortServicesForCatalog(servicesQuery.data?.items ?? []),
    [servicesQuery.data?.items],
  );
  const rankingRows = useMemo(
    () =>
      DASHBOARD_SERVICE_RANKING.map((name) =>
        rows.find((service) => service.name === name),
      ).filter((service): service is ServiceItem => service !== undefined),
    [rows],
  );

  const saveMutation = useMutation({
    mutationFn: async (values: ServiceCreateValues) => {
      if (dialog && dialog !== "create") {
        return serviceCatalog.update(dialog.id, {
          price: values.price,
          estimatedMinutes: values.estimatedMinutes,
          ...(values.description !== undefined
            ? { description: values.description }
            : {}),
        });
      }
      return serviceCatalog.create(values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["services"] });
      window.setTimeout(() => setDialog(null), 0);
    },
  });

  return (
    <div className="space-y-4">
      <ListToolbar>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o código"
            className="pl-9"
            aria-label="Buscar servicios"
          />
        </div>
        <Button onClick={() => setDialog("create")}>
          <Plus /> Nuevo servicio
        </Button>
      </ListToolbar>

      {rankingRows.length > 0 ? (
        <SectionCard
          title="Ranking del taller"
          subtitle="Mismos nombres que el dashboard"
        >
          <div className="divide-y divide-border/60">
            {rankingRows.map((service, index) => (
              <div
                key={service.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <span className="truncate text-xs font-medium">
                  {index + 1}. {service.name}
                </span>
                <StatusBadge variant="info">
                  {formatMoney(service.price)}
                </StatusBadge>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Servicios"
        subtitle="Precio y duración del catálogo de taller"
        action={
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {rows.length} registros
          </span>
        }
      >
        {servicesQuery.isLoading && <LoadingState variant="table" rows={6} />}
        {servicesQuery.isError && (
          <ErrorState onRetry={() => void servicesQuery.refetch()} />
        )}
        {servicesQuery.isSuccess && rows.length === 0 && (
          <EmptyState
            title="Sin servicios"
            description="No hay resultados con la búsqueda actual."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialog("create")}
              >
                Registrar servicio
              </Button>
            }
          />
        )}
        {servicesQuery.isSuccess && rows.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Servicio</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Categoría
                </TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead className="hidden md:table-cell">Estado</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Editar</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((service) => (
                <TableRow
                  key={service.id}
                  className="cursor-pointer"
                  onClick={() => setDialog(service)}
                >
                  <TableCell>
                    <p className="truncate text-xs font-semibold">
                      {service.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {service.code}
                      {isRankingService(service.name) ? " · Ranking" : ""}
                    </p>
                  </TableCell>
                  <TableCell className="hidden text-xs sm:table-cell">
                    {SERVICE_CATEGORY_LABELS[service.category]}
                  </TableCell>
                  <TableCell className="text-xs tabular-nums">
                    {formatServiceDuration(service.estimatedMinutes)}
                  </TableCell>
                  <TableCell className="text-xs tabular-nums">
                    {formatMoney(service.price)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <StatusBadge
                      variant={
                        service.status === ServiceStatus.Active
                          ? "success"
                          : "neutral"
                      }
                    >
                      {SERVICE_STATUS_LABELS[service.status]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      aria-label={`Editar ${service.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setDialog(service);
                      }}
                    >
                      <Pencil />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDialog(null);
            saveMutation.reset();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialog === "create" ? "Nuevo servicio" : "Editar servicio"}
            </DialogTitle>
            <DialogDescription>
              {dialog === "create"
                ? "Alta al catálogo de taller."
                : "Actualiza precio o duración. El nombre del ranking no cambia."}
            </DialogDescription>
          </DialogHeader>
          {saveMutation.isError && (
            <ErrorState
              title="No se pudo guardar"
              message={
                saveMutation.error instanceof Error
                  ? saveMutation.error.message
                  : "Revisa los datos e inténtalo de nuevo."
              }
            />
          )}
          {dialog ? (
            <ServiceForm
              key={dialog === "create" ? "create" : dialog.id}
              {...(dialog === "create" ? {} : { service: dialog })}
              mode={dialog === "create" ? "create" : "edit"}
              submitting={saveMutation.isPending}
              onSubmit={async (values) => {
                await saveMutation.mutateAsync(values);
              }}
              onCancel={() => setDialog(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
