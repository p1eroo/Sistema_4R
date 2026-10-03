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
  type Purchase,
} from "@/domain/purchases/types";
import { formatMoney } from "@/domain/shared";
import { purchasesService } from "@/mocks/purchases/service";

export const Route = createFileRoute("/_erp/compras/")({
  head: () => ({
    meta: [{ title: "Lista de compras | 4 RUEDAS" }],
  }),
  component: ComprasPage,
});

const PURCHASE_STATUSES: readonly PurchaseStatus[] = [
  PurchaseStatus.Draft,
  PurchaseStatus.Sent,
  PurchaseStatus.Received,
  PurchaseStatus.Cancelled,
];

function ComprasPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [supplierId, setSupplierId] = useState<string>("all");
  const [date, setDate] = useState("");

  const purchasesQuery = useQuery({
    queryKey: ["purchases", "list"],
    queryFn: () => purchasesService.listPurchases({ pageSize: 100 }),
  });
  const { names, options } = useSuppliers();

  const rows = useMemo(() => {
    const items = purchasesQuery.data?.items ?? [];
    const term = search.trim().toLowerCase();

    return items.filter((purchase) => {
      if (
        term.length > 0 &&
        !`${purchase.code} ${purchase.invoiceNumber ?? ""}`
          .toLowerCase()
          .includes(term)
      ) {
        return false;
      }
      if (status !== "all" && purchase.status !== status) {
        return false;
      }
      if (supplierId !== "all" && purchase.supplierId !== supplierId) {
        return false;
      }
      if (date && (purchase.purchasedAt?.slice(0, 10) ?? "") !== date) {
        return false;
      }
      return true;
    });
  }, [purchasesQuery.data, search, status, supplierId, date]);

  const columns: readonly PurchaseColumn<Purchase>[] = [
    {
      key: "code",
      header: "Documento",
      cell: (purchase) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">{purchase.code}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {purchase.invoiceNumber ?? "Sin factura"}
          </p>
        </div>
      ),
    },
    {
      key: "supplier",
      header: "Proveedor",
      className: "hidden md:table-cell",
      cell: (purchase) => (
        <span className="text-xs">
          {names.get(purchase.supplierId) ?? purchase.supplierId}
        </span>
      ),
    },
    {
      key: "date",
      header: "Compra",
      className: "hidden sm:table-cell",
      cell: (purchase) => (
        <span className="text-xs">
          {formatPurchaseDate(purchase.purchasedAt)}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      cell: (purchase) => (
        <span className="text-xs font-semibold tabular-nums">
          {formatMoney(purchase.totals.total)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (purchase) => (
        <StatusBadge variant={purchaseStatusVariant(purchase.status)}>
          {PURCHASE_STATUS_LABELS[purchase.status]}
        </StatusBadge>
      ),
    },
  ];

  return (
    <ModulePage title="Lista de compras" breadcrumb="Inicio / Compras">
      <div className="space-y-4">
        <ListToolbar>
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por documento o factura"
              className="pl-9"
              aria-label="Buscar compras"
            />
          </div>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger className="w-full sm:w-48">
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
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {PURCHASE_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {PURCHASE_STATUS_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full sm:w-40"
            aria-label="Filtrar por fecha"
          />
        </ListToolbar>

        <PurchaseTable
          title="Compras"
          subtitle="Compras registradas y su estado"
          columns={columns}
          rows={rows}
          getRowKey={(purchase) => purchase.id}
          isLoading={purchasesQuery.isLoading}
          isError={purchasesQuery.isError}
          onRetry={() => void purchasesQuery.refetch()}
          emptyTitle="Sin compras"
          emptyDescription="No hay compras con los filtros actuales."
        />
      </div>
    </ModulePage>
  );
}
