import { ListToolbar } from "@/components/erp/list-toolbar";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Plus, Search } from "lucide-react";

import { PromoEditor } from "@/components/pricing/promo-editor";
import { formatDiscountLabel } from "@/components/pricing/promo-preview";
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
  PROMOTION_SCOPE_LABELS,
  PROMOTION_STATUS_LABELS,
  PromotionStatus,
  type Promotion,
  type PromotionCreateValues,
} from "@/domain/pricing";
import { pricingService } from "@/mocks/pricing/service";

export function PromoList({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);

  const listQuery = {
    pageSize: 100,
    sortBy: "name",
    ...(search.trim() ? { search: search.trim() } : {}),
  };

  const promosQuery = useQuery({
    queryKey: ["pricing", "promotions", listQuery],
    queryFn: () => pricingService.list(listQuery),
  });

  const rows = useMemo(() => {
    const items = promosQuery.data?.items ?? [];
    if (status === "all") {
      return items;
    }
    return items.filter((promo) => promo.status === status);
  }, [promosQuery.data?.items, status]);

  const createMutation = useMutation({
    mutationFn: (values: PromotionCreateValues) =>
      pricingService.create(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pricing"] });
      window.setTimeout(() => setOpen(false), 0);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: Promotion["id"]) => pricingService.archive(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pricing"] });
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
            placeholder="Buscar por código o nombre"
            className="pl-9"
            aria-label="Buscar promociones"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value={PromotionStatus.Active}>Activas</SelectItem>
            <SelectItem value={PromotionStatus.Inactive}>Inactivas</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setOpen(true)}>
          <Plus /> Nueva promoción
        </Button>
      </ListToolbar>

      <SectionCard
        title={title}
        subtitle={subtitle}
        action={
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {rows.length} registros
          </span>
        }
      >
        {promosQuery.isLoading && <LoadingState variant="table" rows={5} />}
        {promosQuery.isError && (
          <ErrorState onRetry={() => void promosQuery.refetch()} />
        )}
        {promosQuery.isSuccess && rows.length === 0 && (
          <EmptyState
            title="Sin promociones"
            description="No hay resultados con los filtros actuales."
            action={
              <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                Crear promoción
              </Button>
            }
          />
        )}
        {promosQuery.isSuccess && rows.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Promoción</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead className="hidden sm:table-cell">Alcance</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Archivar</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell>
                    <p className="truncate text-xs font-semibold">
                      {promo.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {promo.code}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs tabular-nums">
                    {formatDiscountLabel(promo.discount)}
                  </TableCell>
                  <TableCell className="hidden text-xs sm:table-cell">
                    {PROMOTION_SCOPE_LABELS[promo.scope]}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      variant={
                        promo.status === PromotionStatus.Active
                          ? "success"
                          : "neutral"
                      }
                    >
                      {PROMOTION_STATUS_LABELS[promo.status]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    {promo.status === PromotionStatus.Active ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        aria-label={`Desactivar ${promo.name}`}
                        disabled={archiveMutation.isPending}
                        onClick={() => archiveMutation.mutate(promo.id)}
                      >
                        <Archive />
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            createMutation.reset();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva promoción</DialogTitle>
            <DialogDescription>
              Vigencia, alcance y preview del precio con applyDiscount.
            </DialogDescription>
          </DialogHeader>
          {createMutation.isError && (
            <ErrorState
              title="No se pudo activar"
              message={
                createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "Revisa los datos e inténtalo de nuevo."
              }
            />
          )}
          <PromoEditor
            submitting={createMutation.isPending}
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
            }}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
