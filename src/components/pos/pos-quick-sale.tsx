import { useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  CreditCard,
  Keyboard,
  Landmark,
  Minus,
  Plus,
  QrCode,
  ScanBarcode,
  Smartphone,
  Trash2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { ErrorState } from "@/components/erp/data-states";
import { solesToMoney } from "@/components/estimates/estimate-money";
import {
  catalogItemToLine,
  filterPosCatalog,
  findCatalogBySku,
  lineImage,
  type PosCatalogItem,
} from "@/components/pos/pos-catalog";
import { cashTenderSuggestions } from "@/components/pos/pos-payment-plan";
import { PosReceipt } from "@/components/pos/pos-receipt";
import { usePosCatalog, usePosCustomers } from "@/components/pos/use-pos-data";
import {
  usePosTicket,
  WALK_IN_CUSTOMER,
} from "@/components/pos/use-pos-ticket";
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
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
  type PosTicket,
} from "@/domain/pos";
import { formatMoney, money } from "@/domain/shared";
import { cn } from "@/lib/utils";

const QUICK_METHODS: readonly { method: PaymentMethod; icon: LucideIcon }[] = [
  { method: PaymentMethod.Cash, icon: Banknote },
  { method: PaymentMethod.Card, icon: CreditCard },
  { method: PaymentMethod.Yape, icon: Smartphone },
  { method: PaymentMethod.Plin, icon: QrCode },
  { method: PaymentMethod.Transfer, icon: Landmark },
];

const SHORTCUTS: readonly [string, string][] = [
  ["F2", "Buscar / escanear"],
  ["↑ ↓", "Elegir resultado"],
  ["Enter", "Agregar ítem"],
  ["F4", "Monto recibido"],
  ["F9", "Cobrar"],
  ["Esc", "Limpiar búsqueda"],
];

export function PosQuickSale() {
  const controller = usePosTicket();
  const { ticket, cashIsOpen } = controller;
  const { catalog } = usePosCatalog();
  const customers = usePosCustomers();
  const searchRef = useRef<HTMLInputElement>(null);
  const receivedRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
  const [received, setReceived] = useState("");
  const [reference, setReference] = useState("");
  const [receipt, setReceipt] = useState<PosTicket | null>(null);

  const results = useMemo(
    () => (search.trim() ? filterPosCatalog(catalog, search).slice(0, 6) : []),
    [catalog, search],
  );
  const total = ticket?.totals.total ?? money(0);
  const lines = ticket?.lines ?? [];
  const isCash = method === PaymentMethod.Cash;
  const receivedMoney = isCash ? solesToMoney(received) : total;
  const change = money(Math.max(0, receivedMoney.amount - total.amount));
  const missing = money(Math.max(0, total.amount - receivedMoney.amount));
  const ready =
    controller.canCheckout &&
    !controller.pay.isPending &&
    receivedMoney.amount >= total.amount;

  useEffect(() => {
    searchRef.current?.focus();
  }, [cashIsOpen]);

  const addItem = (item: PosCatalogItem) => {
    controller.addLine(catalogItemToLine(item));
    setSearch("");
    setHighlight(0);
    searchRef.current?.focus();
  };

  const submitSearch = () => {
    const exact = findCatalogBySku(catalog, search);
    const chosen = exact ?? results[highlight];
    if (chosen) {
      addItem(chosen);
    } else if (search.trim()) {
      controller.setError(`No se encontró “${search.trim()}”.`);
    }
  };

  const charge = () => {
    if (!ready) {
      return;
    }
    controller.pay.mutate(
      [
        {
          method,
          amount: receivedMoney,
          ...(reference.trim() ? { reference: reference.trim() } : {}),
        },
      ],
      {
        onSuccess: (paid) => {
          setReceipt(paid);
          setReceived("");
          setReference("");
          toast.success(`Venta ${paid.documentNumber ?? paid.code} cobrada`);
        },
        onError: (cause) =>
          controller.setError(
            cause instanceof Error ? cause.message : "No se pudo cobrar.",
          ),
      },
    );
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F2") {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.key === "F4") {
        event.preventDefault();
        receivedRef.current?.focus();
      } else if (event.key === "F9") {
        event.preventDefault();
        charge();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const newSale = () => {
    controller.startNew();
    setMethod(PaymentMethod.Cash);
    setTimeout(() => searchRef.current?.focus(), 0);
  };

  return (
    <div className="space-y-4">
      {!controller.isCashLoading && !cashIsOpen ? (
        <ErrorState
          title="Caja cerrada"
          message="Abre la sesión de caja desde el footer del menú lateral para registrar ventas."
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] 2xl:grid-cols-[minmax(0,1fr)_26rem]">
        <section className="min-w-0 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-lg bg-critical/10 text-critical">
                <Zap className="size-4" aria-hidden />
              </span>
              <div>
                <h2 className="text-sm font-bold">Venta rápida de mostrador</h2>
                <p className="text-[11px] text-muted-foreground">
                  Escanea o escribe el SKU y presiona Enter. Cobra con F9.
                </p>
              </div>
            </div>
            <div className="relative mt-3">
              <ScanBarcode className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={search}
                disabled={!cashIsOpen}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setHighlight(0);
                  controller.setError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    submitSearch();
                  } else if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setHighlight((value) =>
                      Math.min(value + 1, Math.max(0, results.length - 1)),
                    );
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setHighlight((value) => Math.max(0, value - 1));
                  } else if (event.key === "Escape") {
                    setSearch("");
                  }
                }}
                placeholder="SKU, código de barras o nombre…"
                aria-label="Buscar o escanear producto"
                className="h-12 bg-background pl-11 text-base font-medium"
                autoComplete="off"
              />
              {results.length > 0 ? (
                <ul
                  role="listbox"
                  className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
                >
                  {results.map((item, index) => (
                    <li
                      key={item.key}
                      role="option"
                      aria-selected={index === highlight}
                    >
                      <button
                        type="button"
                        onMouseEnter={() => setHighlight(index)}
                        onClick={() => addItem(item)}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2 text-left",
                          index === highlight ? "bg-accent" : "bg-transparent",
                        )}
                      >
                        <img
                          src={item.image}
                          alt=""
                          className="size-10 rounded-md bg-muted/60 object-contain p-1"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold">
                            {item.name}
                          </span>
                          <span className="block truncate font-mono text-[10px] text-muted-foreground">
                            {item.sku}
                            {item.stock !== undefined
                              ? ` · Stock ${item.stock}`
                              : " · Servicio"}
                          </span>
                        </span>
                        <span className="text-xs font-bold tabular-nums">
                          {formatMoney(item.price)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            {controller.error ? (
              <p className="mt-2 text-xs text-destructive" role="alert">
                {controller.error}
              </p>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-bold">Ticket {ticket?.code ?? ""}</p>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={lines.length === 0 || !cashIsOpen}
                onClick={controller.clearLines}
              >
                Vaciar
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-xs">
                <thead className="bg-muted/40 text-[11px] text-muted-foreground">
                  <tr>
                    <th className="w-10 px-4 py-2 text-left font-semibold">
                      #
                    </th>
                    <th className="px-2 py-2 text-left font-semibold">
                      Descripción
                    </th>
                    <th className="px-2 py-2 text-center font-semibold">
                      Cant.
                    </th>
                    <th className="px-2 py-2 text-right font-semibold">
                      P. unit.
                    </th>
                    <th className="px-2 py-2 text-right font-semibold">
                      Importe
                    </th>
                    <th className="w-10 px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lines.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-muted-foreground"
                      >
                        Aún no hay ítems. Escanea un producto para empezar.
                      </td>
                    </tr>
                  ) : (
                    lines.map((line, index) => (
                      <tr key={line.id} className="animate-in fade-in">
                        <td className="px-4 py-2 text-muted-foreground tabular-nums">
                          {index + 1}
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={lineImage(catalog, line)}
                              alt=""
                              className="size-8 rounded bg-muted/60 object-contain p-0.5"
                            />
                            <span className="font-semibold">
                              {line.description}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="size-6"
                              aria-label="Restar"
                              onClick={() =>
                                controller.setQuantity(
                                  line.id,
                                  line.quantity - 1,
                                )
                              }
                            >
                              <Minus className="size-3" />
                            </Button>
                            <span className="w-6 text-center font-bold tabular-nums">
                              {line.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="size-6"
                              aria-label="Sumar"
                              onClick={() =>
                                controller.setQuantity(
                                  line.id,
                                  line.quantity + 1,
                                )
                              }
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {formatMoney(line.unitPrice)}
                        </td>
                        <td className="px-2 py-2 text-right font-bold tabular-nums">
                          {formatMoney(
                            money(
                              line.quantity * line.unitPrice.amount,
                              line.unitPrice.currency,
                            ),
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            aria-label={`Eliminar ${line.description}`}
                            onClick={() => controller.removeLine(line.id)}
                            className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <Keyboard className="size-4" aria-hidden />
            {SHORTCUTS.map(([key, label]) => (
              <span key={key} className="inline-flex items-center gap-1">
                <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] font-bold text-foreground shadow-xs">
                  {key}
                </kbd>
                {label}
              </span>
            ))}
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl bg-foreground p-4 text-background shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide opacity-70">
              Total a cobrar
            </p>
            <p className="mt-1 text-4xl font-extrabold tabular-nums tracking-tight">
              {formatMoney(total)}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-1 text-[11px] opacity-80">
              <dt>Subtotal</dt>
              <dd className="text-right tabular-nums">
                {formatMoney(ticket?.totals.subtotal ?? money(0))}
              </dd>
              <dt>IGV 18%</dt>
              <dd className="text-right tabular-nums">
                {formatMoney(ticket?.totals.igv ?? money(0))}
              </dd>
              <dt>Ítems</dt>
              <dd className="text-right tabular-nums">
                {lines.reduce((acc, line) => acc + line.quantity, 0)}
              </dd>
            </dl>
          </div>

          <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs">
            <div className="space-y-1.5">
              <p className="text-xs font-bold">Cliente</p>
              <Select
                value={controller.customerId}
                onValueChange={controller.setCustomerId}
                disabled={!cashIsOpen}
              >
                <SelectTrigger className="bg-background" aria-label="Cliente">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={WALK_IN_CUSTOMER}>
                    Cliente varios
                  </SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-bold">Método de pago</p>
              <div className="grid grid-cols-5 gap-1.5">
                {QUICK_METHODS.map(({ method: value, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={method === value}
                    onClick={() => setMethod(value)}
                    title={PAYMENT_METHOD_LABELS[value]}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[10px] font-semibold transition-colors",
                      method === value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    <span className="truncate">
                      {PAYMENT_METHOD_LABELS[value]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {isCash ? (
              <div className="space-y-1.5">
                <p className="text-xs font-bold">Recibido (F4)</p>
                <Input
                  ref={receivedRef}
                  inputMode="decimal"
                  value={received}
                  onChange={(event) => setReceived(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      charge();
                    }
                  }}
                  placeholder="0.00"
                  aria-label="Monto recibido"
                  className="h-11 bg-background text-lg font-bold tabular-nums"
                />
                <div className="grid grid-cols-4 gap-1.5">
                  {cashTenderSuggestions(total).map((value, index) => (
                    <Button
                      key={value.amount}
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-8 px-1 text-[11px] tabular-nums"
                      onClick={() =>
                        setReceived((value.amount / 100).toFixed(2))
                      }
                    >
                      {index === 0 ? "Exacto" : formatMoney(value)}
                    </Button>
                  ))}
                </div>
                <dl className="grid grid-cols-2 gap-1 rounded-lg bg-muted/40 p-3 text-xs">
                  <dt className="text-muted-foreground">Falta</dt>
                  <dd
                    className={cn(
                      "text-right font-semibold tabular-nums",
                      missing.amount > 0 && "text-destructive",
                    )}
                  >
                    {missing.amount > 0 ? formatMoney(missing) : "—"}
                  </dd>
                  <dt className="text-muted-foreground">Vuelto</dt>
                  <dd className="text-right text-lg font-extrabold tabular-nums text-success">
                    {formatMoney(change)}
                  </dd>
                </dl>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-xs font-bold">Referencia</p>
                <Input
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="N.° de operación o voucher (opcional)"
                  aria-label="Referencia del pago"
                  className="bg-background"
                />
              </div>
            )}

            <Button
              className="h-12 w-full bg-critical text-base font-bold text-critical-foreground hover:bg-critical/90"
              disabled={!ready}
              onClick={charge}
            >
              Cobrar {formatMoney(total)}
              <kbd className="ml-1 rounded bg-white/20 px-1.5 py-0.5 font-mono text-[10px]">
                F9
              </kbd>
            </Button>
          </div>
        </aside>
      </div>

      <PosReceipt
        ticket={receipt}
        open={receipt !== null}
        onOpenChange={(open) => {
          if (!open) {
            setReceipt(null);
            newSale();
          }
        }}
        customerName={
          receipt?.customerId
            ? customers.find((customer) => customer.id === receipt.customerId)
                ?.name
            : undefined
        }
        onNewSale={newSale}
      />
    </div>
  );
}
