import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DamageLegend } from "@/components/reception/damage-legend";
import { DamageMap } from "@/components/reception/damage-map";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DamageSeverity,
  DamageView,
  findDamageZone,
  type DamageZoneId,
} from "@/domain/inspections";
import type { EntityId } from "@/domain/shared";
import { inspectionService } from "@/mocks/inspections/service";

export function ReceptionInspectionStep({
  receptionId,
}: {
  receptionId?: EntityId;
}) {
  const queryClient = useQueryClient();
  const [view, setView] = useState(DamageView.Front);
  const [severity, setSeverity] = useState(DamageSeverity.Minor);
  const [notes, setNotes] = useState("Rayón");

  const inspectionQuery = useQuery({
    queryKey: ["inspections", "reception", receptionId],
    queryFn: async () => {
      if (!receptionId) {
        return null;
      }
      return (await inspectionService.getByReception(receptionId)) ?? null;
    },
    enabled: receptionId !== undefined,
  });

  const upsertMutation = useMutation({
    mutationFn: (zoneId: DamageZoneId) => {
      if (!receptionId) {
        throw new Error("Guarda el cliente y el vehículo primero.");
      }
      const trimmed = notes.trim();
      return inspectionService.upsertDamagePoint(receptionId, {
        zoneId,
        severity,
        ...(trimmed ? { notes: trimmed } : {}),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["inspections", "reception", receptionId],
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (pointId: EntityId) => {
      if (!receptionId) {
        throw new Error("Guarda el cliente y el vehículo primero.");
      }
      return inspectionService.removeDamagePoint(receptionId, pointId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["inspections", "reception", receptionId],
      });
    },
  });

  if (!receptionId) {
    return (
      <EmptyState
        title="Falta el ingreso"
        description="Completa cliente y vehículo para inspeccionar la unidad."
      />
    );
  }

  if (inspectionQuery.isLoading) {
    return <LoadingState />;
  }

  if (inspectionQuery.isError) {
    return <ErrorState onRetry={() => void inspectionQuery.refetch()} />;
  }

  const points = inspectionQuery.data?.damagePoints ?? [];

  return (
    <div className="space-y-4">
      <DamageLegend value={severity} onChange={setSeverity} />
      <label className="block space-y-1.5 text-xs font-medium">
        Nota del daño
        <Input
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="bg-white/70"
          placeholder="Rayón, abolladura…"
        />
      </label>
      <DamageMap
        view={view}
        onViewChange={setView}
        points={points}
        onSelectZone={(zoneId) => upsertMutation.mutate(zoneId)}
      />
      {upsertMutation.isError && (
        <ErrorState
          title="No se pudo marcar el daño"
          message={
            upsertMutation.error instanceof Error
              ? upsertMutation.error.message
              : "Inténtalo de nuevo."
          }
        />
      )}
      {points.length > 0 && (
        <ul className="divide-y divide-border/60 rounded-lg border border-border/60 bg-white/50">
          {points.map((point) => {
            const zone = findDamageZone(point.zoneId);
            return (
              <li
                key={point.id}
                className="flex items-center justify-between gap-3 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold">
                    {zone?.label ?? point.zoneId}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {point.notes ?? "Sin nota"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMutation.mutate(point.id)}
                >
                  Quitar
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
