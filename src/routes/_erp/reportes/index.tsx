import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { ReportHub } from "@/components/reports/report-hub";

export const Route = createFileRoute("/_erp/reportes/")({
  head: () => ({
    meta: [{ title: "Reportes | 4 RUEDAS" }],
  }),
  component: ReportesPage,
});

function ReportesPage() {
  return (
    <ModulePage title="Reportes" breadcrumb="Inicio / Reportes">
      <ReportHub />
    </ModulePage>
  );
}
