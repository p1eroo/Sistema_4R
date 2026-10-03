import type { ReactNode } from "react";

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { PageHeader } from "@/components/erp/page-header";
import { useRegisterPageChrome } from "@/components/erp/use-page-chrome";
import { chromeFromPath } from "@/components/erp/nav";
import { useRouterState } from "@tanstack/react-router";

export function ModulePage({
  title,
  subtitle,
  breadcrumb,
  actions,
  children,
  status = "ready",
  onRetry,
  empty,
  hideHeader = false,
}: {
  title?: string;
  subtitle?: string;
  breadcrumb?: string;
  actions?: ReactNode;
  children?: ReactNode;
  status?: "ready" | "loading" | "empty" | "error";
  onRetry?: () => void;
  empty?: {
    title?: string;
    description?: string;
    action?: ReactNode;
  };
  /**
   * Oculta el bloque breadcrumb + título (pantallas tipo terminal como el POS).
   * El título se mantiene como h1 accesible y en el chrome de la página.
   */
  hideHeader?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const fallback = chromeFromPath(pathname);
  const chromeTitle = title ?? fallback.title;
  const chrome = {
    title: chromeTitle,
    breadcrumb: breadcrumb ?? fallback.breadcrumb,
  };

  useRegisterPageChrome(chrome);

  return (
    <main className="min-w-0 flex-1 p-3 sm:p-5 sm:pt-4 lg:p-6 lg:pt-4">
      <section className="mx-auto w-full max-w-[1680px]">
        {hideHeader ? (
          <h1 className="sr-only">{chromeTitle}</h1>
        ) : (
          <PageHeader
            title={chromeTitle}
            breadcrumb={chrome.breadcrumb}
            {...(subtitle !== undefined ? { subtitle } : {})}
            {...(actions !== undefined ? { actions } : {})}
          />
        )}
        <div className={hideHeader ? undefined : "mt-4"}>
          {status === "loading" && <LoadingState />}
          {status === "empty" && <EmptyState {...empty} />}
          {status === "error" && (
            <ErrorState {...(onRetry ? { onRetry } : {})} />
          )}
          {status === "ready" && children}
        </div>
      </section>
    </main>
  );
}
