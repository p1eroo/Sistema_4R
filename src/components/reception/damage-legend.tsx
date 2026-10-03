import { SEVERITY_TOKEN } from "@/components/reception/damage-severity";
import { DamageSeverity, DAMAGE_SEVERITY_LABELS } from "@/domain/inspections";
import { cn } from "@/lib/utils";

export function DamageLegend({
  value,
  onChange,
}: {
  value: DamageSeverity;
  onChange: (severity: DamageSeverity) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-[11px] font-semibold text-muted-foreground">
        Severidad
      </legend>
      <div className="flex flex-wrap gap-2">
        {Object.values(DamageSeverity).map((severity) => {
          const active = value === severity;
          return (
            <button
              key={severity}
              type="button"
              onClick={() => onChange(severity)}
              className={cn(
                "inline-flex min-h-9 items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold",
                active
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card",
              )}
              aria-pressed={active}
            >
              <span
                className={cn(
                  "size-2.5 rounded-full",
                  SEVERITY_TOKEN[severity].swatch,
                )}
                aria-hidden
              />
              {DAMAGE_SEVERITY_LABELS[severity]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
