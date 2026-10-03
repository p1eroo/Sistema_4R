import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";

import {
  EMPTY_LINES_MESSAGE,
  MISSING_SUPPLIER_MESSAGE,
  buildPurchaseLines,
  emptyPurchaseLine,
  previewPurchaseTotals,
  type PurchaseLineDraft,
} from "@/components/purchases/purchase-draft";
import { useSuppliers } from "@/components/purchases/purchase-table";
import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import { ErrorState } from "@/components/erp/data-states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  type PurchaseOrder,
} from "@/domain/purchases";
import { ProductStatus } from "@/domain/products";
import { asEntityId, formatMoney } from "@/domain/shared";
import { inventoryService } from "@/mocks/inventory/service";
import { productService } from "@/mocks/products/service";
import { purchasesService } from "@/mocks/purchases/service";

const SESSION_BRANCH_ID = asEntityId("BR-LM");

function moneyToSoles(amount: number): string {
  return (amount / 100).toFixed(2);
}

export function PurchaseEditor() {
  const queryClient = useQueryClient();
  const { options } = useSuppliers();
  const [supplierId, setSupplierId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<PurchaseLineDraft[]>([
    emptyPurchaseLine(),
  ]);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [stockNote, setStockNote] = useState<string | null>(null);

  const productsQuery = useQuery({
    queryKey: ["products", "purchase-editor"],
    queryFn: () => productService.list({ pageSize: 100 }),
  });

  const products = useMemo(
    () =>
      (productsQuery.data?.items ?? []).filter(
        (product) => product.status === ProductStatus.Active,
      ),
    [productsQuery.data],
  );

  const totals = useMemo(() => previewPurchaseTotals(lines), [lines]);
  const locked = order !== null || purchase !== null;
  const received = purchase?.status === PurchaseStatus.Received;

  const updateLine = (key: string, patch: Partial<PurchaseLineDraft>): void => {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  };

  const emitMutation = useMutation({
    mutationFn: async () => {
      if (!supplierId) {
        throw new Error(MISSING_SUPPLIER_MESSAGE);
      }

      const built = buildPurchaseLines(lines);
      if (!built.ok) {
        throw new Error(built.message);
      }

      const payload = {
        supplierId: asEntityId(supplierId),
        branchId: SESSION_BRANCH_ID,
        lines: built.lines,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      };

      const createdOrder = await purchasesService.createOrder(payload);
      const createdPurchase = await purchasesService.createPurchase(payload);
      return { createdOrder, createdPurchase };
    },
    onSuccess: async ({ createdOrder, createdPurchase }) => {
      setError(null);
      setOrder(createdOrder);
      setPurchase(createdPurchase);
      await queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
    onError: (cause) => {
      setError(cause instanceof Error ? cause.message : EMPTY_LINES_MESSAGE);
    },
  });

  const receiveMutation = useMutation({
    mutationFn: async () => {
      if (!purchase) {
        throw new Error("Emite la OC antes de recibir mercadería.");
      }

      const firstProductId = purchase.lines.find(
        (line) => line.productId,
      )?.productId;

      const before =
        firstProductId !== undefined
          ? await inventoryService.getStock(firstProductId, SESSION_BRANCH_ID)
          : [];

      const receivedPurchase = await purchasesService.receivePurchase(
        purchase.id,
      );

      const after =
        firstProductId !== undefined
          ? await inventoryService.getStock(firstProductId, SESSION_BRANCH_ID)
          : [];

      return {
        receivedPurchase,
        stockBefore: before[0]?.quantity,
        stockAfter: after[0]?.quantity,
        productId: firstProductId,
      };
    },
    onSuccess: async ({
      receivedPurchase,
      stockBefore,
      stockAfter,
      productId,
    }) => {
      setPurchase(receivedPurchase);
      if (
        productId !== undefined &&
        stockBefore !== undefined &&
        stockAfter !== undefined
      ) {
        setStockNote(
          `Stock ${productId} en La Molina: ${stockBefore} → ${stockAfter}`,
        );
      }
      await queryClient.invalidateQueries({ queryKey: ["purchases"] });
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (cause) => {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo recibir la mercadería.",
      );
    },
  });

  return (
    <div className="space-y-4">
      <SectionCard
        title="Documento de compra"
        subtitle="Proveedor, líneas y recepción de mercadería"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Proveedor</Label>
            <Select
              value={supplierId}
              onValueChange={setSupplierId}
              disabled={locked}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona proveedor" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="purchase-notes">Notas</Label>
            <Input
              id="purchase-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={locked}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Líneas"
        subtitle="Productos del catálogo con costo unitario"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={locked}
            onClick={() =>
              setLines((current) => [...current, emptyPurchaseLine()])
            }
          >
            <Plus /> Agregar línea
          </Button>
        }
      >
        <div className="space-y-3">
          {lines.map((line) => (
            <div
              key={line.key}
              className="grid gap-2 sm:grid-cols-[1fr_5rem_7rem_auto]"
            >
              <Select
                value={line.productId}
                disabled={locked}
                onValueChange={(value) => {
                  const product = products.find((item) => item.id === value);
                  updateLine(line.key, {
                    productId: value,
                    description: product?.name ?? line.description,
                    unitCostSoles: moneyToSoles(product?.cost?.amount ?? 0),
                  });
                }}
              >
                <SelectTrigger aria-label="Producto">
                  <SelectValue placeholder="Producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.sku} · {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                value={line.quantity}
                disabled={locked}
                onChange={(event) =>
                  updateLine(line.key, { quantity: event.target.value })
                }
                className="tabular-nums"
                aria-label="Cantidad"
              />
              <Input
                value={line.unitCostSoles}
                disabled={locked}
                onChange={(event) =>
                  updateLine(line.key, {
                    unitCostSoles: event.target.value,
                  })
                }
                className="tabular-nums"
                aria-label="Costo unitario"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={locked || lines.length === 1}
                onClick={() =>
                  setLines((current) =>
                    current.filter((row) => row.key !== line.key),
                  )
                }
                aria-label="Quitar línea"
              >
                <Trash2 />
              </Button>
            </div>
          ))}

          <dl className="grid gap-2 text-xs sm:grid-cols-3">
            <div>
              <dt className="text-[11px] text-muted-foreground">Subtotal</dt>
              <dd className="font-semibold tabular-nums">
                {formatMoney(totals.subtotal)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">IGV</dt>
              <dd className="font-semibold tabular-nums">
                {formatMoney(totals.igv)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">Total</dt>
              <dd className="font-bold tabular-nums">
                {formatMoney(totals.total)}
              </dd>
            </div>
          </dl>

          {error ? (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          {emitMutation.isError && !error ? (
            <ErrorState
              title="No se pudo emitir"
              message={
                emitMutation.error instanceof Error
                  ? emitMutation.error.message
                  : "Revisa el documento."
              }
            />
          ) : null}

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={locked || emitMutation.isPending}
              onClick={() => emitMutation.mutate()}
            >
              {emitMutation.isPending ? "Emitiendo…" : "Emitir OC"}
            </Button>
            <Button
              type="button"
              disabled={!purchase || received || receiveMutation.isPending}
              onClick={() => receiveMutation.mutate()}
            >
              {receiveMutation.isPending ? "Recibiendo…" : "Recibir mercadería"}
            </Button>
          </div>
        </div>
      </SectionCard>

      {order || purchase ? (
        <SectionCard
          title="Documento emitido"
          subtitle="OC y recepción sobre el mismo pedido"
        >
          <div className="space-y-3 text-xs">
            {order ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{order.code}</span>
                <StatusBadge variant="neutral">
                  {PURCHASE_STATUS_LABELS[order.status]}
                </StatusBadge>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/compras/ordenes">Ver órdenes</Link>
                </Button>
              </div>
            ) : null}
            {purchase ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{purchase.code}</span>
                <StatusBadge
                  variant={
                    purchase.status === PurchaseStatus.Received
                      ? "success"
                      : "neutral"
                  }
                >
                  {PURCHASE_STATUS_LABELS[purchase.status]}
                </StatusBadge>
                <span className="tabular-nums text-muted-foreground">
                  {formatMoney(purchase.totals.total)}
                </span>
              </div>
            ) : null}
            {stockNote ? (
              <p className="font-medium tabular-nums">{stockNote}</p>
            ) : null}
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
