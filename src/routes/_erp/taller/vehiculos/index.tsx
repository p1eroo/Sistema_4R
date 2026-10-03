import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { VehicleList } from "@/components/vehicles/vehicle-list";

export const Route = createFileRoute("/_erp/taller/vehiculos/")({
  head: () => ({
    meta: [{ title: "Vehículos | 4 RUEDAS" }],
  }),
  component: VehiculosPage,
});

function VehiculosPage() {
  return (
    <ModulePage title="Vehículos" breadcrumb="Inicio / Taller / Vehículos">
      <VehicleList />
    </ModulePage>
  );
}
