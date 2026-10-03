import { createFileRoute } from "@tanstack/react-router";

import { ReportView } from "@/components/reports/report-view";

export const Route = createFileRoute("/_erp/reportes/taller")({
  head: () => ({
    meta: [{ title: "Reporte de taller | 4 RUEDAS" }],
  }),
  component: TallerReportPage,
});

function TallerReportPage() {
  return (
    <ReportView
      reportKey="work-orders"
      title="Taller"
      breadcrumb="Inicio / Reportes / Taller"
    />
  );
}
