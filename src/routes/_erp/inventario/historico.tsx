import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { KardexView } from "@/components/inventory/kardex-view";

export const Route = createFileRoute("/_erp/inventario/historico")({
  head: () => ({
    meta: [{ title: "Stock histórico | 4 RUEDAS" }],
  }),
  component: HistoricoPage,
});

function HistoricoPage() {
  return (
    <ModulePage
      title="Stock histórico"
      breadcrumb="Inicio / Inventario / Stock histórico"
    >
      <KardexView
        title="Consulta histórica"
        subtitle="Filtra el libro de stock por fechas"
      />
    </ModulePage>
  );
}
