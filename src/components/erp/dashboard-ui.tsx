import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, CircleHelp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  detail,
  trend,
  icon: Icon,
  emphasis = "default",
}: {
  label: string;
  value: string;
  detail: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  emphasis?: "default" | "warning" | "danger";
}) {
  return (
    <Card className="min-w-0">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="line-clamp-2 min-h-8 text-xs font-medium leading-4 text-muted-foreground">
              {label}
            </p>
            <p className="mt-1.5 whitespace-nowrap text-lg font-bold tabular-nums text-foreground 2xl:text-xl">
              {value}
            </p>
          </div>
          <div
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary",
              emphasis === "warning" && "bg-warning/12 text-warning",
              emphasis === "danger" && "bg-destructive/10 text-destructive",
            )}
          >
            <Icon className="size-4" />
          </div>
        </div>
        <div className="mt-3 flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
          {trend === "up" && <ArrowUpRight className="size-3 text-success" />}
          {trend === "down" && (
            <ArrowDownRight className="size-3 text-destructive" />
          )}
          <span className="truncate">{detail}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function SectionCard({
  title,
  subtitle,
  children,
  action,
  help,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  /**
   * Ayuda contextual: para qué sirve el bloque o qué hacer en él.
   * Muestra un botón de ayuda en la cabecera que abre un popover.
   */
  help?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("min-w-0", className)}>
      <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-border/60 px-4 py-3.5">
        <div className="min-w-0">
          <CardTitle className="truncate text-sm font-bold">{title}</CardTitle>
          {subtitle && (
            <p className="mt-1 truncate text-[11px] text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {action || help ? (
          <div className="flex items-center gap-1">
            {action}
            {help ? <SectionHelp title={title}>{help}</SectionHelp> : null}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

function SectionHelp({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-primary data-[state=open]:bg-accent data-[state=open]:text-primary"
          aria-label={`Ayuda: ${title}`}
        >
          <CircleHelp />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-1.5">
        <p className="text-xs font-bold text-foreground">{title}</p>
        <div className="space-y-1.5 text-xs leading-relaxed text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground">
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function StatusBadge({
  children,
  variant = "info",
}: {
  children: ReactNode;
  variant?: "info" | "success" | "warning" | "danger" | "neutral";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold",
        variant === "info" && "bg-info/10 text-info",
        variant === "success" && "bg-success/10 text-success",
        variant === "warning" && "bg-warning/12 text-warning-foreground",
        variant === "danger" && "bg-destructive/10 text-destructive",
        variant === "neutral" && "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}
