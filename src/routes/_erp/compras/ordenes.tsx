import { ListToolbar } from "@/components/erp/list-toolbar";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";

import { StatusBadge } from "@/components/erp/dashboard-ui";
import { ModulePage } from "@/components/erp/module-page";
import {
  PurchaseTable,
  formatPurchaseDate,
  purchaseStatusVariant,
  useSuppliers,
  type PurchaseColumn,
} from "@/components/purchases/purchase-table";
import { Button } from "@/components/ui/button";
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
  type PurchaseOrder,
} from "@/domain/purchases/types";
import { formatMoney } from "@/domain/shared";
import { purchasesService } from "@/mocks/purchases/service";

export const Route = createFileRoute("/_erp/compras/ordenes")({
  head: () => ({
    meta: [{ title: "Órdenes de compra | 4 RUEDAS" }],
  }),
  component: OrdenesPage,
});

const ORDER_STATUSES: readonly PurchaseStatus[] = [
  PurchaseStatus.Draft,
  PurchaseStatus.Sent,
  PurchaseStatus.Received,
  PurchaseStatus.Cancelled,
];

function OrdenesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [supplierId, setSupplierId] = useState<string>("all");

  const ordersQuery = useQuery({
    queryKey: ["purchases", "orders"],
    queryFn: () => purchasesService.listOrders({ pageSize: 100 }),
  });
  const { names, options } = useSuppliers();

  const rows = useMemo(() => {
    const items = ordersQuery.data?.items ?? [];
    const term = search.trim().toLowerCase();

    return items.filter((order) => {
      if (term.length > 0 && !order.code.toLowerCase().includes(term)) {
        return false;
      }
      if (status !== "all" && order.status !== status) {
        return false;
      }
      if (supplierId !== "all" && order.supplierId !== supplierId) {
        return false;
      }
      return true;
    });
  }, [ordersQuery.data, search, status, supplierId]);

  const columns: readonly PurchaseColumn<PurchaseOrder>[] = [
    {
      key: "code",
      header: "Orden",
      cell: (order) => (
        <span className="text-xs font-semibold">{order.code}</span>
      ),
    },
    {
      key: "supplier",
      header: "Proveedor",
      className: "hidden md:table-cell",
      cell: (order) => (
        <span className="text-xs">
          {names.get(order.supplierId) ?? order.supplierId}
        </span>
      ),
    },
    {
      key: "expected",
      header: "Entrega",
      className: "hidden sm:table-cell",
      cell: (order) => (
        <span className="text-xs">{formatPurchaseDate(order.expectedAt)}</span>
      ),
    },
    {
      key: "total",
      header: "Total",
      cell: (order) => (
        <span className="text-xs font-semibold tabular-nums">
          {formatMoney(order.totals.total)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (order) => (
        <StatusBadge variant={purchaseStatusVariant(order.status)}>
          {PURCHASE_STATUS_LABELS[order.status]}
        </StatusBadge>
      ),
    },
  ];

  return (
    <ModulePage
      title="Órdenes de compra"
      breadcrumb="Inicio / Compras / Órdenes de compra"
    >
      <div className="space-y-4">
        <ListToolbar>
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por código"
              className="pl-9"
              aria-label="Buscar órdenes"
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
              {ORDER_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {PURCHASE_STATUS_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild>
            <Link to="/compras/nueva">
              <Plus /> Nueva OC
            </Link>
          </Button>
        </ListToolbar>

        <PurchaseTable
          title="Órdenes de compra"
          subtitle="Pedidos emitidos a proveedores"
          columns={columns}
          rows={rows}
          getRowKey={(order) => order.id}
          isLoading={ordersQuery.isLoading}
          isError={ordersQuery.isError}
          onRetry={() => void ordersQuery.refetch()}
          emptyTitle="Sin órdenes"
          emptyDescription="No hay órdenes con los filtros actuales."
        />
      </div>
    </ModulePage>
  );
}
