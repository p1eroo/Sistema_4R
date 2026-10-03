import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
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
        {breadcrumb && (
          <div className="hidden text-[11px] text-muted-foreground sm:block">
            {breadcrumb}
          </div>
        )}
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
