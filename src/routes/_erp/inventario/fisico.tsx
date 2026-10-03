import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { PhysicalCountForm } from "@/components/inventory/stock-movement-form";

export const Route = createFileRoute("/_erp/inventario/fisico")({
  head: () => ({
    meta: [{ title: "Inventario físico | 4 RUEDAS" }],
  }),
  component: FisicoPage,
});

function FisicoPage() {
  return (
    <ModulePage
      title="Inventario físico"
      breadcrumb="Inicio / Inventario / Inventario físico"
    >
      <PhysicalCountForm />
    </ModulePage>
  );
}
