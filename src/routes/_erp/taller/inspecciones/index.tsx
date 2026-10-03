import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { InspectionList } from "@/components/inspections/inspection-list";

export const Route = createFileRoute("/_erp/taller/inspecciones/")({
  head: () => ({
    meta: [{ title: "Inspecciones | 4 RUEDAS" }],
  }),
  component: InspectionsPage,
});

function InspectionsPage() {
  return (
    <ModulePage
      title="Inspecciones"
      breadcrumb="Inicio / Taller / Inspecciones"
    >
      <InspectionList />
    </ModulePage>
  );
}
