import { createFileRoute } from "@tanstack/react-router";

import { CustomerList } from "@/components/customers/customer-list";
import { ModulePage } from "@/components/erp/module-page";

export const Route = createFileRoute("/_erp/clientes/")({
  head: () => ({
    meta: [{ title: "Clientes | 4 RUEDAS" }],
  }),
  component: ClientesPage,
});

function ClientesPage() {
  return (
    <ModulePage title="Clientes" breadcrumb="Inicio / Clientes">
      <CustomerList />
    </ModulePage>
  );
}
