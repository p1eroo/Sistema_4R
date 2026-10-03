import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { PosQuickSale } from "@/components/pos/pos-quick-sale";

export const Route = createFileRoute("/_erp/pos/venta-rapida")({
  head: () => ({
    meta: [{ title: "Venta rápida | 4 RUEDAS" }],
  }),
  component: QuickSalePage,
});

function QuickSalePage() {
  return (
    <ModulePage
      title="Venta rápida"
      breadcrumb="Inicio / POS / Venta rápida"
      hideHeader
    >
      <PosQuickSale />
    </ModulePage>
  );
}
