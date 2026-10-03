import { createFileRoute } from "@tanstack/react-router";

import { DiagnosticList } from "@/components/diagnostics/diagnostic-list";
import { ModulePage } from "@/components/erp/module-page";

export const Route = createFileRoute("/_erp/taller/diagnosticos/")({
  head: () => ({
    meta: [{ title: "Diagnósticos | 4 RUEDAS" }],
  }),
  component: DiagnosticsPage,
});

function DiagnosticsPage() {
  return (
    <ModulePage
      title="Diagnósticos"
      breadcrumb="Inicio / Taller / Diagnósticos"
    >
      <DiagnosticList />
    </ModulePage>
  );
}
