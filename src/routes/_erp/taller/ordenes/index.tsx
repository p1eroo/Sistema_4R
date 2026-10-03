import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { WorkOrderList } from "@/components/work-orders/work-order-list";

export const Route = createFileRoute("/_erp/taller/ordenes/")({
  head: () => ({
    meta: [{ title: "Órdenes de trabajo | 4 RUEDAS" }],
  }),
  component: OrdenesPage,
});

function OrdenesPage() {
  return (
    <ModulePage
      title="Órdenes de trabajo"
      breadcrumb="Inicio / Taller / Órdenes de trabajo"
    >
      <WorkOrderList />
    </ModulePage>
  );
}
