import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  BRANCH_LABELS,
  branchLabel,
} from "@/components/inventory/inventory-table";
import {
  INSUFFICIENT_STOCK_MESSAGE,
  PHYSICAL_COUNT_REASON,
  planPhysicalAdjustments,
  planReturnQuantity,
} from "@/components/inventory/stock-ops";
import { SectionCard } from "@/components/erp/dashboard-ui";
import { ErrorState } from "@/components/erp/data-states";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  STOCK_RETURN_DIRECTION_LABELS,
  StockReturnDirection,
  adjustmentCreateSchema,
  returnCreateSchema,
  transferCreateSchema,
} from "@/domain/inventory";
import { ProductStatus } from "@/domain/products";
import { asEntityId } from "@/domain/shared";
import {
  InventoryValidationError,
  inventoryService,
} from "@/mocks/inventory/service";
import { productService } from "@/mocks/products/service";

const BRANCH_IDS = Object.keys(BRANCH_LABELS);

function useInventoryCatalog() {
  const productsQuery = useQuery({
    queryKey: ["products", "inventory-ops"],
    queryFn: () => productService.list({ pageSize: 100 }),
  });
  const stockQuery = useQuery({
    queryKey: ["inventory", "stock"],
    queryFn: () => inventoryService.getStock(),
  });

  const products = useMemo(
    () =>
      (productsQuery.data?.items ?? []).filter(
        (product) => product.status === ProductStatus.Active,
      ),
    [productsQuery.data],
  );

  return { products, stock: stockQuery.data ?? [], stockQuery };
}

function stockOf(
  stock: readonly { productId: string; branchId: string; quantity: number }[],
  productId: string,
  branchId: string,
): number | undefined {
  return stock.find(
    (row) => row.productId === productId && row.branchId === branchId,
  )?.quantity;
}

function operationError(cause: unknown, fallback: string): string {
  if (cause instanceof InventoryValidationError) {
    return cause.message;
  }
  if (cause instanceof Error && cause.message.trim()) {
    return cause.message;
  }
  return fallback;
}

function ConfirmAction({
  open,
  title,
  description,
  onOpenChange,
  onConfirm,
  pending,
}: {
  open: boolean;
  title: string;
  description: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending?: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {pending ? "Confirmando…" : "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function TransferForm() {
  const queryClient = useQueryClient();
  const { products, stock } = useInventoryCatalog();
  const [fromBranchId, setFromBranchId] = useState("BR-LM");
  const [toBranchId, setToBranchId] = useState("BR-SU");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const available = stockOf(stock, productId, fromBranchId);

  const mutation = useMutation({
    mutationFn: () =>
      inventoryService.transfer({
        fromBranchId: asEntityId(fromBranchId),
        toBranchId: asEntityId(toBranchId),
        lines: [
          {
            productId: asEntityId(productId),
            quantity: Math.floor(Number(quantity)),
          },
        ],
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      }),
    onSuccess: async (transfer) => {
      const from = await inventoryService.getStock(
        asEntityId(productId),
        asEntityId(fromBranchId),
      );
      const to = await inventoryService.getStock(
        asEntityId(productId),
        asEntityId(toBranchId),
      );
      setResult(
        `${transfer.code} recibida. ${branchLabel(fromBranchId)} ${from[0]?.quantity ?? 0} · ${branchLabel(toBranchId)} ${to[0]?.quantity ?? 0}`,
      );
      setError(null);
      setConfirm(false);
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (cause) => {
      setError(operationError(cause, INSUFFICIENT_STOCK_MESSAGE));
      setConfirm(false);
    },
  });

  const requestConfirm = () => {
    const parsed = transferCreateSchema.safeParse({
      fromBranchId: asEntityId(fromBranchId),
      toBranchId: asEntityId(toBranchId),
      lines: [
        {
          productId: asEntityId(productId || " "),
          quantity: Math.floor(Number(quantity)),
        },
      ],
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa la transferencia.");
      return;
    }
    if (available !== undefined && available < parsed.data.lines[0]!.quantity) {
      setError(INSUFFICIENT_STOCK_MESSAGE);
      return;
    }
    setError(null);
    setConfirm(true);
  };

  return (
    <SectionCard
      title="Nueva transferencia"
      subtitle="Mueve saldo entre La Molina, Surco y San Miguel"
    >
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Origen</Label>
            <Select value={fromBranchId} onValueChange={setFromBranchId}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BRANCH_IDS.map((id) => (
                  <SelectItem key={id} value={id}>
                    {BRANCH_LABELS[id]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Destino</Label>
            <Select value={toBranchId} onValueChange={setToBranchId}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BRANCH_IDS.map((id) => (
                  <SelectItem key={id} value={id}>
                    {BRANCH_LABELS[id]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Producto</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Selecciona producto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.sku} · {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transfer-qty">Cantidad</Label>
            <Input
              id="transfer-qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="bg-background tabular-nums"
            />
          </div>
        </div>
        <Input
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Notas (opcional)"
          className="bg-background"
        />
        <p className="text-[11px] text-muted-foreground">
          Saldo origen:{" "}
          <span className="tabular-nums font-medium">
            {available ?? "sin saldo"}
          </span>
        </p>
        {error ? (
          <ErrorState title="No se pudo transferir" message={error} />
        ) : null}
        {result ? (
          <p className="text-xs font-medium tabular-nums">{result}</p>
        ) : null}
        <div className="flex justify-end">
          <Button type="button" onClick={requestConfirm}>
            Transferir
          </Button>
        </div>
      </div>
      <ConfirmAction
        open={confirm}
        title="Confirmar transferencia"
        description={`Mover ${quantity} de ${branchLabel(fromBranchId)} a ${branchLabel(toBranchId)}.`}
        onOpenChange={setConfirm}
        pending={mutation.isPending}
        onConfirm={() => mutation.mutate()}
      />
    </SectionCard>
  );
}

export function ReturnForm() {
  const queryClient = useQueryClient();
  const { products, stock } = useInventoryCatalog();
  const [branchId, setBranchId] = useState("BR-LM");
  const [productId, setProductId] = useState("");
  const [direction, setDirection] = useState<StockReturnDirection>(
    StockReturnDirection.ToSupplier,
  );
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const current = stockOf(stock, productId, branchId);

  const mutation = useMutation({
    mutationFn: async () => {
      const qty = Math.floor(Number(quantity));
      const parsed = returnCreateSchema.safeParse({
        productId: asEntityId(productId),
        branchId: asEntityId(branchId),
        direction,
        quantity: qty,
        reason: reason.trim(),
      });
      if (!parsed.success) {
        throw new Error(
          parsed.error.issues[0]?.message ?? "Revisa la devolución.",
        );
      }
      const plan = planReturnQuantity(current, direction, qty);
      if (!plan.ok) {
        throw new Error(plan.message);
      }
      return inventoryService.adjust({
        productId: parsed.data.productId,
        branchId: parsed.data.branchId,
        newQuantity: plan.newQuantity,
        reason: parsed.data.reason,
      });
    },
    onSuccess: async (adjustment) => {
      const after = await inventoryService.getStock(
        adjustment.productId,
        adjustment.branchId,
      );
      setResult(
        `${adjustment.code}. Stock ${branchLabel(branchId)}: ${after[0]?.quantity ?? 0}`,
      );
      setError(null);
      setConfirm(false);
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (cause) => {
      setError(operationError(cause, INSUFFICIENT_STOCK_MESSAGE));
      setConfirm(false);
    },
  });

  const requestConfirm = () => {
    const parsed = returnCreateSchema.safeParse({
      productId: asEntityId(productId || " "),
      branchId: asEntityId(branchId),
      direction,
      quantity: Math.floor(Number(quantity)),
      reason: reason.trim(),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa la devolución.");
      return;
    }
    const plan = planReturnQuantity(current, direction, parsed.data.quantity);
    if (!plan.ok) {
      setError(plan.message);
      return;
    }
    setError(null);
    setConfirm(true);
  };

  return (
    <SectionCard
      title="Nueva devolución"
      subtitle="A proveedor o de cliente, con motivo obligatorio"
    >
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Sede</Label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BRANCH_IDS.map((id) => (
                  <SelectItem key={id} value={id}>
                    {BRANCH_LABELS[id]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select
              value={direction}
              onValueChange={(value) =>
                setDirection(value as StockReturnDirection)
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(StockReturnDirection).map((value) => (
                  <SelectItem key={value} value={value}>
                    {STOCK_RETURN_DIRECTION_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Producto</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Selecciona producto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.sku} · {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="return-qty">Cantidad</Label>
            <Input
              id="return-qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="bg-background tabular-nums"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="return-reason">Motivo</Label>
          <Input
            id="return-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="bg-background"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Saldo actual:{" "}
          <span className="tabular-nums font-medium">
            {current ?? "sin saldo"}
          </span>
        </p>
        {error ? (
          <ErrorState title="No se pudo devolver" message={error} />
        ) : null}
        {result ? (
          <p className="text-xs font-medium tabular-nums">{result}</p>
        ) : null}
        <div className="flex justify-end">
          <Button type="button" onClick={requestConfirm}>
            Registrar devolución
          </Button>
        </div>
      </div>
      <ConfirmAction
        open={confirm}
        title="Confirmar devolución"
        description={`${STOCK_RETURN_DIRECTION_LABELS[direction]} de ${quantity} en ${branchLabel(branchId)}.`}
        onOpenChange={setConfirm}
        pending={mutation.isPending}
        onConfirm={() => mutation.mutate()}
      />
    </SectionCard>
  );
}

export function AdjustmentForm() {
  const queryClient = useQueryClient();
  const { products, stock } = useInventoryCatalog();
  const [branchId, setBranchId] = useState("BR-LM");
  const [productId, setProductId] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const current = stockOf(stock, productId, branchId);

  const mutation = useMutation({
    mutationFn: () =>
      inventoryService.adjust({
        productId: asEntityId(productId),
        branchId: asEntityId(branchId),
        newQuantity: Math.floor(Number(newQuantity)),
        reason: reason.trim(),
      }),
    onSuccess: async (adjustment) => {
      setResult(
        `${adjustment.code}. ${current ?? "—"} → ${adjustment.newQuantity}`,
      );
      setError(null);
      setConfirm(false);
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (cause) => {
      setError(operationError(cause, "No se pudo ajustar el stock."));
      setConfirm(false);
    },
  });

  const requestConfirm = () => {
    const parsed = adjustmentCreateSchema.safeParse({
      productId: asEntityId(productId || " "),
      branchId: asEntityId(branchId),
      newQuantity: Math.floor(Number(newQuantity)),
      reason: reason.trim(),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "El motivo es obligatorio.");
      return;
    }
    setError(null);
    setConfirm(true);
  };

  return (
    <SectionCard
      title="Nuevo ajuste"
      subtitle="El motivo es obligatorio para justificar el cambio"
    >
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Sede</Label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BRANCH_IDS.map((id) => (
                  <SelectItem key={id} value={id}>
                    {BRANCH_LABELS[id]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Producto</Label>
            <Select
              value={productId}
              onValueChange={(value) => {
                setProductId(value);
                const qty = stockOf(stock, value, branchId);
                if (qty !== undefined) {
                  setNewQuantity(String(qty));
                }
              }}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Selecciona producto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.sku} · {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adjust-qty">Nueva cantidad</Label>
            <Input
              id="adjust-qty"
              type="number"
              min={0}
              value={newQuantity}
              onChange={(event) => setNewQuantity(event.target.value)}
              className="bg-background tabular-nums"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adjust-reason">Motivo</Label>
            <Input
              id="adjust-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="bg-background"
            />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Saldo actual:{" "}
          <span className="tabular-nums font-medium">
            {current ?? "sin saldo"}
          </span>
        </p>
        {error ? (
          <ErrorState title="No se pudo ajustar" message={error} />
        ) : null}
        {result ? (
          <p className="text-xs font-medium tabular-nums">{result}</p>
        ) : null}
        <div className="flex justify-end">
          <Button type="button" onClick={requestConfirm}>
            Ajustar stock
          </Button>
        </div>
      </div>
      <ConfirmAction
        open={confirm}
        title="Confirmar ajuste"
        description={`Dejar ${newQuantity} en ${branchLabel(branchId)}. Motivo: ${reason.trim() || "—"}.`}
        onOpenChange={setConfirm}
        pending={mutation.isPending}
        onConfirm={() => mutation.mutate()}
      />
    </SectionCard>
  );
}

export function PhysicalCountForm() {
  const queryClient = useQueryClient();
  const { products, stock } = useInventoryCatalog();
  const [branchId, setBranchId] = useState("BR-LM");
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const rows = useMemo(() => {
    const names = new Map(products.map((product) => [product.id, product]));
    return stock
      .filter((balance) => balance.branchId === branchId)
      .map((balance) => ({
        productId: balance.productId,
        expected: balance.quantity,
        name: names.get(balance.productId)?.name ?? balance.productId,
        sku: names.get(balance.productId)?.sku ?? "—",
      }));
  }, [stock, products, branchId]);

  const mutation = useMutation({
    mutationFn: async () => {
      const lines = rows.map((row) => ({
        productId: asEntityId(row.productId),
        expected: row.expected,
        counted: Math.floor(Number(counts[row.productId] ?? row.expected)),
      }));
      const plans = planPhysicalAdjustments(
        asEntityId(branchId),
        lines,
        PHYSICAL_COUNT_REASON,
      );
      const created = [];
      for (const plan of plans) {
        created.push(await inventoryService.adjust(plan));
      }
      return created;
    },
    onSuccess: async (created) => {
      setResult(
        created.length === 0
          ? "Sin diferencias. No se generaron movimientos."
          : `${created.length} ajuste(s) por conteo físico.`,
      );
      setError(null);
      setConfirm(false);
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (cause) => {
      setError(operationError(cause, "No se pudo cerrar el conteo."));
      setConfirm(false);
    },
  });

  return (
    <SectionCard
      title="Conteo físico"
      subtitle="Las diferencias generan ajustes de inventario"
    >
      <div className="space-y-3">
        <div className="space-y-1.5 sm:max-w-xs">
          <Label>Sede</Label>
          <Select
            value={branchId}
            onValueChange={(value) => {
              setBranchId(value);
              setCounts({});
              setResult(null);
            }}
          >
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BRANCH_IDS.map((id) => (
                <SelectItem key={id} value={id}>
                  {BRANCH_LABELS[id]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {rows.map((row) => (
            <li
              key={row.productId}
              className="grid items-center gap-2 px-3 py-2 sm:grid-cols-[1fr_5rem_6rem]"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{row.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {row.sku} · sistema {row.expected}
                </p>
              </div>
              <span className="hidden text-[11px] tabular-nums text-muted-foreground sm:block">
                {row.expected}
              </span>
              <Input
                type="number"
                min={0}
                value={counts[row.productId] ?? String(row.expected)}
                onChange={(event) =>
                  setCounts((current) => ({
                    ...current,
                    [row.productId]: event.target.value,
                  }))
                }
                className="bg-background tabular-nums"
                aria-label={`Contado ${row.name}`}
              />
            </li>
          ))}
        </ul>
        {rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No hay saldos en {branchLabel(branchId)}.
          </p>
        ) : null}
        {error ? (
          <ErrorState title="No se pudo contar" message={error} />
        ) : null}
        {result ? (
          <p className="text-xs font-medium tabular-nums">{result}</p>
        ) : null}
        <div className="flex justify-end">
          <Button
            type="button"
            disabled={rows.length === 0}
            onClick={() => setConfirm(true)}
          >
            Cerrar conteo
          </Button>
        </div>
      </div>
      <ConfirmAction
        open={confirm}
        title="Confirmar conteo físico"
        description="Las diferencias respecto al sistema generarán ajustes."
        onOpenChange={setConfirm}
        pending={mutation.isPending}
        onConfirm={() => mutation.mutate()}
      />
    </SectionCard>
  );
}
