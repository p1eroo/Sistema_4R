import { createFileRoute } from "@tanstack/react-router";

import { ReportView } from "@/components/reports/report-view";

export const Route = createFileRoute("/_erp/reportes/ventas")({
  head: () => ({
    meta: [{ title: "Reporte de ventas | 4 RUEDAS" }],
  }),
  component: VentasReportPage,
});

function VentasReportPage() {
  return (
    <ReportView
      reportKey="sales"
      title="Ventas"
      breadcrumb="Inicio / Reportes / Ventas"
    />
  );
}
