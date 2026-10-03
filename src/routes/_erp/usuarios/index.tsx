import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { UserList } from "@/components/identity/user-table";

export const Route = createFileRoute("/_erp/usuarios/")({
  head: () => ({
    meta: [{ title: "Usuarios | 4 RUEDAS" }],
  }),
  component: UsuariosPage,
});

function UsuariosPage() {
  return (
    <ModulePage title="Usuarios" breadcrumb="Inicio / Usuarios">
      <UserList />
    </ModulePage>
  );
}
