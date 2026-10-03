import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";

import { solesToMoney } from "@/components/estimates/estimate-money";
import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import { ErrorState, LoadingState } from "@/components/erp/data-states";
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
  calculateEstimateTotals,
  ESTIMATE_LINE_KIND_LABELS,
  ESTIMATE_STATUS_LABELS,
  EstimateLineKind,
  EstimateStatus,
  type Estimate,
  type EstimateLine,
} from "@/domain/estimates";
import { asEntityId, formatMoney, type EntityId } from "@/domain/shared";
import { estimateService } from "@/mocks/estimates/service";

type DraftLine = {
  id: EntityId;
  kind: EstimateLineKind;
  name: string;
  quantity: string;
  unitPrice: string;
};

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

function emptyLine(): DraftLine {
  return {
    id: asEntityId(`ESTL-${Date.now().toString(36)}`),
    kind: EstimateLineKind.Labor,
    name: "",
    quantity: "1",
    unitPrice: "100",
  };
}

function toLine(draft: DraftLine): EstimateLine {
  return {
    id: draft.id,
    kind: draft.kind,
    name: draft.name.trim() || "Servicio",
    quantity: Math.max(1, Math.floor(Number(draft.quantity) || 1)),
    unitPrice: solesToMoney(draft.unitPrice),
  };
}

export function EstimateReadout({ estimate }: { estimate: Estimate }) {
  const queryClient = useQueryClient();
  const approveMutation = useMutation({
    mutationFn: () =>
      estimateService.updateStatus(estimate.id, EstimateStatus.Approved),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["estimates"] });
    },
  });

  return (
    <SectionCard
      title={estimate.code}
      subtitle={ESTIMATE_STATUS_LABELS[estimate.status]}
      action={
        <StatusBadge variant={estimateStatusVariant(estimate.status)}>
          {ESTIMATE_STATUS_LABELS[estimate.status]}
        </StatusBadge>
      }
    >
      <ul className="divide-y divide-border rounded-lg border border-border">
        {estimate.lines.map((line) => (
          <li
            key={line.id}
            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs"
          >
            <span>
              {line.name} · {ESTIMATE_LINE_KIND_LABELS[line.kind]}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {line.quantity} × {formatMoney(line.unitPrice)}
            </span>
          </li>
        ))}
      </ul>
      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-[11px] text-muted-foreground">Subtotal</dt>
          <dd className="font-semibold tabular-nums">
            {formatMoney(estimate.subtotal)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">Descuento</dt>
          <dd className="font-semibold tabular-nums">
            {formatMoney(estimate.discount)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">IGV</dt>
          <dd className="font-semibold tabular-nums">
            {formatMoney(estimate.igv)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">Total</dt>
          <dd className="font-bold tabular-nums">
            {formatMoney(estimate.total)}
          </dd>
        </div>
      </dl>
      {estimate.status === EstimateStatus.PendingApproval && (
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            disabled={approveMutation.isPending}
            onClick={() => approveMutation.mutate()}
          >
            {approveMutation.isPending ? "Aprobando…" : "Aprobar"}
          </Button>
        </div>
      )}
      {approveMutation.isError && (
        <ErrorState
          title="No se pudo aprobar"
          message={
            approveMutation.error instanceof Error
              ? approveMutation.error.message
              : "Inténtalo de nuevo."
          }
        />
      )}
    </SectionCard>
  );
}

export function EstimateBuilder({
  customerId,
  vehicleId,
  workOrderId,
  onCreated,
}: {
  customerId: EntityId;
  vehicleId: EntityId;
  workOrderId?: EntityId;
  onCreated?: (estimate: Estimate) => void;
}) {
  const queryClient = useQueryClient();
  const [lines, setLines] = useState<DraftLine[]>([emptyLine()]);

  const parsedLines = useMemo(() => lines.map(toLine), [lines]);
  const totals = calculateEstimateTotals(parsedLines);

  const createMutation = useMutation({
    mutationFn: () =>
      estimateService.create({
        customerId,
        vehicleId,
        lines: parsedLines,
        ...(workOrderId !== undefined ? { workOrderId } : {}),
      }),
    onSuccess: async (estimate) => {
      await queryClient.invalidateQueries({ queryKey: ["estimates"] });
      onCreated?.(estimate);
    },
  });

  return (
    <SectionCard
      title="Constructor de presupuesto"
      subtitle="Totales en vivo con el helper de dominio"
    >
      <div className="space-y-3">
        {lines.map((line) => (
          <div
            key={line.id}
            className="grid gap-2 sm:grid-cols-[8rem_1fr_5rem_7rem_auto]"
          >
            <Select
              value={line.kind}
              onValueChange={(value) =>
                setLines((rows) =>
                  rows.map((row) =>
                    row.id === line.id
                      ? { ...row, kind: value as EstimateLineKind }
                      : row,
                  ),
                )
              }
            >
              <SelectTrigger className="bg-background" aria-label="Tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(EstimateLineKind).map((kind) => (
                  <SelectItem key={kind} value={kind}>
                    {ESTIMATE_LINE_KIND_LABELS[kind]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={line.name}
              onChange={(event) =>
                setLines((rows) =>
                  rows.map((row) =>
                    row.id === line.id
                      ? { ...row, name: event.target.value }
                      : row,
                  ),
                )
              }
              placeholder="Descripción libre"
              className="bg-background"
              aria-label="Descripción"
            />
            <Input
              type="number"
              min={1}
              value={line.quantity}
              onChange={(event) =>
                setLines((rows) =>
                  rows.map((row) =>
                    row.id === line.id
                      ? { ...row, quantity: event.target.value }
                      : row,
                  ),
                )
              }
              className="bg-background tabular-nums"
              aria-label="Cantidad"
            />
            <Input
              value={line.unitPrice}
              onChange={(event) =>
                setLines((rows) =>
                  rows.map((row) =>
                    row.id === line.id
                      ? { ...row, unitPrice: event.target.value }
                      : row,
                  ),
                )
              }
              className="bg-background tabular-nums"
              aria-label="Precio unitario"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={lines.length === 1}
              onClick={() =>
                setLines((rows) => rows.filter((row) => row.id !== line.id))
              }
              aria-label="Quitar línea"
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setLines((rows) => [...rows, emptyLine()])}
        >
          <Plus /> Agregar línea
        </Button>
        <dl className="grid gap-2 text-xs sm:grid-cols-4">
          <div>
            <dt className="text-[11px] text-muted-foreground">Subtotal</dt>
            <dd className="font-semibold tabular-nums">
              {formatMoney(totals.subtotal)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Descuento</dt>
            <dd className="font-semibold tabular-nums">
              {formatMoney(totals.discount)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">IGV</dt>
            <dd className="font-semibold tabular-nums">
              {formatMoney(totals.igv)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Total</dt>
            <dd className="font-bold tabular-nums">
              {formatMoney(totals.total)}
            </dd>
          </div>
        </dl>
        {createMutation.isError && (
          <ErrorState
            title="No se pudo guardar el presupuesto"
            message={
              createMutation.error instanceof Error
                ? createMutation.error.message
                : "Revisa las líneas e inténtalo de nuevo."
            }
          />
        )}
        <div className="flex justify-end">
          <Button
            type="button"
            disabled={createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending ? "Guardando…" : "Guardar presupuesto"}
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

export function EstimatePanel({
  customerId,
  vehicleId,
  workOrderId,
}: {
  customerId: EntityId;
  vehicleId: EntityId;
  workOrderId?: EntityId;
}) {
  const estimatesQuery = useQuery({
    queryKey: ["estimates", { pageSize: 200 }],
    queryFn: () => estimateService.list({ pageSize: 200, sortBy: "code" }),
  });

  if (estimatesQuery.isLoading) {
    return <LoadingState />;
  }

  if (estimatesQuery.isError) {
    return <ErrorState onRetry={() => void estimatesQuery.refetch()} />;
  }

  const linked = workOrderId
    ? estimatesQuery.data?.items.find(
        (estimate) => estimate.workOrderId === workOrderId,
      )
    : undefined;

  if (linked) {
    return <EstimateReadout estimate={linked} />;
  }

  return (
    <EstimateBuilder
      customerId={customerId}
      vehicleId={vehicleId}
      {...(workOrderId !== undefined ? { workOrderId } : {})}
    />
  );
}
