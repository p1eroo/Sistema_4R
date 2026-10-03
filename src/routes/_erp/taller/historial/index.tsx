import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { VehicleHistorySearch } from "@/components/vehicles/vehicle-history";

export const Route = createFileRoute("/_erp/taller/historial/")({
  head: () => ({
    meta: [{ title: "Historial de vehículos | 4 RUEDAS" }],
  }),
  component: VehicleHistoryPage,
});

function VehicleHistoryPage() {
  return (
    <ModulePage
      title="Historial de vehículos"
      breadcrumb="Inicio / Taller / Historial de vehículos"
    >
      <VehicleHistorySearch />
    </ModulePage>
  );
}
