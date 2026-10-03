import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/erp/module-page";
import { CashRegisterList } from "@/components/pos/cash-register-list";

export const Route = createFileRoute("/_erp/pos/cajas")({
  head: () => ({
    meta: [{ title: "Listado de cajas | 4 RUEDAS" }],
  }),
  component: CashRegistersPage,
});

function CashRegistersPage() {
  return (
    <ModulePage
      title="Listado de cajas"
      breadcrumb="Inicio / POS / Listado de cajas"
      subtitle="Sesiones de caja por sede: apertura, movimientos, arqueo y cierre."
    >
      <CashRegisterList />
    </ModulePage>
  );
}
