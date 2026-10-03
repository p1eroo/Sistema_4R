import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { PurchaseEditor } from "@/components/purchases/purchase-editor";

export const Route = createFileRoute("/_erp/compras/nueva")({
  head: () => ({
    meta: [{ title: "Nueva compra | 4 RUEDAS" }],
  }),
  component: NuevaCompraPage,
});

function NuevaCompraPage() {
  return (
    <ModulePage
      title="Nueva compra"
      breadcrumb="Inicio / Compras / Nueva compra"
    >
      <PurchaseEditor />
    </ModulePage>
  );
}
