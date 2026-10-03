import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { PermissionMatrix } from "@/components/identity/permission-matrix";

export const Route = createFileRoute("/_erp/usuarios/permisos")({
  head: () => ({
    meta: [{ title: "Permisos | 4 RUEDAS" }],
  }),
  component: PermisosPage,
});

function PermisosPage() {
  return (
    <ModulePage
      title="Permisos"
      breadcrumb="Inicio / Usuarios y sedes / Permisos"
    >
      <PermissionMatrix />
    </ModulePage>
  );
}
