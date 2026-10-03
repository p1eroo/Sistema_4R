import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { diagnosticStatusVariant } from "@/components/diagnostics/diagnostic-status";
import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DIAGNOSTIC_SEVERITY_LABELS,
  DIAGNOSTIC_STATUS_LABELS,
  DiagnosticSeverity,
  DiagnosticStatus,
  type Diagnostic,
} from "@/domain/diagnostics";
import { asEntityId, type EntityId } from "@/domain/shared";
import { diagnosticService } from "@/mocks/diagnostics/service";

type FindingDraft = {
  readonly id?: EntityId;
  title: string;
  severity: DiagnosticSeverity;
  description: string;
};

function emptyFinding(): FindingDraft {
  return { title: "", severity: DiagnosticSeverity.Medium, description: "" };
}

export function DiagnosticForm({
  workOrderId,
  diagnostic,
}: {
  workOrderId: string;
  diagnostic?: Diagnostic | null;
}) {
  const queryClient = useQueryClient();
  const [summary, setSummary] = useState(diagnostic?.summary ?? "");
  const [recommendation, setRecommendation] = useState(
    diagnostic?.recommendation ?? "",
  );
  const [findings, setFindings] = useState<FindingDraft[]>(
    diagnostic?.findings.length
      ? diagnostic.findings.map((finding) => ({
          id: finding.id,
          title: finding.title,
          severity: finding.severity,
          description: finding.description ?? "",
        }))
      : [emptyFinding()],
  );

  const saveMutation = useMutation({
    mutationFn: () =>
      diagnosticService.upsert({
        workOrderId: asEntityId(workOrderId),
        status: DiagnosticStatus.Completed,
        summary: summary.trim(),
        findings: findings
          .filter((finding) => finding.title.trim())
          .map((finding) => ({
            ...(finding.id ? { id: finding.id } : {}),
            title: finding.title.trim(),
            severity: finding.severity,
            ...(finding.description.trim()
              ? { description: finding.description.trim() }
              : {}),
          })),
        ...(recommendation.trim()
          ? { recommendation: recommendation.trim() }
          : {}),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["diagnostics"] });
    },
  });

  const updateFinding = (index: number, patch: Partial<FindingDraft>) => {
    setFindings((current) =>
      current.map((finding, findingIndex) =>
        findingIndex === index ? { ...finding, ...patch } : finding,
      ),
    );
  };

  return (
    <SectionCard
      title={diagnostic?.id ?? "Nuevo diagnóstico"}
      subtitle="Hallazgos entre recepción y presupuesto"
      action={
        diagnostic ? (
          <StatusBadge variant={diagnosticStatusVariant(diagnostic.status)}>
            {DIAGNOSTIC_STATUS_LABELS[diagnostic.status]}
          </StatusBadge>
        ) : undefined
      }
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          saveMutation.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="diagnostic-summary">Resumen</Label>
          <Textarea
            id="diagnostic-summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            className="bg-white/70"
            placeholder="Describe el diagnóstico…"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold">Hallazgos</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                setFindings((current) => [...current, emptyFinding()])
              }
            >
              Añadir hallazgo
            </Button>
          </div>
          <ul className="space-y-3">
            {findings.map((finding, index) => (
              <li
                key={finding.id ?? `new-${index}`}
                className="space-y-2 rounded-lg border border-border/60 bg-white/50 p-3"
              >
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem]">
                  <Input
                    value={finding.title}
                    onChange={(event) =>
                      updateFinding(index, { title: event.target.value })
                    }
                    placeholder="Título del hallazgo"
                    className="bg-white/70"
                    required
                    aria-label={`Título del hallazgo ${index + 1}`}
                  />
                  <Select
                    value={finding.severity}
                    onValueChange={(value) =>
                      updateFinding(index, {
                        severity: value as DiagnosticSeverity,
                      })
                    }
                  >
                    <SelectTrigger
                      className="h-9 bg-white/70 text-xs"
                      aria-label={`Severidad ${index + 1}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(DiagnosticSeverity).map((severity) => (
                        <SelectItem key={severity} value={severity}>
                          {DIAGNOSTIC_SEVERITY_LABELS[severity]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  value={finding.description}
                  onChange={(event) =>
                    updateFinding(index, {
                      description: event.target.value,
                    })
                  }
                  placeholder="Detalle (opcional)"
                  className="bg-white/70"
                  aria-label={`Detalle del hallazgo ${index + 1}`}
                />
                {findings.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setFindings((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    Quitar
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="diagnostic-recommendation">Recomendación</Label>
          <Textarea
            id="diagnostic-recommendation"
            value={recommendation}
            onChange={(event) => setRecommendation(event.target.value)}
            className="bg-white/70"
            placeholder="Trabajo sugerido…"
          />
        </div>

        {saveMutation.isError && (
          <ErrorState
            title="No se pudo guardar"
            message={
              saveMutation.error instanceof Error
                ? saveMutation.error.message
                : "Revisa los hallazgos."
            }
          />
        )}

        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Guardando…" : "Guardar diagnóstico"}
        </Button>
      </form>
    </SectionCard>
  );
}

export function DiagnosticPanel({ workOrderId }: { workOrderId: string }) {
  const diagnosticQuery = useQuery({
    queryKey: ["diagnostics", "work-order", workOrderId],
    queryFn: async () =>
      (await diagnosticService.getByWorkOrder(asEntityId(workOrderId))) ?? null,
  });

  if (diagnosticQuery.isLoading) {
    return <LoadingState />;
  }

  if (diagnosticQuery.isError) {
    return <ErrorState onRetry={() => void diagnosticQuery.refetch()} />;
  }

  const diagnostic = diagnosticQuery.data;
  if (!diagnostic) {
    return (
      <div className="space-y-3">
        <EmptyState
          title="Sin diagnóstico"
          description="Registra hallazgos para pasar a presupuesto."
        />
        <DiagnosticForm key="new" workOrderId={workOrderId} />
      </div>
    );
  }

  return (
    <DiagnosticForm
      key={diagnostic.updatedAt}
      workOrderId={workOrderId}
      diagnostic={diagnostic}
    />
  );
}
