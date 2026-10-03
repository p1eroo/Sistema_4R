import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { KardexView } from "@/components/inventory/kardex-view";

export const Route = createFileRoute("/_erp/inventario/kardex")({
  head: () => ({
    meta: [{ title: "Kardex | 4 RUEDAS" }],
  }),
  component: KardexPage,
});

function KardexPage() {
  return (
    <ModulePage title="Kardex" breadcrumb="Inicio / Inventario / Kardex">
      <KardexView
        title="Kardex de producto"
        subtitle="Entradas, salidas y saldo corrido"
      />
    </ModulePage>
  );
}
