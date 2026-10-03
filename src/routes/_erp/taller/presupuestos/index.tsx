import { createFileRoute } from "@tanstack/react-router";

import { EstimateList } from "@/components/estimates/estimate-list";
import { ModulePage } from "@/components/erp/module-page";

export const Route = createFileRoute("/_erp/taller/presupuestos/")({
  head: () => ({
    meta: [{ title: "Presupuestos | 4 RUEDAS" }],
  }),
  component: PresupuestosPage,
});

function PresupuestosPage() {
  return (
    <ModulePage
      title="Presupuestos"
      breadcrumb="Inicio / Taller / Presupuestos"
    >
      <EstimateList />
    </ModulePage>
  );
}
