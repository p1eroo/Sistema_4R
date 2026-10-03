import { Outlet, createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/erp/app-shell";

export const Route = createFileRoute("/_erp")({
  component: ErpLayout,
});

function ErpLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
