import { createFileRoute } from "@tanstack/react-router";

import { PromoList } from "@/components/pricing/promo-list";
import { ModulePage } from "@/components/erp/module-page";

export const Route = createFileRoute("/_erp/productos/promociones")({
  head: () => ({
    meta: [{ title: "Promociones | 4 RUEDAS" }],
  }),
  component: PromocionesPage,
});

function PromocionesPage() {
  return (
    <ModulePage
      title="Promociones"
      breadcrumb="Inicio / Productos y servicios / Promociones"
    >
      <PromoList
        title="Promociones"
        subtitle="Campañas activas e inactivas con vigencia y alcance"
      />
    </ModulePage>
  );
}
