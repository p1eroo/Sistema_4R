import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { CustomerAdvanceList } from "@/components/pos/customer-advance-list";

export const Route = createFileRoute("/_erp/pos/anticipos")({
  head: () => ({
    meta: [{ title: "Anticipo clientes | 4 RUEDAS" }],
  }),
  component: CustomerAdvancesPage,
});

function CustomerAdvancesPage() {
  return (
    <ModulePage
      title="Anticipo clientes"
      breadcrumb="Inicio / POS / Anticipo clientes"
      subtitle="Pagos adelantados de clientes y su aplicación en ventas."
    >
      <CustomerAdvanceList />
    </ModulePage>
  );
}
