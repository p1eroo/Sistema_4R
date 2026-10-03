import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Banknote,
  BadgePercent,
  CreditCard,
  Landmark,
  Minus,
  Plus,
  Printer,
  QrCode,
  ReceiptText,
  ShoppingBag,
  Smartphone,
  Split,
  Trash2,
  UserPlus,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";

import { lineImage, type PosCatalogItem } from "@/components/pos/pos-catalog";
import {
  WALK_IN_CUSTOMER,
  type PosTicketController,
} from "@/components/pos/use-pos-ticket";
import { solesToMoney } from "@/components/estimates/estimate-money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  PAYMENT_METHOD_LABELS,
  POS_LINE_KIND_LABELS,
  PaymentMethod,
} from "@/domain/pos";
import { formatMoney, money, type Money } from "@/domain/shared";
import { cn } from "@/lib/utils";

export type PosCustomerOption = {
  readonly id: string;
  readonly name: string;
  readonly document?: string | undefined;
  readonly phone?: string | undefined;
  readonly advanceBalance: Money;
};

export type PosPaymentChoice = PaymentMethod;

const PAYMENT_TILES: readonly {
  method: PaymentMethod;
  icon: LucideIcon;
  tone: string;
}[] = [
  { method: PaymentMethod.Cash, icon: Banknote, tone: "text-success" },
  { method: PaymentMethod.Card, icon: CreditCard, tone: "text-primary" },
  { method: PaymentMethod.Yape, icon: Smartphone, tone: "text-chart-5" },
  { method: PaymentMethod.Plin, icon: QrCode, tone: "text-info" },
  {
    method: PaymentMethod.Transfer,
    icon: Landmark,
    tone: "text-secondary-foreground",
  },
  { method: PaymentMethod.Advance, icon: Wallet, tone: "text-warning" },
  { method: PaymentMethod.Mixed, icon: Split, tone: "text-critical" },
];

const ZERO = money(0);

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function PosOrderPanel({
  controller,
  customers,
  catalog,
  paymentMethod,
  onPaymentMethodChange,
  onCheckout,
  onProforma,
}: {
  controller: PosTicketController;
  customers: readonly PosCustomerOption[];
  catalog: readonly PosCatalogItem[];
  paymentMethod: PosPaymentChoice;
  onPaymentMethodChange: (method: PosPaymentChoice) => void;
  onCheckout: () => void;
  onProforma: () => void;
}) {
  const { ticket, customerId, setCustomerId, cashIsOpen, canCheckout, isBusy } =
    controller;
  const lines = ticket?.lines ?? [];
  const totals = ticket?.totals;
  const itemCount = lines.reduce((acc, line) => acc + line.quantity, 0);
  const customer = customers.find((item) => item.id === customerId);
  const advanceBalance = customer?.advanceBalance ?? ZERO;
  const editable = cashIsOpen && ticket !== null;

  return (
    <aside className="flex min-w-0 flex-col gap-4">
      <section className="rounded-xl border border-border bg-card shadow-xs">
        <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <ShoppingBag className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold">Detalle de venta</h2>
              <p className="text-[11px] text-muted-foreground">
                {cashIsOpen ? "Ticket en curso" : "Caja cerrada"}
              </p>
            </div>
          </div>
          <span className="rounded-md bg-foreground px-2 py-1 font-mono text-[10px] font-bold text-background">
            #{ticket?.code ?? "TKT-—"}
          </span>
        </header>

        <div className="space-y-3 border-b border-border px-4 py-3.5">
          <p className="text-xs font-bold">Cliente</p>
          <div className="flex gap-2">
            <Select
              value={customerId}
              onValueChange={setCustomerId}
              disabled={!editable}
            >
              <SelectTrigger
                className="min-w-0 flex-1 bg-background"
                aria-label="Cliente"
              >
                <SelectValue placeholder="Selecciona cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={WALK_IN_CUSTOMER}>Cliente varios</SelectItem>
                {customers.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              asChild
              size="icon"
              className="shrink-0 bg-success text-white hover:bg-success/90"
              title="Registrar cliente"
            >
              <Link to="/clientes" aria-label="Registrar cliente">
                <UserPlus className="size-4" />
              </Link>
            </Button>
          </div>

          {customer ? (
            <div className="relative flex items-center gap-3 rounded-lg border border-warning/40 bg-warning/8 p-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {initials(customer.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold">
                  {customer.name}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {[customer.document, customer.phone]
                    .filter(Boolean)
                    .join(" · ") || "Sin datos de contacto"}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Anticipo disponible:{" "}
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 font-bold tabular-nums",
                      advanceBalance.amount > 0
                        ? "bg-success text-white"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {formatMoney(advanceBalance)}
                  </span>
                </p>
              </div>
              {advanceBalance.amount > 0 ? (
                <Button
                  size="sm"
                  className="h-7 shrink-0 bg-warning px-2.5 text-[11px] text-white hover:bg-warning/90"
                  disabled={!canCheckout}
                  onClick={() => onPaymentMethodChange(PaymentMethod.Advance)}
                >
                  Usar
                </Button>
              ) : null}
              <button
                type="button"
                aria-label="Quitar cliente"
                className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-destructive text-white shadow-sm disabled:opacity-50"
                disabled={!editable}
                onClick={() => setCustomerId(WALK_IN_CUSTOMER)}
              >
                <X className="size-3" />
              </button>
            </div>
          ) : null}
        </div>

        <div className="px-4 py-3.5">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold">Productos</p>
              <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Ítems: {itemCount}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={!editable || lines.length === 0}
              onClick={controller.clearLines}
            >
              Limpiar todo
            </Button>
          </div>

          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-8 text-center">
              <ReceiptText
                className="size-8 text-muted-foreground/60"
                aria-hidden
              />
              <p className="text-xs font-semibold">Ticket vacío</p>
              <p className="text-[11px] text-muted-foreground">
                Toca un producto o escanea un SKU para agregarlo.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {lines.map((line) => {
                const lineTotal = money(
                  line.quantity * line.unitPrice.amount,
                  line.unitPrice.currency,
                );
                const catalogItem = catalog.find(
                  (item) =>
                    (line.productId && item.productId === line.productId) ||
                    (line.serviceId && item.serviceId === line.serviceId),
                );
                const maxed =
                  catalogItem?.stock !== undefined &&
                  line.quantity >= catalogItem.stock;

                return (
                  <li
                    key={line.id}
                    className="flex items-center gap-2.5 px-2.5 py-2 animate-in fade-in slide-in-from-right-2"
                  >
                    <img
                      src={lineImage(catalog, line)}
                      alt=""
                      className="size-10 shrink-0 rounded-md bg-muted/60 object-contain p-1"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">
                        {line.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {POS_LINE_KIND_LABELS[line.kind]} ·{" "}
                        {formatMoney(line.unitPrice)}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <button
                          type="button"
                          aria-label={`Restar ${line.description}`}
                          disabled={!editable}
                          onClick={() =>
                            controller.setQuantity(line.id, line.quantity - 1)
                          }
                          className="grid size-5 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="min-w-4 text-center text-[11px] font-bold tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Sumar ${line.description}`}
                          disabled={!editable || maxed}
                          onClick={() =>
                            controller.setQuantity(line.id, line.quantity + 1)
                          }
                          className="grid size-5 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-xs font-bold tabular-nums">
                        {formatMoney(lineTotal)}
                      </p>
                      <button
                        type="button"
                        aria-label={`Eliminar ${line.description}`}
                        disabled={!editable}
                        onClick={() => controller.removeLine(line.id)}
                        className="grid size-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {ticket?.globalDiscount && ticket.globalDiscount.amount > 0 ? (
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-chart-5/40 bg-chart-5/8 p-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-chart-5 text-white">
                <BadgePercent className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-chart-5">
                  Descuento {formatMoney(ticket.globalDiscount)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Aplicado sobre el subtotal antes de IGV.
                </p>
              </div>
              <button
                type="button"
                aria-label="Quitar descuento"
                disabled={!editable}
                onClick={() =>
                  controller.setAdjustments({ globalDiscount: null })
                }
                className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card px-4 py-3.5 shadow-xs">
        <h2 className="mb-2.5 text-xs font-bold">Resumen de pago</h2>
        <dl className="space-y-2 text-xs">
          <SummaryRow
            label="Subtotal"
            value={formatMoney(totals?.subtotal ?? ZERO)}
          />
          <div className="flex items-center justify-between gap-2">
            <dt className="flex items-center gap-1.5 text-destructive">
              Descuento
              <DiscountEditor
                subtotal={totals?.subtotal ?? ZERO}
                disabled={!editable || lines.length === 0}
                onApply={(value) =>
                  controller.setAdjustments({ globalDiscount: value })
                }
              />
            </dt>
            <dd className="font-semibold tabular-nums text-destructive">
              −{formatMoney(totals?.discount ?? ZERO)}
            </dd>
          </div>
          <SummaryRow
            label="IGV (18%)"
            value={formatMoney(totals?.igv ?? ZERO)}
          />
          <div className="flex items-center justify-between gap-2">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <Switch
                checked={ticket?.roundTotal ?? false}
                disabled={!editable}
                onCheckedChange={(checked) =>
                  controller.setAdjustments({ roundTotal: checked })
                }
                aria-label="Redondear total"
                className="data-[state=checked]:bg-warning"
              />
              Redondeo
            </dt>
            <dd className="tabular-nums text-muted-foreground">
              {formatMoney(totals?.rounding ?? ZERO)}
            </dd>
          </div>
        </dl>
        <div className="mt-3 flex items-end justify-between gap-2 border-t border-border pt-3">
          <p className="text-sm font-bold">Total a pagar</p>
          <p className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
            {formatMoney(totals?.total ?? ZERO)}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card px-4 py-3.5 shadow-xs">
        <h2 className="mb-2.5 text-xs font-bold">Método de pago</h2>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_TILES.map(({ method, icon: Icon, tone }) => {
            const unavailable =
              method === PaymentMethod.Advance && advanceBalance.amount <= 0;
            const active = paymentMethod === method;
            return (
              <button
                key={method}
                type="button"
                disabled={unavailable}
                aria-pressed={active}
                onClick={() => onPaymentMethodChange(method)}
                title={
                  unavailable ? "El cliente no tiene anticipos" : undefined
                }
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border bg-background px-1.5 py-2.5 text-[11px] font-semibold transition-all",
                  "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xs disabled:pointer-events-none disabled:opacity-40",
                  active
                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/30"
                    : "border-border text-foreground",
                )}
              >
                <Icon
                  className={cn("size-5", active ? "text-primary" : tone)}
                  aria-hidden
                />
                {method === PaymentMethod.Mixed
                  ? "Dividir"
                  : PAYMENT_METHOD_LABELS[method]}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
        <Button
          variant="outline"
          className="h-11 bg-card"
          disabled={!ticket || lines.length === 0}
          onClick={onProforma}
        >
          <Printer className="size-4" />
          Proforma
        </Button>
        <Button
          className="h-11 bg-critical text-sm font-bold text-critical-foreground hover:bg-critical/90"
          disabled={!canCheckout || isBusy}
          onClick={onCheckout}
        >
          Cobrar {formatMoney(totals?.total ?? ZERO)}
        </Button>
      </div>
    </aside>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

function DiscountEditor({
  subtotal,
  disabled,
  onApply,
}: {
  subtotal: Money;
  disabled: boolean;
  onApply: (value: Money) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"amount" | "percent">("percent");
  const [value, setValue] = useState("");

  const parsed = Number(value.replace(",", "."));
  const discount =
    mode === "percent"
      ? money(
          Math.round(
            (subtotal.amount * Math.min(100, Math.max(0, parsed || 0))) / 100,
          ),
        )
      : solesToMoney(value);
  const valid = discount.amount > 0 && discount.amount <= subtotal.amount;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="rounded px-1 text-[10px] font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-40"
        >
          Editar
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 space-y-3">
        <p className="text-xs font-bold">Descuento global</p>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(next) => next && setMode(next as typeof mode)}
          className="grid grid-cols-2"
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="percent">Porcentaje</ToggleGroupItem>
          <ToggleGroupItem value="amount">Monto S/</ToggleGroupItem>
        </ToggleGroup>
        <div className="flex gap-1.5">
          {(mode === "percent" ? ["5", "10", "15"] : ["5", "10", "20"]).map(
            (preset) => (
              <Button
                key={preset}
                type="button"
                size="sm"
                variant="secondary"
                className="h-7 flex-1 text-[11px]"
                onClick={() => setValue(preset)}
              >
                {mode === "percent" ? `${preset}%` : `S/ ${preset}`}
              </Button>
            ),
          )}
        </div>
        <Input
          autoFocus
          inputMode="decimal"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={mode === "percent" ? "Ej. 10" : "Ej. 15.00"}
          aria-label="Valor del descuento"
          className="tabular-nums"
        />
        <p className="text-[11px] text-muted-foreground">
          Equivale a{" "}
          <span className="font-semibold text-foreground">
            {formatMoney(discount)}
          </span>
          {!valid && value ? " · supera el subtotal o no es válido" : ""}
        </p>
        <Button
          type="button"
          className="w-full"
          size="sm"
          disabled={!valid}
          onClick={() => {
            onApply(discount);
            setOpen(false);
            setValue("");
          }}
        >
          Aplicar descuento
        </Button>
      </PopoverContent>
    </Popover>
  );
}
