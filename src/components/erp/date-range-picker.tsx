"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { CalendarDays, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DateRangeValue = {
  readonly from: string;
  readonly to: string;
};

type PresetId =
  | "today"
  | "yesterday"
  | "last7"
  | "last30"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "custom";

const PRESETS: readonly { id: PresetId; label: string }[] = [
  { id: "today", label: "Hoy" },
  { id: "yesterday", label: "Ayer" },
  { id: "last7", label: "Últimos 7 días" },
  { id: "last30", label: "Últimos 30 días" },
  { id: "thisWeek", label: "Esta semana" },
  { id: "lastWeek", label: "Semana pasada" },
  { id: "thisMonth", label: "Este mes" },
  { id: "lastMonth", label: "Mes pasado" },
  { id: "custom", label: "Personalizado" },
];

const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1, 12);
}

function formatKey(key: string): string {
  const date = fromKey(key);
  return `${pad(date.getDate())} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date): Date {
  const next = new Date(date);
  const day = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - day);
  return next;
}

function presetRange(id: PresetId): DateRange {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  switch (id) {
    case "today":
      return { from: today, to: today };
    case "yesterday": {
      const yesterday = addDays(today, -1);
      return { from: yesterday, to: yesterday };
    }
    case "last7":
      return { from: addDays(today, -6), to: today };
    case "last30":
      return { from: addDays(today, -29), to: today };
    case "thisWeek": {
      const start = startOfWeek(today);
      return { from: start, to: addDays(start, 6) };
    }
    case "lastWeek": {
      const start = addDays(startOfWeek(today), -7);
      return { from: start, to: addDays(start, 6) };
    }
    case "thisMonth":
      return {
        from: new Date(today.getFullYear(), today.getMonth(), 1, 12),
        to: new Date(today.getFullYear(), today.getMonth() + 1, 0, 12),
      };
    case "lastMonth":
      return {
        from: new Date(today.getFullYear(), today.getMonth() - 1, 1, 12),
        to: new Date(today.getFullYear(), today.getMonth(), 0, 12),
      };
    default:
      return { from: today, to: today };
  }
}

function rangeLabel(value: DateRangeValue): string {
  return `${formatKey(value.from)} - ${formatKey(value.to)}`;
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<PresetId>("custom");
  const [draft, setDraft] = useState<DateRange>({
    from: fromKey(value.from),
    to: fromKey(value.to),
  });

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setPreset("custom");
      setDraft({ from: fromKey(value.from), to: fromKey(value.to) });
    }
    setOpen(next);
  };

  const applyPreset = (id: PresetId) => {
    setPreset(id);
    if (id !== "custom") {
      setDraft(presetRange(id));
    }
  };

  const draftLabel =
    draft.from && draft.to
      ? `${formatKey(toKey(draft.from))} - ${formatKey(toKey(draft.to))}`
      : "Selecciona un rango";

  const apply = () => {
    if (draft.from && draft.to) {
      onChange({ from: toKey(draft.from), to: toKey(draft.to) });
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 min-w-0 justify-between gap-2 rounded-md border-input bg-card font-normal shadow-none hover:bg-accent",
            className,
          )}
        >
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{rangeLabel(value)}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <div className="flex flex-col md:flex-row">
          <div className="flex shrink-0 flex-col gap-0.5 border-b border-border p-2 md:w-44 md:border-b-0 md:border-r">
            {PRESETS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => applyPreset(item.id)}
                className={cn(
                  "h-9 rounded-md px-2.5 text-left text-sm transition-colors hover:bg-accent",
                  preset === item.id
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="p-1">
            <Calendar
              mode="range"
              numberOfMonths={2}
              defaultMonth={draft.from ?? new Date()}
              selected={draft}
              onSelect={(range) => {
                setPreset("custom");
                setDraft(range ?? ({} as DateRange));
              }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
          <span className="truncate text-xs text-muted-foreground">
            {draftLabel}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={apply}
              disabled={!draft.from || !draft.to}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
