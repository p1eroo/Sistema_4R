import { createFileRoute } from "@tanstack/react-router";

import { ReceptionWizard } from "@/components/reception/reception-wizard";

export const Route = createFileRoute("/_erp/taller/recepcion/")({
  head: () => ({
    meta: [{ title: "Recepción de vehículo | 4 RUEDAS" }],
  }),
  component: ReceptionPage,
});

function ReceptionPage() {
  return <ReceptionWizard />;
}
