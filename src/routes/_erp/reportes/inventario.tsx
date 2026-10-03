import { createFileRoute } from "@tanstack/react-router";

import { ReportView } from "@/components/reports/report-view";

export const Route = createFileRoute("/_erp/reportes/inventario")({
  head: () => ({
    meta: [{ title: "Reporte de inventario | 4 RUEDAS" }],
  }),
  component: InventarioReportPage,
});

function InventarioReportPage() {
  return (
    <ReportView
      reportKey="inventory"
      title="Inventario"
      breadcrumb="Inicio / Reportes / Inventario"
    />
  );
}
