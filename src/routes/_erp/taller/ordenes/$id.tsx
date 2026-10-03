import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { WorkOrderDetail } from "@/components/work-orders/work-order-detail";

export const Route = createFileRoute("/_erp/taller/ordenes/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Orden ${params.id} | 4 RUEDAS` }],
  }),
  component: OrdenDetailPage,
});

function OrdenDetailPage() {
  const { id } = Route.useParams();

  return (
    <ModulePage
      title="Orden de trabajo"
      breadcrumb="Inicio / Taller / Órdenes de trabajo / Detalle"
    >
      <WorkOrderDetail workOrderId={id} />
    </ModulePage>
  );
}
