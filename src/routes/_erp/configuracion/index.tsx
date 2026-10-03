import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { SettingsForm } from "@/components/settings/settings-form";

export const Route = createFileRoute("/_erp/configuracion/")({
  head: () => ({
    meta: [{ title: "Configuración | 4 RUEDAS" }],
  }),
  component: ConfiguracionPage,
});

function ConfiguracionPage() {
  return (
    <ModulePage title="Configuración" breadcrumb="Inicio / Configuración">
      <SettingsForm />
    </ModulePage>
  );
}
