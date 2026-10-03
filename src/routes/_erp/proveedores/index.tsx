import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { SupplierList } from "@/components/suppliers/supplier-list";

export const Route = createFileRoute("/_erp/proveedores/")({
  head: () => ({
    meta: [{ title: "Proveedores | 4 RUEDAS" }],
  }),
  component: ProveedoresPage,
});

function ProveedoresPage() {
  return (
    <ModulePage title="Proveedores" breadcrumb="Inicio / Proveedores">
      <SupplierList />
    </ModulePage>
  );
}
