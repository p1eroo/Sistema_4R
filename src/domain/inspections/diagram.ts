import type { DamageSeverity, Inspection } from "@/domain/inspections/types";
import {
  DamageView,
  findDamageZone,
  type DamageZoneId,
} from "@/domain/inspections/zones";
import type { DateTimeIso, EntityId } from "@/domain/shared";

/** Imagen en planta del vehículo (frente a la izquierda). */
export const VEHICLE_DIAGRAM = {
  src: "/inspection/vehiculo-planta.webp",
  width: 1400,
  height: 765,
} as const;

/** Posición sobre el diagrama, en porcentaje (0–100) del ancho y alto. */
export type DiagramPosition = {
  readonly x: number;
  readonly y: number;
};

export enum DamageMarkKind {
  /** Un toque: abolladura, golpe, pieza rota. */
  Point = "point",
  /** Un trazo: rayón o raspón. */
  Stroke = "stroke",
}

/** Marca libre de daño dibujada sobre el diagrama del vehículo. */
export type DamageMark = {
  readonly id: EntityId;
  readonly kind: DamageMarkKind;
  /** Punto de anclaje (para `stroke`, el inicio del trazo). */
  readonly position: DiagramPosition;
  /** Solo para `stroke`: puntos del trazo, en orden. */
  readonly path?: readonly DiagramPosition[] | undefined;
  readonly severity: DamageSeverity;
  readonly notes?: string | undefined;
  readonly createdAt: DateTimeIso;
};

export const MAX_STROKE_POINTS = 80;

export function clampDiagramPosition(
  position: DiagramPosition,
): DiagramPosition {
  const clamp = (value: number) =>
    Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;
  return { x: clamp(position.x), y: clamp(position.y) };
}

/** Ubica una zona del mapa anterior (por vistas) sobre el diagrama en planta. */
export function zoneDiagramPosition(zoneId: DamageZoneId): DiagramPosition {
  const zone = findDamageZone(zoneId);
  if (!zone) {
    return { x: 50, y: 50 };
  }

  switch (zone.view) {
    case DamageView.Front:
      return clampDiagramPosition({
        x: 34 - zone.y * 0.32,
        y: 22 + zone.x * 0.56,
      });
    case DamageView.Rear:
      return clampDiagramPosition({
        x: 66 + zone.y * 0.32,
        y: 22 + zone.x * 0.56,
      });
    case DamageView.Left:
      return clampDiagramPosition({ x: 10 + zone.x * 0.8, y: 20 });
    case DamageView.Right:
      return clampDiagramPosition({ x: 10 + zone.x * 0.8, y: 80 });
    case DamageView.Roof:
    default:
      return clampDiagramPosition({
        x: 34 + zone.x * 0.36,
        y: 34 + zone.y * 0.32,
      });
  }
}

/** Total de daños de una inspección: zonas antiguas + marcas del diagrama. */
export function inspectionDamageCount(
  inspection: Pick<Inspection, "damagePoints" | "damageMarks">,
): number {
  return inspection.damagePoints.length + (inspection.damageMarks?.length ?? 0);
}
