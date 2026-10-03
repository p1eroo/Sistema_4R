import { createFileRoute } from "@tanstack/react-router";

import { CustomerDetail } from "@/components/customers/customer-detail";
import { ModulePage } from "@/components/erp/module-page";

export const Route = createFileRoute("/_erp/clientes/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Cliente ${params.id} | 4 RUEDAS` }],
  }),
  component: ClienteDetailPage,
});

function ClienteDetailPage() {
  const { id } = Route.useParams();

  return (
    <ModulePage title="Cliente" breadcrumb="Inicio / Clientes / Detalle">
      <CustomerDetail customerId={id} />
    </ModulePage>
  );
}
