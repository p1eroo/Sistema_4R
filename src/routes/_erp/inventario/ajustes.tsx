import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { AdjustmentForm } from "@/components/inventory/stock-movement-form";

export const Route = createFileRoute("/_erp/inventario/ajustes")({
  head: () => ({
    meta: [{ title: "Ajustes | 4 RUEDAS" }],
  }),
  component: AjustesPage,
});

function AjustesPage() {
  return (
    <ModulePage title="Ajustes" breadcrumb="Inicio / Inventario / Ajustes">
      <AdjustmentForm />
    </ModulePage>
  );
}
