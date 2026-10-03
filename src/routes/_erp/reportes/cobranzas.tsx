import { createFileRoute } from "@tanstack/react-router";

import { ReportView } from "@/components/reports/report-view";

export const Route = createFileRoute("/_erp/reportes/cobranzas")({
  head: () => ({
    meta: [{ title: "Reporte de cobranzas | 4 RUEDAS" }],
  }),
  component: CobranzasReportPage,
});

function CobranzasReportPage() {
  return (
    <ReportView
      reportKey="receivables"
      title="Cobranzas"
      breadcrumb="Inicio / Reportes / Cobranzas"
    />
  );
}
