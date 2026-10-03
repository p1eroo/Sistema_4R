import { ListToolbar } from "@/components/erp/list-toolbar";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { ModulePage } from "@/components/erp/module-page";
import {
  InventoryTable,
  StockBadge,
  branchLabel,
  type InventoryColumn,
} from "@/components/inventory/inventory-table";
import { Input } from "@/components/ui/input";
import { PRODUCT_UNIT_LABELS, ProductUnit } from "@/domain/products/types";
import { paginate } from "@/lib/list-query";
import { inventoryService } from "@/mocks/inventory/service";
import { productService } from "@/mocks/products/service";

export const Route = createFileRoute("/_erp/inventario/")({
  head: () => ({
    meta: [{ title: "Stock actual | 4 RUEDAS" }],
  }),
  component: InventarioPage,
});

const PAGE_SIZE = 20;

type StockRow = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  unit: ProductUnit;
  branchId: string;
  quantity: number;
  minStock: number;
  restockable: boolean;
};

function InventarioPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const stockQuery = useQuery({
    queryKey: ["inventory", "stock"],
    queryFn: () => inventoryService.getStock(),
  });
  const productsQuery = useQuery({
    queryKey: ["products", "stock-table"],
    queryFn: () => productService.list({ pageSize: 100 }),
  });

  const rows = useMemo<StockRow[]>(() => {
    const products = new Map(
      (productsQuery.data?.items ?? []).map((product) => [product.id, product]),
    );

    return (stockQuery.data ?? []).map((balance) => {
      const product = products.get(balance.productId);
      return {
        id: balance.id,
        productId: balance.productId,
        name: product?.name ?? balance.productId,
        sku: product?.sku ?? "—",
        unit: product?.unit ?? ProductUnit.Unit,
        branchId: balance.branchId,
        quantity: balance.quantity,
        minStock: balance.minStock,
        restockable: balance.restockable,
      };
    });
  }, [stockQuery.data, productsQuery.data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return rows;
    }
    return rows.filter((row) =>
      `${row.name} ${row.sku}`.toLowerCase().includes(term),
    );
  }, [rows, search]);

  const paged = paginate(filtered, page, PAGE_SIZE);

  const columns: readonly InventoryColumn<StockRow>[] = [
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
        <span className="text-xs font-semibold tabular-nums">
          {row.quantity} {PRODUCT_UNIT_LABELS[row.unit]}
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
      key: "status",
      header: "Estado",
      cell: (row) => (
        <StockBadge
          balance={{ quantity: row.quantity, minStock: row.minStock }}
        />
      ),
    },
    {
      key: "restock",
      header: "Reposición",
      className: "hidden lg:table-cell",
      cell: (row) => (
        <span className="text-xs">
          {row.restockable ? "Con reposición" : "Sin reposición"}
        </span>
      ),
    },
  ];

  return (
    <ModulePage title="Stock actual" breadcrumb="Inicio / Inventario">
      <div className="space-y-4">
        <ListToolbar>
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar por producto o SKU"
              className="border-input bg-card shadow-none pl-9"
              aria-label="Buscar stock"
            />
          </div>
        </ListToolbar>

        <InventoryTable
          title="Stock por sede"
          subtitle="Saldos actuales del inventario"
          columns={columns}
          rows={paged.items}
          getRowKey={(row) => row.id}
          isLoading={stockQuery.isLoading || productsQuery.isLoading}
          isError={stockQuery.isError || productsQuery.isError}
          onRetry={() => {
            void stockQuery.refetch();
            void productsQuery.refetch();
          }}
          emptyTitle="Sin stock"
          emptyDescription="No hay saldos con los filtros actuales."
          pagination={{
            page: paged.pagination.page,
            totalPages: paged.pagination.totalPages,
            onPrevious: () => setPage((value) => Math.max(1, value - 1)),
            onNext: () => setPage((value) => value + 1),
          }}
        />
      </div>
    </ModulePage>
  );
}
