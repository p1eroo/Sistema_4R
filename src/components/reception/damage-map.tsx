import {
  DamageView,
  DAMAGE_VIEW_LABELS,
  findDamageZone,
  zonesForView,
  type DamageZoneId,
} from "@/domain/inspections";
import {
  DAMAGE_SEVERITY_LABELS,
  type DamagePoint,
} from "@/domain/inspections/types";
import { cn } from "@/lib/utils";

import { SEVERITY_TOKEN } from "@/components/reception/damage-severity";

const VIEWS = Object.values(DamageView);

function pointForZone(
  points: readonly DamagePoint[],
  zoneId: DamageZoneId,
): DamagePoint | undefined {
  return points.find((point) => point.zoneId === zoneId);
}

export function DamageMap({
  view,
  onViewChange,
  points,
  onSelectZone,
}: {
  view: DamageView;
  onViewChange: (view: DamageView) => void;
  points: readonly DamagePoint[];
  onSelectZone: (zoneId: DamageZoneId) => void;
}) {
  const zones = zonesForView(view);

  return (
    <div className="space-y-3">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Vista del vehículo"
      >
        {VIEWS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={view === item}
            onClick={() => onViewChange(item)}
            className={cn(
              "min-h-9 rounded-md border px-3 py-1.5 text-xs font-semibold",
              view === item
                ? "border-primary bg-primary/10"
                : "border-border bg-card",
            )}
          >
            {DAMAGE_VIEW_LABELS[item]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-muted/30 p-3">
        <svg
          viewBox="0 0 100 100"
          role="img"
          aria-label={`Mapa de daños · ${DAMAGE_VIEW_LABELS[view]}`}
          className="mx-auto aspect-[4/3] w-full max-w-[560px] text-muted-foreground"
        >
          <rect
            x="8"
            y="10"
            width="84"
            height="80"
            rx="16"
            className="fill-card stroke-border"
            strokeWidth="1.5"
          />
          {view === DamageView.Front && (
            <path
              d="M22 78 H78 L70 52 H30 Z"
              className="fill-muted stroke-border"
              strokeWidth="1"
            />
          )}
          {view === DamageView.Rear && (
            <path
              d="M26 22 H74 L70 78 H30 Z"
              className="fill-muted stroke-border"
              strokeWidth="1"
            />
          )}
          {(view === DamageView.Left || view === DamageView.Right) && (
            <path
              d="M12 38 H88 V62 H12 Z"
              className="fill-muted stroke-border"
              strokeWidth="1"
            />
          )}
          {view === DamageView.Roof && (
            <ellipse
              cx="50"
              cy="50"
              rx="28"
              ry="18"
              className="fill-muted stroke-border"
              strokeWidth="1"
            />
          )}

          {zones.map((zone) => {
            const point = pointForZone(points, zone.id);
            const severity = point?.severity;
            return (
              <g key={zone.id}>
                <circle
                  cx={zone.x}
                  cy={zone.y}
                  r="7"
                  role="button"
                  tabIndex={0}
                  aria-label={`${zone.label}${
                    point ? ` · ${DAMAGE_SEVERITY_LABELS[point.severity]}` : ""
                  }`}
                  className={cn(
                    "cursor-pointer stroke-background stroke-[1.5] focus:outline-none",
                    severity
                      ? SEVERITY_TOKEN[severity].fill
                      : "fill-primary/40",
                  )}
                  onClick={() => onSelectZone(zone.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectZone(zone.id);
                    }
                  }}
                />
                <title>
                  {zone.label}
                  {point
                    ? ` · ${DAMAGE_SEVERITY_LABELS[point.severity]}`
                    : " · sin marca"}
                </title>
              </g>
            );
          })}
        </svg>
      </div>

      <ul className="space-y-1 text-[11px] text-muted-foreground">
        {points.map((point) => {
          const zone = findDamageZone(point.zoneId);
          if (!zone || zone.view !== view) {
            return null;
          }
          return (
            <li key={point.id}>
              {zone.label}: {DAMAGE_SEVERITY_LABELS[point.severity]}
              {point.notes ? ` · ${point.notes}` : ""}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
