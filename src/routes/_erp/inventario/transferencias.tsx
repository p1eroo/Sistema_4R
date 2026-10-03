import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { TransferForm } from "@/components/inventory/stock-movement-form";

export const Route = createFileRoute("/_erp/inventario/transferencias")({
  head: () => ({
    meta: [{ title: "Transferencias | 4 RUEDAS" }],
  }),
  component: TransferenciasPage,
});

function TransferenciasPage() {
  return (
    <ModulePage
      title="Transferencias"
      breadcrumb="Inicio / Inventario / Transferencias"
    >
      <TransferForm />
    </ModulePage>
  );
}
