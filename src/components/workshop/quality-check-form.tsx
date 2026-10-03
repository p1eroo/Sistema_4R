import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";

import { qualityResultVariant } from "@/components/workshop/quality-check-status";
import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { asEntityId } from "@/domain/shared";
import {
  WORK_ORDER_STATUS_LABELS,
  WorkOrderStatus,
} from "@/domain/work-orders";
import {
  QUALITY_CHECK_CATALOG,
  QUALITY_RESULT_LABELS,
  QualityResult,
  createQualityChecklist,
  type QualityCheck,
  type QualityCheckItem,
} from "@/domain/workshop-ops";
import { qualityService } from "@/mocks/workshop-ops/quality-service";
import { workOrderService } from "@/mocks/work-orders/service";

type ItemDraft = {
  id: QualityCheckItem["id"];
  label: string;
  passed: boolean;
  notes: string;
};

function catalogDraft(): ItemDraft[] {
  return QUALITY_CHECK_CATALOG.map((item) => ({
    id: item.id,
    label: item.label,
    passed: true,
    notes: "",
  }));
}

function toItems(
  drafts: readonly ItemDraft[],
  forcePass: boolean,
  rejectNotes: string,
): QualityCheckItem[] {
  if (forcePass) {
    return createQualityChecklist(QUALITY_CHECK_CATALOG.map((item) => item.id));
  }

  const hasFail = drafts.some((item) => !item.passed);
  return drafts.map((item, index) => {
    const failed = hasFail ? !item.passed : index === 0;
    return {
      id: item.id,
      label: item.label,
      passed: !failed,
      ...(failed
        ? { notes: item.notes.trim() || rejectNotes || "Rechazado en QC." }
        : {}),
    };
  });
}

export function QualityCheckForm({
  workOrderId,
  workOrderCode,
  onRecorded,
}: {
  workOrderId: string;
  workOrderCode?: string;
  onRecorded?: () => void;
}) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState(catalogDraft);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const recordMutation = useMutation({
    mutationFn: (payload: { forcePass: boolean }) =>
      qualityService.record(
        asEntityId(workOrderId),
        toItems(items, payload.forcePass, notes.trim()),
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["work-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["quality-checks"] }),
      ]);
      onRecorded?.();
    },
  });

  return (
    <SectionCard
      title="Checklist de calidad"
      subtitle={workOrderCode ?? workOrderId}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="rounded-lg border border-border/60 bg-white/50 p-3"
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`qc-${workOrderId}-${item.id}`}
                  checked={item.passed}
                  onCheckedChange={(checked) => {
                    setItems((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, passed: checked === true }
                          : row,
                      ),
                    );
                  }}
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <Label
                    htmlFor={`qc-${workOrderId}-${item.id}`}
                    className="text-xs font-semibold"
                  >
                    {item.label}
                  </Label>
                  {!item.passed && (
                    <Input
                      value={item.notes}
                      onChange={(event) => {
                        const value = event.target.value;
                        setItems((current) =>
                          current.map((row, rowIndex) =>
                            rowIndex === index ? { ...row, notes: value } : row,
                          ),
                        );
                      }}
                      className="bg-white/70"
                      placeholder="Motivo del fallo"
                    />
                  )}
                </div>
                <StatusBadge variant={item.passed ? "success" : "danger"}>
                  {item.passed ? "OK" : "Falla"}
                </StatusBadge>
              </div>
            </li>
          ))}
        </ul>

        <div className="space-y-1.5">
          <Label htmlFor={`qc-notas-${workOrderId}`}>Notas</Label>
          <Input
            id={`qc-notas-${workOrderId}`}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="bg-white/70"
            placeholder="Observaciones del inspector"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label>Fotos mock</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                setPhotos((current) => [
                  ...current,
                  `qc-${workOrderId}-${current.length + 1}.jpg`,
                ])
              }
            >
              <ImagePlus /> Adjuntar
            </Button>
          </div>
          {photos.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">
              Sin fotos. Las imágenes son solo de prototipo.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {photos.map((photo) => (
                <li
                  key={photo}
                  className="rounded-md border border-dashed border-border px-2 py-1 text-[11px]"
                >
                  {photo}
                </li>
              ))}
            </ul>
          )}
        </div>

        {recordMutation.isError && (
          <ErrorState
            title="No se pudo registrar el QC"
            message={
              recordMutation.error instanceof Error
                ? recordMutation.error.message
                : "Revisa el checklist."
            }
          />
        )}

        {recordMutation.data && (
          <QualityResultSummary
            check={recordMutation.data.check}
            status={recordMutation.data.workOrder.status}
          />
        )}

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={recordMutation.isPending}
            onClick={() => recordMutation.mutate({ forcePass: false })}
          >
            Rechazar
          </Button>
          <Button
            type="button"
            disabled={recordMutation.isPending}
            onClick={() => recordMutation.mutate({ forcePass: true })}
          >
            {recordMutation.isPending ? "Registrando…" : "Aprobar"}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}

export function QualityPanel({ workOrderId }: { workOrderId: string }) {
  const orderQuery = useQuery({
    queryKey: ["work-orders", workOrderId],
    queryFn: async () =>
      (await workOrderService.getById(asEntityId(workOrderId))) ?? null,
  });

  const checkQuery = useQuery({
    queryKey: ["quality-checks", "work-order", workOrderId],
    queryFn: async () =>
      (await qualityService.getByWorkOrder(asEntityId(workOrderId))) ?? null,
  });

  if (orderQuery.isLoading || checkQuery.isLoading) {
    return <LoadingState />;
  }

  if (orderQuery.isError) {
    return <ErrorState onRetry={() => void orderQuery.refetch()} />;
  }

  const order = orderQuery.data;
  if (!order) {
    return <EmptyState title="Orden no encontrada" />;
  }

  if (order.status === WorkOrderStatus.Quality) {
    return (
      <QualityCheckForm workOrderId={order.id} workOrderCode={order.code} />
    );
  }

  return (
    <div className="space-y-3">
      <EmptyState
        title="QC cerrado"
        description={`La orden está en ${WORK_ORDER_STATUS_LABELS[order.status]}.`}
      />
      {checkQuery.data && (
        <QualityResultSummary check={checkQuery.data} status={order.status} />
      )}
    </div>
  );
}

function QualityResultSummary({
  check,
  status,
}: {
  check: QualityCheck;
  status: WorkOrderStatus;
}) {
  return (
    <SectionCard
      title="Resultado"
      subtitle={WORK_ORDER_STATUS_LABELS[status]}
      action={
        <StatusBadge variant={qualityResultVariant(check.result)}>
          {QUALITY_RESULT_LABELS[check.result]}
        </StatusBadge>
      }
    >
      <ul className="space-y-1 text-xs">
        {check.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-2">
            <span>{item.label}</span>
            <span className="text-muted-foreground">
              {item.passed ? "OK" : item.notes || "Falla"}
            </span>
          </li>
        ))}
      </ul>
      {check.result === QualityResult.Fail &&
        check.failureReasons.length > 0 && (
          <p className="mt-3 text-[11px] text-muted-foreground">
            {check.failureReasons.join(" · ")}
          </p>
        )}
    </SectionCard>
  );
}
