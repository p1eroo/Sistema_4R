import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { ReturnForm } from "@/components/inventory/stock-movement-form";

export const Route = createFileRoute("/_erp/inventario/devoluciones")({
  head: () => ({
    meta: [{ title: "Devoluciones | 4 RUEDAS" }],
  }),
  component: DevolucionesPage,
});

function DevolucionesPage() {
  return (
    <ModulePage
      title="Devoluciones"
      breadcrumb="Inicio / Inventario / Devoluciones"
    >
      <ReturnForm />
    </ModulePage>
  );
}
