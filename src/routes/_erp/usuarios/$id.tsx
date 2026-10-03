import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { UserDetail } from "@/components/identity/user-detail";

export const Route = createFileRoute("/_erp/usuarios/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Usuario ${params.id} | 4 RUEDAS` }],
  }),
  component: UsuarioDetailPage,
});

function UsuarioDetailPage() {
  const { id } = Route.useParams();

  return (
    <ModulePage title="Usuario">
      <UserDetail userId={id} />
    </ModulePage>
  );
}
