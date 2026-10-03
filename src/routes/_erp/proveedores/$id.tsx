import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { SupplierDetail } from "@/components/suppliers/supplier-detail";

export const Route = createFileRoute("/_erp/proveedores/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Proveedor ${params.id} | 4 RUEDAS` }],
  }),
  component: ProveedorDetailPage,
});

function ProveedorDetailPage() {
  const { id } = Route.useParams();

  return (
    <ModulePage title="Proveedor" breadcrumb="Inicio / Proveedores / Detalle">
      <SupplierDetail supplierId={id} />
    </ModulePage>
  );
}
