import { createFileRoute } from "@tanstack/react-router";

import { BrandManager } from "@/components/catalog/taxonomy-table";
import { ModulePage } from "@/components/erp/module-page";

export const Route = createFileRoute("/_erp/productos/marcas")({
  head: () => ({
    meta: [{ title: "Marcas | 4 RUEDAS" }],
  }),
  component: MarcasPage,
});

function MarcasPage() {
  return (
    <ModulePage title="Marcas" breadcrumb="Inicio / Productos / Marcas">
      <BrandManager />
    </ModulePage>
  );
}
