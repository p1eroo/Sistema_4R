import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  /** Ya no se muestra; se conserva para no romper a quienes lo pasan. */
  breadcrumb?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="truncate text-base font-bold text-foreground sm:text-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions}
    </div>
  );
}
