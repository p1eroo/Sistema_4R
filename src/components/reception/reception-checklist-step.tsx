import { useEffect, useState, type MutableRefObject } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import {
  createInspectionChecklist,
  INSPECTION_CHECKLIST_CATALOG,
  type InspectionChecklistItem,
} from "@/domain/inspections";
import {
  createReceptionChecklist,
  FuelLevel,
  RECEPTION_CHECKLIST_CATALOG,
  type ChecklistItem,
  type Reception,
} from "@/domain/reception";
import { asEntityId, type EntityId } from "@/domain/shared";
import { inspectionService } from "@/mocks/inspections/service";
import { receptionService } from "@/mocks/reception/service";

const PHOTO_LABEL = "Foto";

const FUEL_LEVELS = [
  FuelLevel.Empty,
  FuelLevel.Quarter,
  FuelLevel.Half,
  FuelLevel.ThreeQuarters,
  FuelLevel.Full,
] as const;

const FUEL_LABELS: Record<FuelLevel, string> = {
  [FuelLevel.Empty]: "Vacío",
  [FuelLevel.Quarter]: "1/4",
  [FuelLevel.Half]: "1/2",
  [FuelLevel.ThreeQuarters]: "3/4",
  [FuelLevel.Full]: "Lleno",
};

function fuelIndex(level: FuelLevel): number {
  const index = FUEL_LEVELS.indexOf(level);
  return index >= 0 ? index : 0;
}

function nextLocalId(prefix: string): EntityId {
  return asEntityId(`${prefix}-${Date.now().toString(36)}`);
}

export function ReceptionChecklistStep({
  receptionId,
  submitRef,
  onReadyChange,
  onSaved,
  onContinue,
}: {
  receptionId?: EntityId;
  submitRef?: MutableRefObject<(() => void) | null>;
  onReadyChange?: (ready: boolean) => void;
  onSaved?: (reception: Reception) => void;
  onContinue?: () => void;
}) {
  const queryClient = useQueryClient();
  const [odometerKm, setOdometerKm] = useState(0);
  const [fuel, setFuel] = useState(2);
  const [observations, setObservations] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() =>
    createReceptionChecklist(),
  );
  const [inspectionItems, setInspectionItems] = useState<
    InspectionChecklistItem[]
  >(() => createInspectionChecklist());
  const [belongings, setBelongings] = useState<
    { id: EntityId; label: string; quantity: number }[]
  >([]);
  const [photos, setPhotos] = useState<{ id: EntityId; url: string }[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const receptionQuery = useQuery({
    queryKey: ["receptions", receptionId],
    queryFn: async () => {
      if (!receptionId) {
        return null;
      }
      return (await receptionService.getById(receptionId)) ?? null;
    },
    enabled: receptionId !== undefined,
  });

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

  useEffect(() => {
    const reception = receptionQuery.data;
    if (!reception || hydrated) {
      return;
    }

    setOdometerKm(reception.odometerKm);
    setFuel(fuelIndex(reception.fuelLevel));
    setObservations(reception.observations ?? "");
    setChecklist(
      reception.checklist.length > 0
        ? reception.checklist.map((item) => ({ ...item }))
        : createReceptionChecklist(),
    );
    setBelongings(
      reception.belongings
        .filter((item) => item.label !== PHOTO_LABEL)
        .map((item) => ({
          id: item.id,
          label: item.label,
          quantity: item.quantity,
        })),
    );
    setPhotos(
      reception.belongings
        .filter((item) => item.label === PHOTO_LABEL && item.notes)
        .map((item) => ({ id: item.id, url: item.notes ?? "" })),
    );
    setHydrated(true);
  }, [hydrated, receptionQuery.data]);

  useEffect(() => {
    if (inspectionQuery.data) {
      setInspectionItems(
        inspectionQuery.data.checklist.map((item) => ({ ...item })),
      );
    }
  }, [inspectionQuery.data]);

  const checkedCount = checklist.filter((item) => item.checked).length;
  const ready = Boolean(receptionId) && checkedCount > 0;

  const persistMutation = useMutation({
    mutationFn: async () => {
      if (!receptionId) {
        throw new Error("Guarda el cliente y el vehículo primero.");
      }
      if (checkedCount === 0) {
        throw new Error(
          "Marca al menos un ítem del checklist para poder continuar.",
        );
      }

      const photoBelongings = photos
        .filter((photo) => photo.url.trim())
        .map((photo) => ({
          id: photo.id,
          label: PHOTO_LABEL,
          quantity: 1,
          notes: photo.url.trim(),
        }));

      const trimmed = observations.trim();
      const updated = await receptionService.updateStep(receptionId, {
        step: "checklist",
        values: {
          odometerKm,
          fuelLevel: FUEL_LEVELS[fuel] ?? FuelLevel.Half,
          belongings: [
            ...belongings
              .filter((item) => item.label.trim())
              .map((item) => ({
                id: item.id,
                label: item.label.trim(),
                quantity: item.quantity,
              })),
            ...photoBelongings,
          ],
          checklist,
          ...(trimmed ? { observations: trimmed } : {}),
        },
      });

      await inspectionService.saveChecklist(receptionId, inspectionItems);
      return updated;
    },
    onSuccess: async (reception) => {
      await queryClient.invalidateQueries({ queryKey: ["receptions"] });
      await queryClient.invalidateQueries({
        queryKey: ["inspections", "reception", receptionId],
      });
      onSaved?.(reception);
      onContinue?.();
    },
  });

  useEffect(() => {
    onReadyChange?.(ready);
  }, [onReadyChange, ready]);

  if (submitRef) {
    submitRef.current = () => {
      if (ready && !persistMutation.isPending) {
        persistMutation.mutate();
      }
    };
  }

  if (!receptionId) {
    return (
      <EmptyState
        title="Falta el ingreso"
        description="Completa cliente y vehículo antes del checklist."
      />
    );
  }

  if (receptionQuery.isLoading) {
    return <LoadingState />;
  }

  if (receptionQuery.isError || receptionQuery.data === null) {
    return (
      <ErrorState
        title="No se encontró la recepción"
        onRetry={() => void receptionQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-5">
      {checkedCount === 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Checklist vacío</AlertTitle>
          <AlertDescription>
            Marca al menos un ítem para guardar y cerrar este ingreso. Sin
            checklist no se puede confirmar la recepción.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs font-medium">
          Kilometraje
          <Input
            type="number"
            min={0}
            value={odometerKm}
            onChange={(event) =>
              setOdometerKm(Math.max(0, Number(event.target.value) || 0))
            }
            className="bg-background tabular-nums"
          />
        </label>
        <div className="space-y-2">
          <p className="text-xs font-medium">
            Combustible · {FUEL_LABELS[FUEL_LEVELS[fuel] ?? FuelLevel.Half]}
          </p>
          <Slider
            min={0}
            max={4}
            step={1}
            value={[fuel]}
            onValueChange={(value) => setFuel(value[0] ?? 0)}
            aria-label="Nivel de combustible"
          />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold">Ingreso al taller</legend>
        <p className="text-[11px] text-muted-foreground">
          Marca lo que esté OK. Lo que quede sin marcar se considera con falla.
        </p>
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {RECEPTION_CHECKLIST_CATALOG.map((item) => {
            const current = checklist.find((entry) => entry.id === item.id);
            const checked = current?.checked ?? false;
            return (
              <li key={item.id} className="flex items-center gap-3 px-3 py-2">
                <Checkbox
                  id={`rec-${item.id}`}
                  checked={checked}
                  onCheckedChange={(value) =>
                    setChecklist((items) =>
                      items.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, checked: value === true }
                          : entry,
                      ),
                    )
                  }
                />
                <label htmlFor={`rec-${item.id}`} className="text-xs">
                  {item.label}
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold">
          Revisión de inspección
        </legend>
        <p className="text-[11px] text-muted-foreground">
          Marca lo que esté OK. Lo que quede sin marcar se considera con falla.
        </p>
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {INSPECTION_CHECKLIST_CATALOG.map((item) => {
            const current = inspectionItems.find(
              (entry) => entry.id === item.id,
            );
            const checked = current?.checked ?? false;
            return (
              <li key={item.id} className="flex items-center gap-3 px-3 py-2">
                <Checkbox
                  id={`insp-${item.id}`}
                  checked={checked}
                  onCheckedChange={(value) =>
                    setInspectionItems((items) =>
                      items.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, checked: value === true }
                          : entry,
                      ),
                    )
                  }
                />
                <label htmlFor={`insp-${item.id}`} className="text-xs">
                  {item.label}
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold">Pertenencias</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setBelongings((items) => [
                ...items,
                { id: nextLocalId("BLG"), label: "", quantity: 1 },
              ])
            }
          >
            <Plus /> Agregar
          </Button>
        </div>
        {belongings.length === 0 && (
          <p className="text-[11px] text-muted-foreground">
            Sin pertenencias registradas.
          </p>
        )}
        <ul className="space-y-2">
          {belongings.map((item) => (
            <li key={item.id} className="flex gap-2">
              <Input
                value={item.label}
                onChange={(event) =>
                  setBelongings((rows) =>
                    rows.map((row) =>
                      row.id === item.id
                        ? { ...row, label: event.target.value }
                        : row,
                    ),
                  )
                }
                placeholder="Llaves, laptop…"
                className="bg-background"
                aria-label="Pertenencia"
              />
              <Input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(event) =>
                  setBelongings((rows) =>
                    rows.map((row) =>
                      row.id === item.id
                        ? {
                            ...row,
                            quantity: Math.max(
                              1,
                              Number(event.target.value) || 1,
                            ),
                          }
                        : row,
                    ),
                  )
                }
                className="w-20 bg-background tabular-nums"
                aria-label="Cantidad"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setBelongings((rows) =>
                    rows.filter((row) => row.id !== item.id),
                  )
                }
                aria-label="Quitar pertenencia"
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold">Fotos (URL mock)</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setPhotos((items) => [
                ...items,
                {
                  id: nextLocalId("PHO"),
                  url: "https://picsum.photos/seed/recepcion/400/300",
                },
              ])
            }
          >
            <Plus /> URL
          </Button>
        </div>
        <ul className="space-y-2">
          {photos.map((photo) => (
            <li key={photo.id} className="flex gap-2">
              <Input
                value={photo.url}
                onChange={(event) =>
                  setPhotos((rows) =>
                    rows.map((row) =>
                      row.id === photo.id
                        ? { ...row, url: event.target.value }
                        : row,
                    ),
                  )
                }
                className="bg-background"
                aria-label="URL de foto"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setPhotos((rows) => rows.filter((row) => row.id !== photo.id))
                }
                aria-label="Quitar foto"
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <label className="block space-y-1.5 text-xs font-medium">
        Observaciones
        <Textarea
          value={observations}
          onChange={(event) => setObservations(event.target.value)}
          rows={3}
          className="bg-background text-xs font-normal"
        />
      </label>

      {persistMutation.isError && (
        <ErrorState
          title="No se pudo guardar el checklist"
          message={
            persistMutation.error instanceof Error
              ? persistMutation.error.message
              : "Revisa los datos e inténtalo de nuevo."
          }
        />
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          disabled={!ready || persistMutation.isPending}
          onClick={() => persistMutation.mutate()}
        >
          {persistMutation.isPending ? "Guardando…" : "Guardar y continuar"}
        </Button>
      </div>
    </div>
  );
}
