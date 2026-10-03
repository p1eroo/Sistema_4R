import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { WipBoard } from "@/components/workshop/wip-board";

export const Route = createFileRoute("/_erp/taller/wip/")({
  head: () => ({
    meta: [{ title: "Trabajos en proceso | 4 RUEDAS" }],
  }),
  component: WipPage,
});

function WipPage() {
  return (
    <ModulePage
      title="Trabajos en proceso"
      breadcrumb="Inicio / Taller / Trabajos en proceso"
    >
      <WipBoard />
    </ModulePage>
  );
}
