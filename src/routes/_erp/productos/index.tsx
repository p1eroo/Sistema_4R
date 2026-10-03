import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { ProductCatalog } from "@/components/products/product-catalog";

export const Route = createFileRoute("/_erp/productos/")({
  head: () => ({
    meta: [{ title: "Productos | 4 RUEDAS" }],
  }),
  component: ProductosPage,
});

function ProductosPage() {
  return (
    <ModulePage
      title="Productos"
      breadcrumb="Inicio / Productos y servicios / Productos"
    >
      <ProductCatalog />
    </ModulePage>
  );
}
