import { ListToolbar } from "@/components/erp/list-toolbar";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { ModulePage } from "@/components/erp/module-page";
import {
  InventoryTable,
  branchLabel,
  formatStockDate,
  type InventoryColumn,
} from "@/components/inventory/inventory-table";
import { Input } from "@/components/ui/input";
import {
  STOCK_MOVEMENT_REASON_LABELS,
  type StockMovementReason,
} from "@/domain/inventory/types";
import { inventoryService } from "@/mocks/inventory/service";
import { productService } from "@/mocks/products/service";

export const Route = createFileRoute("/_erp/inventario/movimientos")({
  head: () => ({
    meta: [{ title: "Movimientos | 4 RUEDAS" }],
  }),
  component: MovimientosPage,
});

type MovementRow = {
  id: string;
  name: string;
  sku: string;
  branchId: string;
  reason: StockMovementReason;
  quantity: number;
  balanceAfter: number;
  createdAt: string;
};

function MovimientosPage() {
  const [search, setSearch] = useState("");

  const movementsQuery = useQuery({
    queryKey: ["inventory", "movements"],
    queryFn: () => inventoryService.listMovements(),
  });
  const productsQuery = useQuery({
    queryKey: ["products", "movements-table"],
    queryFn: () => productService.list({ pageSize: 100 }),
  });

  const rows = useMemo<MovementRow[]>(() => {
    const products = new Map(
      (productsQuery.data?.items ?? []).map((product) => [product.id, product]),
    );

    return (movementsQuery.data ?? [])
      .map((movement) => {
        const product = products.get(movement.productId);
        return {
          id: movement.id,
          name: product?.name ?? movement.productId,
          sku: product?.sku ?? "—",
          branchId: movement.branchId,
          reason: movement.reason,
          quantity: movement.quantity,
          balanceAfter: movement.balanceAfter,
          createdAt: movement.createdAt,
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [movementsQuery.data, productsQuery.data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return rows;
    }
    return rows.filter((row) =>
      `${row.name} ${row.sku} ${STOCK_MOVEMENT_REASON_LABELS[row.reason]}`
        .toLowerCase()
        .includes(term),
    );
  }, [rows, search]);

  const columns: readonly InventoryColumn<MovementRow>[] = [
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
      key: "reason",
      header: "Motivo",
      cell: (row) => (
        <span className="text-xs">
          {STOCK_MOVEMENT_REASON_LABELS[row.reason]}
        </span>
      ),
    },
    {
      key: "branch",
      header: "Sede",
      className: "hidden md:table-cell",
      cell: (row) => (
        <span className="text-xs">{branchLabel(row.branchId)}</span>
      ),
    },
    {
      key: "quantity",
      header: "Cantidad",
      cell: (row) => (
        <span
          className={
            row.quantity < 0
              ? "text-xs font-semibold tabular-nums text-destructive"
              : "text-xs font-semibold tabular-nums text-success"
          }
        >
          {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
        </span>
      ),
    },
    {
      key: "balance",
      header: "Saldo",
      className: "hidden sm:table-cell",
      cell: (row) => (
        <span className="text-xs tabular-nums">{row.balanceAfter}</span>
      ),
    },
    {
      key: "date",
      header: "Fecha",
      className: "hidden lg:table-cell",
      cell: (row) => (
        <span className="text-xs">{formatStockDate(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <ModulePage
      title="Movimientos"
      breadcrumb="Inicio / Inventario / Movimientos"
    >
      <div className="space-y-4">
        <ListToolbar>
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por producto o motivo"
              className="border-input bg-card shadow-none pl-9"
              aria-label="Buscar movimientos"
            />
          </div>
        </ListToolbar>

        <InventoryTable
          title="Movimientos de inventario"
          subtitle="Libro append-only de entradas y salidas"
          columns={columns}
          rows={filtered}
          getRowKey={(row) => row.id}
          isLoading={movementsQuery.isLoading || productsQuery.isLoading}
          isError={movementsQuery.isError || productsQuery.isError}
          onRetry={() => {
            void movementsQuery.refetch();
            void productsQuery.refetch();
          }}
          emptyTitle="Sin movimientos"
          emptyDescription="No hay movimientos con los filtros actuales."
        />
      </div>
    </ModulePage>
  );
}
