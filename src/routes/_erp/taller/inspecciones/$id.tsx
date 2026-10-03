import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { InspectionDetail } from "@/components/inspections/inspection-detail";

export const Route = createFileRoute("/_erp/taller/inspecciones/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Inspección ${params.id} | 4 RUEDAS` }],
  }),
  component: InspectionDetailPage,
});

function InspectionDetailPage() {
  const { id } = Route.useParams();

  return (
    <ModulePage
      title="Inspección"
      breadcrumb="Inicio / Taller / Inspecciones / Detalle"
    >
      <InspectionDetail inspectionId={id} />
    </ModulePage>
  );
}
