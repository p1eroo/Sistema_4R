import { ListToolbar } from "@/components/erp/list-toolbar";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { StatusBadge } from "@/components/erp/dashboard-ui";
import { ModulePage } from "@/components/erp/module-page";
import {
  PurchaseTable,
  formatPurchaseDate,
  purchaseStatusVariant,
  useSuppliers,
  type PurchaseColumn,
} from "@/components/purchases/purchase-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PURCHASE_STATUS_LABELS,
  PurchaseStatus,
  type Quote,
} from "@/domain/purchases/types";
import { formatMoney } from "@/domain/shared";
import { purchasesService } from "@/mocks/purchases/service";

export const Route = createFileRoute("/_erp/compras/cotizaciones")({
  head: () => ({
    meta: [{ title: "Cotizaciones | 4 RUEDAS" }],
  }),
  component: CotizacionesPage,
});

const QUOTE_STATUSES: readonly PurchaseStatus[] = [
  PurchaseStatus.Draft,
  PurchaseStatus.Sent,
  PurchaseStatus.Received,
  PurchaseStatus.Cancelled,
];

function CotizacionesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [supplierId, setSupplierId] = useState<string>("all");

  const quotesQuery = useQuery({
    queryKey: ["purchases", "quotes"],
    queryFn: () => purchasesService.listQuotes({ pageSize: 100 }),
  });
  const { names, options } = useSuppliers();

  const rows = useMemo(() => {
    const items = quotesQuery.data?.items ?? [];
    const term = search.trim().toLowerCase();

    return items.filter((quote) => {
      if (term.length > 0 && !quote.code.toLowerCase().includes(term)) {
        return false;
      }
      if (status !== "all" && quote.status !== status) {
        return false;
      }
      if (supplierId !== "all" && quote.supplierId !== supplierId) {
        return false;
      }
      return true;
    });
  }, [quotesQuery.data, search, status, supplierId]);

  const columns: readonly PurchaseColumn<Quote>[] = [
    {
      key: "code",
      header: "Cotización",
      cell: (quote) => (
        <span className="text-xs font-semibold">{quote.code}</span>
      ),
    },
    {
      key: "supplier",
      header: "Proveedor",
      className: "hidden md:table-cell",
      cell: (quote) => (
        <span className="text-xs">
          {names.get(quote.supplierId) ?? quote.supplierId}
        </span>
      ),
    },
    {
      key: "valid",
      header: "Vigencia",
      className: "hidden sm:table-cell",
      cell: (quote) => (
        <span className="text-xs">{formatPurchaseDate(quote.validUntil)}</span>
      ),
    },
    {
      key: "total",
      header: "Total",
      cell: (quote) => (
        <span className="text-xs font-semibold tabular-nums">
          {formatMoney(quote.totals.total)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (quote) => (
        <StatusBadge variant={purchaseStatusVariant(quote.status)}>
          {PURCHASE_STATUS_LABELS[quote.status]}
        </StatusBadge>
      ),
    },
  ];

  return (
    <ModulePage
      title="Cotizaciones"
      breadcrumb="Inicio / Compras / Cotizaciones"
    >
      <div className="space-y-4">
        <ListToolbar>
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por código"
              className="border-input bg-card shadow-none pl-9"
              aria-label="Buscar cotizaciones"
            />
          </div>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger className="w-full border-input bg-card shadow-none sm:w-48">
              <SelectValue placeholder="Proveedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los proveedores</SelectItem>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full border-input bg-card shadow-none sm:w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {QUOTE_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {PURCHASE_STATUS_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ListToolbar>

        <PurchaseTable
          title="Cotizaciones"
          subtitle="Propuestas de proveedores"
          columns={columns}
          rows={rows}
          getRowKey={(quote) => quote.id}
          isLoading={quotesQuery.isLoading}
          isError={quotesQuery.isError}
          onRetry={() => void quotesQuery.refetch()}
          emptyTitle="Sin cotizaciones"
          emptyDescription="No hay cotizaciones con los filtros actuales."
        />
      </div>
    </ModulePage>
  );
}
