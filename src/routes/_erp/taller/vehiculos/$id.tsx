import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { VehicleDetail } from "@/components/vehicles/vehicle-detail";

export const Route = createFileRoute("/_erp/taller/vehiculos/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Vehículo ${params.id} | 4 RUEDAS` }],
  }),
  component: VehiculoDetailPage,
});

function VehiculoDetailPage() {
  const { id } = Route.useParams();

  return (
    <ModulePage
      title="Vehículo"
      breadcrumb="Inicio / Taller / Vehículos / Detalle"
    >
      <VehicleDetail vehicleId={id} />
    </ModulePage>
  );
}
