import { createFileRoute } from "@tanstack/react-router";

import { CategoryManager } from "@/components/catalog/taxonomy-table";
import { ModulePage } from "@/components/erp/module-page";

export const Route = createFileRoute("/_erp/productos/categorias")({
  head: () => ({
    meta: [{ title: "Categorías | 4 RUEDAS" }],
  }),
  component: CategoriasPage,
});

function CategoriasPage() {
  return (
    <ModulePage title="Categorías" breadcrumb="Inicio / Productos / Categorías">
      <CategoryManager />
    </ModulePage>
  );
}
