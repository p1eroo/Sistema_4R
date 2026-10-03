import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { ServiceCatalog } from "@/components/services/service-catalog";

export const Route = createFileRoute("/_erp/productos/servicios")({
  head: () => ({
    meta: [{ title: "Servicios | 4 RUEDAS" }],
  }),
  component: ServiciosPage,
});

function ServiciosPage() {
  return (
    <ModulePage
      title="Servicios"
      breadcrumb="Inicio / Productos y servicios / Servicios"
    >
      <ServiceCatalog />
    </ModulePage>
  );
}
