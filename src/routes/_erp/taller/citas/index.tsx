import { createFileRoute } from "@tanstack/react-router";

import { AppointmentCalendar } from "@/components/appointments/appointment-calendar";
import { ModulePage } from "@/components/erp/module-page";

export const Route = createFileRoute("/_erp/taller/citas/")({
  head: () => ({
    meta: [{ title: "Citas | 4 RUEDAS" }],
  }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  return (
    <ModulePage title="Citas" breadcrumb="Inicio / Taller / Citas">
      <AppointmentCalendar />
    </ModulePage>
  );
}
