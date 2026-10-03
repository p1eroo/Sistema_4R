import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { BaysBoard } from "@/components/workshop/bays-board";

export const Route = createFileRoute("/_erp/taller/bahias/")({
  head: () => ({
    meta: [{ title: "Bahías del taller | 4 RUEDAS" }],
  }),
  component: BaysPage,
});

function BaysPage() {
  return (
    <ModulePage
      title="Bahías del taller"
      breadcrumb="Inicio / Taller / Bahías del taller"
    >
      <BaysBoard />
    </ModulePage>
  );
}
