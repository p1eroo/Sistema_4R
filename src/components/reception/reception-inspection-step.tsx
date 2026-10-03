import { useQuery } from "@tanstack/react-query";

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { DamageInspector } from "@/components/reception/damage-inspector";
import type { EntityId } from "@/domain/shared";
import { inspectionService } from "@/mocks/inspections/service";

export function ReceptionInspectionStep({
  receptionId,
}: {
  receptionId?: EntityId;
}) {
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

  return (
    <DamageInspector
      receptionId={receptionId}
      points={inspectionQuery.data?.damagePoints ?? []}
      marks={inspectionQuery.data?.damageMarks ?? []}
    />
  );
}
