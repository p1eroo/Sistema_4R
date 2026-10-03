import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { PosShell } from "@/components/pos/pos-shell";

export const Route = createFileRoute("/_erp/pos/")({
  head: () => ({
    meta: [{ title: "Punto de venta | 4 RUEDAS" }],
  }),
  component: PosPage,
});

function PosPage() {
  return (
    <ModulePage
      title="Punto de venta"
      breadcrumb="Inicio / POS / Punto de venta"
      hideHeader
    >
      <PosShell />
    </ModulePage>
  );
}
