import { ListToolbarGrid } from "@/components/erp/list-toolbar";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  BRANCH_LABELS,
  branchLabel,
  formatStockDate,
} from "@/components/inventory/inventory-table";
import {
  filterKardexByDate,
  signedQuantity,
} from "@/components/inventory/kardex-filter";
import { SectionCard } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STOCK_MOVEMENT_REASON_LABELS } from "@/domain/inventory";
import { PRODUCT_UNIT_LABELS, ProductStatus } from "@/domain/products";
import { asEntityId, formatMoney } from "@/domain/shared";
import { inventoryService } from "@/mocks/inventory/service";
import { productService } from "@/mocks/products/service";

const PASTILLAS_ID = "PRD-0002";
const BRANCH_IDS = Object.keys(BRANCH_LABELS);

export function KardexView({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const [productId, setProductId] = useState(PASTILLAS_ID);
  const [branchId, setBranchId] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const productsQuery = useQuery({
    queryKey: ["products", "kardex"],
    queryFn: () => productService.list({ pageSize: 100 }),
  });
  const kardexQuery = useQuery({
    queryKey: ["inventory", "kardex", productId, branchId],
    queryFn: () =>
      inventoryService.kardex(
        asEntityId(productId),
        branchId === "all" ? undefined : asEntityId(branchId),
      ),
  });

  const products = useMemo(
    () =>
      (productsQuery.data?.items ?? []).filter(
        (product) => product.status === ProductStatus.Active,
      ),
    [productsQuery.data],
  );
  const product = products.find((item) => item.id === productId);
  const unit = product ? PRODUCT_UNIT_LABELS[product.unit] : "u";
  const unitCost = product?.cost;

  const rows = useMemo(
    () =>
      filterKardexByDate(
        kardexQuery.data ?? [],
        from || undefined,
        to || undefined,
      ),
    [kardexQuery.data, from, to],
  );

  const lastBalance = rows[rows.length - 1]?.balanceAfter;

  return (
    <div className="space-y-4">
      <ListToolbarGrid className="gap-3">
        <div className="space-y-1.5">
          <Label>Producto</Label>
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {products.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.sku} · {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Sede</Label>
          <Select value={branchId} onValueChange={setBranchId}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {BRANCH_IDS.map((id) => (
                <SelectItem key={id} value={id}>
                  {BRANCH_LABELS[id]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kardex-from">Desde</Label>
          <Input
            id="kardex-from"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kardex-to">Hasta</Label>
          <Input
            id="kardex-to"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="bg-background"
          />
        </div>
      </ListToolbarGrid>

      <SectionCard
        title={title}
        subtitle={subtitle}
        action={
          lastBalance !== undefined ? (
            <span className="text-[11px] tabular-nums text-muted-foreground">
              Saldo {lastBalance} {unit}
            </span>
          ) : undefined
        }
      >
        {kardexQuery.isLoading || productsQuery.isLoading ? (
          <LoadingState />
        ) : null}
        {kardexQuery.isError || productsQuery.isError ? (
          <ErrorState
            onRetry={() => {
              void kardexQuery.refetch();
              void productsQuery.refetch();
            }}
          />
        ) : null}
        {kardexQuery.isSuccess && rows.length === 0 ? (
          <EmptyState
            title="Sin movimientos"
            description="No hay kardex en el rango de fechas."
          />
        ) : null}
        {kardexQuery.isSuccess && rows.length > 0 ? (
          <ol className="divide-y divide-border rounded-lg border border-border">
            {rows.map((movement) => (
              <li
                key={movement.id}
                className="grid gap-1 px-3 py-2.5 sm:grid-cols-[7.5rem_1fr_auto]"
              >
                <p className="text-[11px] text-muted-foreground">
                  {formatStockDate(movement.createdAt)}
                </p>
                <div className="min-w-0">
                  <p className="text-xs font-semibold">
                    {STOCK_MOVEMENT_REASON_LABELS[movement.reason]}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {branchLabel(movement.branchId)}
                    {unitCost
                      ? ` · ${formatMoney(unitCost)} / ${unit}`
                      : ` · ${unit}`}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={
                      movement.quantity < 0
                        ? "text-xs font-semibold tabular-nums text-destructive"
                        : "text-xs font-semibold tabular-nums text-success"
                    }
                  >
                    {signedQuantity(movement.quantity)} {unit}
                  </p>
                  <p className="text-[11px] tabular-nums text-muted-foreground">
                    saldo {movement.balanceAfter}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : null}
      </SectionCard>
    </div>
  );
}
