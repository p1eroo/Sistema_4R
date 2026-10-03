import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { CUSTOMER_BRANCHES } from "@/components/customers/customer-list-filters";
import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import {
  INSPECTION_STATUS_LABELS,
  inspectionStatusVariant,
} from "@/components/inspections/inspection-status";
import { DamageLegend } from "@/components/reception/damage-legend";
import { DamageMap } from "@/components/reception/damage-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DAMAGE_SEVERITY_LABELS,
  DamageSeverity,
  DamageView,
  findDamageZone,
  type DamageZoneId,
} from "@/domain/inspections";
import { FuelLevel } from "@/domain/reception";
import { asEntityId, type EntityId } from "@/domain/shared";
import { vehicleDisplayName } from "@/domain/vehicles";
import { inspectionService } from "@/mocks/inspections/service";
import { receptionService } from "@/mocks/reception/service";
import { vehicleService } from "@/mocks/vehicles/service";

const PHOTO_LABEL = "Foto";

const FUEL_LABELS: Record<FuelLevel, string> = {
  [FuelLevel.Empty]: "Vacío",
  [FuelLevel.Quarter]: "1/4",
  [FuelLevel.Half]: "1/2",
  [FuelLevel.ThreeQuarters]: "3/4",
  [FuelLevel.Full]: "Lleno",
};

function branchName(branchId: EntityId): string {
  return (
    CUSTOMER_BRANCHES.find((branch) => branch.id === branchId)?.name ?? branchId
  );
}

function formatDateTime(value: string | undefined): string {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function InspectionDetail({ inspectionId }: { inspectionId: string }) {
  const id = asEntityId(inspectionId);
  const queryClient = useQueryClient();
  const [view, setView] = useState(DamageView.Front);
  const [severity, setSeverity] = useState(DamageSeverity.Minor);
  const [notes, setNotes] = useState("");

  const inspectionQuery = useQuery({
    queryKey: ["inspections", id],
    queryFn: async () => (await inspectionService.getById(id)) ?? null,
  });

  const vehicleQuery = useQuery({
    queryKey: ["vehicles", inspectionQuery.data?.vehicleId],
    queryFn: async () => {
      const vehicleId = inspectionQuery.data?.vehicleId;
      if (!vehicleId) {
        return null;
      }
      return (await vehicleService.getById(vehicleId)) ?? null;
    },
    enabled: Boolean(inspectionQuery.data?.vehicleId),
  });

  const receptionQuery = useQuery({
    queryKey: ["receptions", inspectionQuery.data?.receptionId],
    queryFn: async () => {
      const receptionId = inspectionQuery.data?.receptionId;
      if (!receptionId) {
        return null;
      }
      return (await receptionService.getById(receptionId)) ?? null;
    },
    enabled: Boolean(inspectionQuery.data?.receptionId),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["inspections"] });
  };

  const upsertMutation = useMutation({
    mutationFn: (zoneId: DamageZoneId) => {
      const inspection = inspectionQuery.data;
      if (!inspection) {
        throw new Error("No se encontró la inspección.");
      }
      const trimmed = notes.trim();
      return inspectionService.upsertDamagePoint(inspection.receptionId, {
        zoneId,
        severity,
        ...(trimmed ? { notes: trimmed } : {}),
      });
    },
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (pointId: EntityId) => {
      const inspection = inspectionQuery.data;
      if (!inspection) {
        throw new Error("No se encontró la inspección.");
      }
      return inspectionService.removeDamagePoint(
        inspection.receptionId,
        pointId,
      );
    },
    onSuccess: invalidate,
  });

  if (inspectionQuery.isLoading) {
    return <LoadingState />;
  }

  if (inspectionQuery.isError) {
    return <ErrorState onRetry={() => void inspectionQuery.refetch()} />;
  }

  const inspection = inspectionQuery.data;
  if (!inspection) {
    return (
      <EmptyState
        title="Inspección no encontrada"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/taller/inspecciones">Volver al listado</Link>
          </Button>
        }
      />
    );
  }

  const vehicle = vehicleQuery.data;
  const points = inspection.damagePoints;
  const reception = receptionQuery.data ?? undefined;
  const belongings = (reception?.belongings ?? []).filter(
    (item) => item.label !== PHOTO_LABEL,
  );
  const photos = (reception?.belongings ?? []).filter(
    (item) => item.label === PHOTO_LABEL && item.notes,
  );

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link to="/taller/inspecciones">Volver a inspecciones</Link>
      </Button>

      <SectionCard
        title={inspection.id}
        subtitle={vehicle ? vehicleDisplayName(vehicle) : inspection.vehicleId}
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            {vehicle && (
              <span className="inline-flex rounded-md bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">
                {vehicle.plate}
              </span>
            )}
            <StatusBadge variant={inspectionStatusVariant(inspection.status)}>
              {INSPECTION_STATUS_LABELS[inspection.status]}
            </StatusBadge>
          </div>
        }
      >
        <dl className="grid gap-3 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-[11px] text-muted-foreground">Recepción</dt>
            <dd className="font-semibold tabular-nums">
              {inspection.receptionId}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Vehículo</dt>
            <dd className="font-semibold">
              {vehicle ? (
                <Link to="/taller/vehiculos/$id" params={{ id: vehicle.id }}>
                  {vehicleDisplayName(vehicle)}
                </Link>
              ) : (
                inspection.vehicleId
              )}
            </dd>
          </div>
        </dl>
      </SectionCard>

      {receptionQuery.isLoading ? (
        <SectionCard title="Datos de ingreso">
          <LoadingState />
        </SectionCard>
      ) : reception ? (
        <>
          <SectionCard title="Datos de ingreso" subtitle={reception.code}>
            <dl className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-[11px] text-muted-foreground">
                  Kilometraje
                </dt>
                <dd className="font-semibold tabular-nums">
                  {reception.odometerKm.toLocaleString("es-PE")} km
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted-foreground">
                  Combustible
                </dt>
                <dd className="font-semibold">
                  {FUEL_LABELS[reception.fuelLevel]}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted-foreground">Sede</dt>
                <dd className="font-semibold">
                  {branchName(reception.branchId)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted-foreground">Motivo</dt>
                <dd className="font-semibold">{reception.reason || "—"}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted-foreground">Ingreso</dt>
                <dd className="font-semibold">
                  {formatDateTime(reception.receivedAt ?? reception.createdAt)}
                </dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard
            title="Ingreso al taller"
            subtitle="Marcado = OK · Sin marcar = falla"
          >
            <ul className="divide-y divide-border rounded-lg border border-border bg-background">
              {reception.checklist.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <span className="text-xs font-semibold">{item.label}</span>
                  <StatusBadge variant={item.checked ? "success" : "danger"}>
                    {item.checked ? "OK" : "Falla"}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          </SectionCard>

          {(belongings.length > 0 || photos.length > 0) && (
            <SectionCard title="Pertenencias y fotos">
              <ul className="space-y-1 text-xs text-muted-foreground">
                {belongings.map((item) => (
                  <li key={item.id}>
                    {item.label} × {item.quantity}
                  </li>
                ))}
                {photos.map((item) => (
                  <li key={item.id} className="truncate">
                    Foto · {item.notes}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {reception.observations ? (
            <SectionCard title="Observaciones">
              <p className="text-xs text-muted-foreground">
                {reception.observations}
              </p>
            </SectionCard>
          ) : null}
        </>
      ) : null}

      <SectionCard
        title="Mapa de daños"
        subtitle="Clic en una zona para registrar o actualizar"
      >
        <div className="space-y-4">
          <DamageLegend value={severity} onChange={setSeverity} />
          <label className="block space-y-1.5 text-xs font-medium">
            Nota del daño
            <Input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="bg-background"
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
          {points.length === 0 ? (
            <EmptyState
              title="Sin daños"
              description="Selecciona una zona del mapa."
            />
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border bg-background">
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
                        {DAMAGE_SEVERITY_LABELS[point.severity]}
                        {point.notes ? ` · ${point.notes}` : ""}
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
      </SectionCard>

      <SectionCard
        title="Checklist de inspección"
        subtitle="Marcado = OK · Sin marcar = falla"
      >
        {inspection.checklist.length === 0 ? (
          <EmptyState
            title="Sin checklist"
            description="No se registró revisión de inspección."
          />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-background">
            {inspection.checklist.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 px-3 py-2"
              >
                <span className="text-xs font-semibold">{item.label}</span>
                <StatusBadge variant={item.checked ? "success" : "danger"}>
                  {item.checked ? "OK" : "Falla"}
                </StatusBadge>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
