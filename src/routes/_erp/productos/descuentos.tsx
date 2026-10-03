import { createFileRoute } from "@tanstack/react-router";

import { PromoList } from "@/components/pricing/promo-list";
import { ModulePage } from "@/components/erp/module-page";

export const Route = createFileRoute("/_erp/productos/descuentos")({
  head: () => ({
    meta: [{ title: "Descuentos | 4 RUEDAS" }],
  }),
  component: DescuentosPage,
});

function DescuentosPage() {
  return (
    <ModulePage
      title="Descuentos"
      breadcrumb="Inicio / Productos y servicios / Descuentos"
    >
      <PromoList
        title="Descuentos"
        subtitle="Porcentaje o monto fijo · preview en S/ con el helper O-035"
      />
    </ModulePage>
  );
}
