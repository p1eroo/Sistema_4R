import type { ReactNode } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Shared class for toolbar controls so search, selects and date inputs share
 * the same height, radius, border and flat (shadow-less) surface.
 */
export const toolbarControlClass =
  "h-9 rounded-lg border-input bg-white/70 shadow-none";

/**
 * Lightweight list-page toolbar.
 *
 * Toolbars are transparent (no card surface, border or shadow) so the content
 * card/table below stays the primary visual surface. Use cards for content and
 * toolbars for actions/filters.
 */
export function ListToolbar({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Standard toolbar search: icon + input that expands to fill the row. */
export function ListToolbarSearch({
  value,
  onChange,
  placeholder,
  ariaLabel,
  onEnter,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  onEnter?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && onEnter) {
            event.preventDefault();
            onEnter();
          }
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn("pl-9", toolbarControlClass)}
      />
    </div>
  );
}

/** Grid variant for dashboards/reports where several filters share a row. */
export function ListToolbarGrid({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {children}
    </div>
  );
}

/** Chips/tabs row attached to a toolbar (status filters). */
export function ListToolbarChips({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>{children}</div>
  );
}
