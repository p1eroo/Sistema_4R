import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { DeliveryQueue } from "@/components/workshop/delivery-form";

export const Route = createFileRoute("/_erp/taller/entregas/")({
  head: () => ({
    meta: [{ title: "Entregas | 4 RUEDAS" }],
  }),
  component: DeliveriesPage,
});

function DeliveriesPage() {
  return (
    <ModulePage title="Entregas" breadcrumb="Inicio / Taller / Entregas">
      <DeliveryQueue />
    </ModulePage>
  );
}
