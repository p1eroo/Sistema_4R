import { ListToolbar } from "@/components/erp/list-toolbar";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { StatusBadge } from "@/components/erp/dashboard-ui";
import { ModulePage } from "@/components/erp/module-page";
import {
  InventoryTable,
  branchLabel,
  type InventoryColumn,
} from "@/components/inventory/inventory-table";
import { Input } from "@/components/ui/input";
import { inventoryService } from "@/mocks/inventory/service";
import { productService } from "@/mocks/products/service";

export const Route = createFileRoute("/_erp/inventario/critico")({
  head: () => ({
    meta: [{ title: "Stock crítico | 4 RUEDAS" }],
  }),
  component: CriticoPage,
});

type CriticalRow = {
  id: string;
  name: string;
  sku: string;
  branchId: string;
  quantity: number;
  minStock: number;
  restockable: boolean;
};

function CriticoPage() {
  const [search, setSearch] = useState("");

  const criticalQuery = useQuery({
    queryKey: ["inventory", "critical"],
    queryFn: () => inventoryService.listCritical(),
  });
  const productsQuery = useQuery({
    queryKey: ["products", "critical-table"],
    queryFn: () => productService.list({ pageSize: 100 }),
  });

  const rows = useMemo<CriticalRow[]>(() => {
    const products = new Map(
      (productsQuery.data?.items ?? []).map((product) => [product.id, product]),
    );

    return (criticalQuery.data ?? []).map((balance) => {
      const product = products.get(balance.productId);
      return {
        id: balance.id,
        name: product?.name ?? balance.productId,
        sku: product?.sku ?? "—",
        branchId: balance.branchId,
        quantity: balance.quantity,
        minStock: balance.minStock,
        restockable: balance.restockable,
      };
    });
  }, [criticalQuery.data, productsQuery.data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return rows;
    }
    return rows.filter((row) =>
      `${row.name} ${row.sku}`.toLowerCase().includes(term),
    );
  }, [rows, search]);

  const columns: readonly InventoryColumn<CriticalRow>[] = [
    {
      key: "product",
      header: "Producto",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">{row.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {row.sku}
          </p>
        </div>
      ),
    },
    {
      key: "branch",
      header: "Sede",
      className: "hidden sm:table-cell",
      cell: (row) => (
        <span className="text-xs">{branchLabel(row.branchId)}</span>
      ),
    },
    {
      key: "quantity",
      header: "Stock",
      cell: (row) => (
        <span className="text-xs font-semibold tabular-nums text-destructive">
          {row.quantity}
        </span>
      ),
    },
    {
      key: "min",
      header: "Mínimo",
      className: "hidden md:table-cell",
      cell: (row) => (
        <span className="text-xs tabular-nums">{row.minStock}</span>
      ),
    },
    {
      key: "restock",
      header: "Reposición",
      cell: (row) => (
        <StatusBadge variant={row.restockable ? "warning" : "danger"}>
          {row.restockable ? "Con reposición" : "Sin reposición"}
        </StatusBadge>
      ),
    },
  ];

  return (
    <ModulePage
      title="Stock crítico"
      breadcrumb="Inicio / Inventario / Stock crítico"
    >
      <div className="space-y-4">
        <ListToolbar>
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por producto o SKU"
              className="border-input bg-card shadow-none pl-9"
              aria-label="Buscar stock crítico"
            />
          </div>
        </ListToolbar>

        <InventoryTable
          title="Productos en stock crítico"
          subtitle="Stock igual o por debajo del mínimo"
          columns={columns}
          rows={filtered}
          getRowKey={(row) => row.id}
          isLoading={criticalQuery.isLoading || productsQuery.isLoading}
          isError={criticalQuery.isError || productsQuery.isError}
          onRetry={() => {
            void criticalQuery.refetch();
            void productsQuery.refetch();
          }}
          emptyTitle="Sin stock crítico"
          emptyDescription="No hay productos críticos con los filtros actuales."
        />
      </div>
    </ModulePage>
  );
}
