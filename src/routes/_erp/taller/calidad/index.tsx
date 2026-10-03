import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { QualityCheckList } from "@/components/workshop/quality-check-list";

export const Route = createFileRoute("/_erp/taller/calidad/")({
  head: () => ({
    meta: [{ title: "Control de calidad | 4 RUEDAS" }],
  }),
  component: QualityPage,
});

function QualityPage() {
  return (
    <ModulePage
      title="Control de calidad"
      breadcrumb="Inicio / Taller / Control de calidad"
    >
      <QualityCheckList />
    </ModulePage>
  );
}
