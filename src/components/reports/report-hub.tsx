import { Link } from "@tanstack/react-router";
import { Banknote, ClipboardList, Package, Wallet } from "lucide-react";

import { MetricCard, SectionCard } from "@/components/erp/dashboard-ui";
import { Button } from "@/components/ui/button";

const families = [
  {
    title: "Ventas",
    description: "Tickets POS cobrados y totales por día.",
    href: "/reportes/ventas",
    icon: Banknote,
  },
  {
    title: "Taller",
    description: "Órdenes de trabajo por estado y sede.",
    href: "/reportes/taller",
    icon: ClipboardList,
  },
  {
    title: "Inventario",
    description: "Saldos, mínimos y productos críticos.",
    href: "/reportes/inventario",
    icon: Package,
  },
  {
    title: "Cobranzas",
    description: "Facturas pendientes y vencidas.",
    href: "/reportes/cobranzas",
    icon: Wallet,
  },
] as const;

export function ReportHub() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {families.map((family) => (
        <SectionCard
          key={family.href}
          title={family.title}
          subtitle={family.description}
          action={
            <Button size="sm" asChild>
              <Link to={family.href}>Abrir</Link>
            </Button>
          }
        >
          <MetricCard
            label={family.title}
            value="Mock operativo"
            detail="Datos desde O-048"
            icon={family.icon}
          />
        </SectionCard>
      ))}
    </div>
  );
}
