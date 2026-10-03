import { useMemo, useRef, useState, type PointerEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MousePointerClick, PenLine, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/erp/dashboard-ui";
import { ErrorState } from "@/components/erp/data-states";
import { DamageLegend } from "@/components/reception/damage-legend";
import { SEVERITY_TOKEN } from "@/components/reception/damage-severity";
import { Input } from "@/components/ui/input";
import {
  DAMAGE_SEVERITY_LABELS,
  DamageMarkKind,
  DamageSeverity,
  MAX_STROKE_POINTS,
  VEHICLE_DIAGRAM,
  clampDiagramPosition,
  zoneDiagramPosition,
  type DamageMark,
  type DamagePoint,
  type DiagramPosition,
} from "@/domain/inspections";
import type { EntityId } from "@/domain/shared";
import { cn } from "@/lib/utils";
import { inspectionService } from "@/mocks/inspections/service";

/** Distancia mínima (en % del diagrama) para tratar el gesto como rayón. */
const STROKE_THRESHOLD = 2.5;
/** Separación mínima entre puntos consecutivos de un trazo. */
const SAMPLE_DISTANCE = 0.8;

const SEVERITY_COLOR: Record<DamageSeverity, string> = {
  [DamageSeverity.Minor]: "var(--success)",
  [DamageSeverity.Moderate]: "var(--warning)",
  [DamageSeverity.Severe]: "var(--destructive)",
};

type DiagramItem = {
  readonly id: EntityId;
  readonly source: "mark" | "zone";
  readonly kind: DamageMarkKind;
  readonly severity: DamageSeverity;
  readonly notes?: string | undefined;
  readonly position: DiagramPosition;
  readonly path?: readonly DiagramPosition[] | undefined;
};

function distance(a: DiagramPosition, b: DiagramPosition): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pathLength(path: readonly DiagramPosition[]): number {
  return path.reduce(
    (acc, point, index) =>
      index === 0 ? 0 : acc + distance(path[index - 1]!, point),
    0,
  );
}

function toPolyline(path: readonly DiagramPosition[]): string {
  return path.map((point) => `${point.x},${point.y}`).join(" ");
}

/** Reduce el trazo a un máximo de puntos conservando inicio y fin. */
function simplify(path: readonly DiagramPosition[]): DiagramPosition[] {
  if (path.length <= MAX_STROKE_POINTS) {
    return [...path];
  }
  const step = (path.length - 1) / (MAX_STROKE_POINTS - 1);
  return Array.from(
    { length: MAX_STROKE_POINTS },
    (_, index) => path[Math.round(index * step)]!,
  );
}

/**
 * Inspección de daños sobre el diagrama en planta del vehículo.
 * Un toque marca un punto; arrastrar dibuja un rayón.
 */
export function DamageInspector({
  receptionId,
  points,
  marks,
}: {
  receptionId: EntityId;
  points: readonly DamagePoint[];
  marks: readonly DamageMark[];
}) {
  const queryClient = useQueryClient();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [severity, setSeverity] = useState(DamageSeverity.Minor);
  const [notes, setNotes] = useState("");
  const [draft, setDraft] = useState<DiagramPosition[] | null>(null);
  const [selected, setSelected] = useState<EntityId | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["inspections"] });

  const addMutation = useMutation({
    mutationFn: (path: readonly DiagramPosition[]) => {
      const isStroke = path.length > 1 && pathLength(path) >= STROKE_THRESHOLD;
      const trimmed = notes.trim();
      return inspectionService.addDamageMark(receptionId, {
        kind: isStroke ? DamageMarkKind.Stroke : DamageMarkKind.Point,
        position: path[0]!,
        ...(isStroke ? { path: simplify(path) } : {}),
        severity,
        ...(trimmed ? { notes: trimmed } : {}),
      });
    },
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (item: DiagramItem) =>
      item.source === "mark"
        ? inspectionService.removeDamageMark(receptionId, item.id)
        : inspectionService.removeDamagePoint(receptionId, item.id),
    onSuccess: async () => {
      setSelected(null);
      await invalidate();
    },
  });

  const items = useMemo<DiagramItem[]>(
    () => [
      ...points.map((point) => ({
        id: point.id,
        source: "zone" as const,
        kind: DamageMarkKind.Point,
        severity: point.severity,
        notes: point.notes,
        position: zoneDiagramPosition(point.zoneId),
      })),
      ...marks.map((mark) => ({
        id: mark.id,
        source: "mark" as const,
        kind: mark.kind,
        severity: mark.severity,
        notes: mark.notes,
        position: mark.position,
        path: mark.path,
      })),
    ],
    [points, marks],
  );

  const positionFromEvent = (
    event: PointerEvent<HTMLDivElement>,
  ): DiagramPosition | null => {
    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) {
      return null;
    }
    return clampDiagramPosition({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || addMutation.isPending) {
      return;
    }
    const position = positionFromEvent(event);
    if (!position) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelected(null);
    setDraft([position]);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!draft) {
      return;
    }
    const position = positionFromEvent(event);
    const last = draft[draft.length - 1];
    if (position && last && distance(last, position) >= SAMPLE_DISTANCE) {
      setDraft([...draft, position]);
    }
  };

  const onPointerUp = () => {
    if (draft && draft.length > 0) {
      addMutation.mutate(draft);
    }
    setDraft(null);
  };

  const drawingStroke =
    draft !== null && draft.length > 1 && pathLength(draft) >= STROKE_THRESHOLD;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end">
        <DamageLegend value={severity} onChange={setSeverity} />
        <label className="block space-y-1.5 text-xs font-medium">
          Nota para la próxima marca
          <Input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Rayón, abolladura, faro roto…"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-3 py-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MousePointerClick className="size-3.5" aria-hidden />
            Toca para marcar un punto
          </span>
          <span className="inline-flex items-center gap-1.5">
            <PenLine className="size-3.5" aria-hidden />
            Arrastra para dibujar un rayón
          </span>
          <span className="font-semibold text-foreground">
            {items.length} {items.length === 1 ? "marca" : "marcas"}
          </span>
        </div>

        <div className="p-3 sm:p-5">
          <div
            ref={surfaceRef}
            role="application"
            aria-label="Diagrama del vehículo: toca para marcar un daño o arrastra para dibujar un rayón"
            className={cn(
              "relative mx-auto w-full max-w-[920px] touch-none select-none",
              drawingStroke ? "cursor-crosshair" : "cursor-cell",
            )}
            style={{
              aspectRatio: `${VEHICLE_DIAGRAM.width} / ${VEHICLE_DIAGRAM.height}`,
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => setDraft(null)}
          >
            <img
              src={VEHICLE_DIAGRAM.src}
              alt="Vista en planta del vehículo"
              draggable={false}
              className="pointer-events-none absolute inset-0 size-full object-contain"
            />

            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 size-full overflow-visible"
              aria-hidden
            >
              {items.map((item) =>
                item.path ? (
                  <polyline
                    key={item.id}
                    points={toPolyline(item.path)}
                    fill="none"
                    stroke={SEVERITY_COLOR[item.severity]}
                    strokeWidth={selected === item.id ? 6 : 4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity={0.85}
                    vectorEffect="non-scaling-stroke"
                  />
                ) : null,
              )}
              {drawingStroke && draft ? (
                <polyline
                  points={toPolyline(draft)}
                  fill="none"
                  stroke={SEVERITY_COLOR[severity]}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity={0.6}
                  strokeDasharray="1 7"
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}
            </svg>

            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() =>
                  setSelected((current) =>
                    current === item.id ? null : item.id,
                  )
                }
                aria-label={`Marca ${index + 1}: ${item.notes ?? "sin nota"}, ${DAMAGE_SEVERITY_LABELS[item.severity]}`}
                aria-pressed={selected === item.id}
                className={cn(
                  "absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white text-[10px] font-extrabold text-white shadow-md transition-transform animate-in zoom-in-50",
                  "hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected === item.id &&
                    "z-10 scale-125 ring-2 ring-foreground/70",
                )}
                style={{
                  left: `${item.position.x}%`,
                  top: `${item.position.y}%`,
                  backgroundColor: SEVERITY_COLOR[item.severity],
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {addMutation.isError || removeMutation.isError ? (
        <ErrorState
          title="No se pudo guardar la marca"
          message={
            (addMutation.error ?? removeMutation.error) instanceof Error
              ? (addMutation.error ?? removeMutation.error)!.message
              : "Inténtalo de nuevo."
          }
        />
      ) : null}

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
          Sin daños registrados. Marca sobre el diagrama la parte afectada.
        </p>
      ) : (
        <ul className="divide-y divide-border/60 rounded-lg border border-border/60 bg-white/50">
          {items.map((item, index) => (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-3 px-3 py-2 transition-colors",
                selected === item.id && "bg-primary/5",
              )}
            >
              <button
                type="button"
                onClick={() =>
                  setSelected((current) =>
                    current === item.id ? null : item.id,
                  )
                }
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-extrabold text-white",
                    SEVERITY_TOKEN[item.severity].swatch,
                  )}
                >
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block truncate text-xs font-semibold",
                      !item.notes && "font-medium text-muted-foreground",
                    )}
                  >
                    {item.notes ?? "Sin nota"}
                  </span>
                </span>
              </button>
              <StatusBadge variant={SEVERITY_TOKEN[item.severity].token}>
                {DAMAGE_SEVERITY_LABELS[item.severity]}
              </StatusBadge>
              <button
                type="button"
                aria-label={`Quitar marca ${index + 1}`}
                disabled={removeMutation.isPending}
                onClick={() => removeMutation.mutate(item)}
                className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
