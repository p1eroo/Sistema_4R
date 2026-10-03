import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { useRegisterPageChrome } from "@/components/erp/use-page-chrome";
import { Button } from "@/components/ui/button";
import {
  PAYMENT_TERMS_LABELS,
  SUPPLIER_STATUS_LABELS,
  SupplierStatus,
} from "@/domain/suppliers";
import { asEntityId } from "@/domain/shared";
import { supplierService } from "@/mocks/suppliers/service";

export function SupplierDetail({ supplierId }: { supplierId: string }) {
  const id = asEntityId(supplierId);
  const query = useQuery({
    queryKey: ["suppliers", id],
    queryFn: () => supplierService.getById(id),
  });

  const supplier = query.data;
  const title = supplier?.tradeName ?? supplier?.businessName ?? "Proveedor";

  useRegisterPageChrome({
    title,
    breadcrumb: `Inicio / Proveedores / ${supplier?.ruc ?? "Detalle"}`,
  });

  if (query.isLoading) {
    return <LoadingState />;
  }

  if (query.isError) {
    return <ErrorState onRetry={() => void query.refetch()} />;
  }

  if (!supplier) {
    return (
      <EmptyState
        title="Proveedor no encontrado"
        description="El registro no existe o fue archivado."
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/proveedores">Volver a proveedores</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-primary">
            {supplier.businessName}
          </p>
          <h2 className="truncate text-lg font-bold">{title}</h2>
        </div>
        <StatusBadge
          variant={
            supplier.status === SupplierStatus.Active ? "success" : "neutral"
          }
        >
          {SUPPLIER_STATUS_LABELS[supplier.status]}
        </StatusBadge>
      </div>

      <SectionCard title="Ficha" subtitle="RUC y contacto comercial">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] text-muted-foreground">RUC</dt>
            <dd className="text-xs font-semibold tabular-nums">
              {supplier.ruc}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Pago</dt>
            <dd className="text-xs">
              {PAYMENT_TERMS_LABELS[supplier.paymentTerms]}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Contacto</dt>
            <dd className="text-xs">{supplier.contact?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Celular</dt>
            <dd className="text-xs tabular-nums">
              {supplier.contact?.phone ?? supplier.phone ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Correo</dt>
            <dd className="truncate text-xs">
              {supplier.contact?.email ?? supplier.email ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Dirección</dt>
            <dd className="text-xs">{supplier.address ?? "—"}</dd>
          </div>
        </dl>
      </SectionCard>

      <Button asChild variant="outline" size="sm">
        <Link to="/proveedores">Volver a proveedores</Link>
      </Button>
    </div>
  );
}
