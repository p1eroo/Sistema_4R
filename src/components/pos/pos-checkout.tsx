import { useEffect, useState } from "react";
import { Plus, Trash2, Wallet } from "lucide-react";

import {
  POS_CHECKOUT_METHODS,
  advanceOverdraw,
  canConfirmCheckout,
  cashTenderSuggestions,
  createPaymentRow,
  initialPaymentRows,
  paymentChange,
  paymentShortfall,
  rowsToPaymentValues,
  type PosPaymentRow,
} from "@/components/pos/pos-payment-plan";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
  type PosTicket,
} from "@/domain/pos";
import type { PosPaymentValues } from "@/domain/pos/schemas";
import { formatMoney, money, type Money } from "@/domain/shared";
import { cn } from "@/lib/utils";

const ZERO = money(0);

export function PosCheckout({
  ticket,
  open,
  onOpenChange,
  onConfirm,
  isPending,
  error,
  initialMethod = PaymentMethod.Cash,
  advanceBalance = ZERO,
}: {
  ticket: PosTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payments: PosPaymentValues[]) => void;
  isPending: boolean;
  error: string | null;
  initialMethod?: PaymentMethod;
  advanceBalance?: Money;
}) {
  const [rows, setRows] = useState<PosPaymentRow[]>([]);

  useEffect(() => {
    if (!open || !ticket) {
      return;
    }
    setRows(
      initialPaymentRows(initialMethod, ticket.totals.total, advanceBalance),
    );
    // Solo al abrir: no reiniciar lo que el cajero ya editó.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!ticket) {
    return null;
  }

  const total = ticket.totals.total;
  const overdraw = advanceOverdraw(rows, advanceBalance);
  const ready = canConfirmCheckout(rows, total) && overdraw.amount === 0;
  const shortfall = paymentShortfall(rows, total);
  const change = paymentChange(rows, total);
  const methods = POS_CHECKOUT_METHODS.filter(
    (method) => method !== PaymentMethod.Advance || advanceBalance.amount > 0,
  );

  const updateRow = (id: string, patch: Partial<PosPaymentRow>) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cobrar ticket</DialogTitle>
          <DialogDescription>{ticket.code}</DialogDescription>
        </DialogHeader>

        <div className="rounded-xl bg-foreground px-4 py-3 text-background">
          <p className="text-[11px] font-medium uppercase tracking-wide opacity-70">
            Total a cobrar
          </p>
          <p className="text-3xl font-extrabold tabular-nums">
            {formatMoney(total)}
          </p>
        </div>

        {advanceBalance.amount > 0 ? (
          <p className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/8 px-3 py-2 text-xs">
            <Wallet className="size-4 text-warning" aria-hidden />
            Anticipo disponible del cliente:
            <span className="font-bold tabular-nums">
              {formatMoney(advanceBalance)}
            </span>
          </p>
        ) : null}

        <div className="space-y-3">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
            >
              <div className="space-y-1">
                <Label>Método</Label>
                <Select
                  value={row.method}
                  onValueChange={(value) =>
                    updateRow(row.id, {
                      method: value as PosPaymentRow["method"],
                    })
                  }
                >
                  <SelectTrigger className="bg-white/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {methods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {PAYMENT_METHOD_LABELS[method]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Monto (S/)</Label>
                <Input
                  inputMode="decimal"
                  value={row.amountSoles}
                  onChange={(event) =>
                    updateRow(row.id, { amountSoles: event.target.value })
                  }
                  onFocus={(event) => event.target.select()}
                  className="bg-white/70 tabular-nums"
                  aria-label={`Monto pago ${index + 1}`}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={rows.length === 1}
                  onClick={() =>
                    setRows((current) =>
                      current.filter((item) => item.id !== row.id),
                    )
                  }
                  aria-label="Quitar pago"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              {row.method === PaymentMethod.Cash ? (
                <div className="flex flex-wrap gap-1.5 sm:col-span-3">
                  {cashTenderSuggestions(total).map((value, tenderIndex) => (
                    <Button
                      key={value.amount}
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-7 text-[11px] tabular-nums"
                      onClick={() =>
                        updateRow(row.id, {
                          amountSoles: (value.amount / 100).toFixed(2),
                        })
                      }
                    >
                      {tenderIndex === 0 ? "Exacto" : formatMoney(value)}
                    </Button>
                  ))}
                </div>
              ) : row.method !== PaymentMethod.Advance ? (
                <div className="space-y-1 sm:col-span-2">
                  <Label>Referencia (opcional)</Label>
                  <Input
                    value={row.reference ?? ""}
                    onChange={(event) =>
                      updateRow(row.id, { reference: event.target.value })
                    }
                    className="bg-white/70"
                    placeholder="N.° de operación o voucher"
                  />
                </div>
              ) : null}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              setRows((current) => [
                ...current,
                createPaymentRow(PaymentMethod.Card, ""),
              ])
            }
          >
            <Plus className="size-4" />
            Agregar pago
          </Button>

          <dl className="grid grid-cols-2 gap-1 rounded-lg bg-muted/40 p-3 text-xs">
            <dt className="text-muted-foreground">Faltante</dt>
            <dd
              className={cn(
                "text-right font-semibold tabular-nums",
                shortfall.amount > 0 && "text-destructive",
              )}
            >
              {shortfall.amount > 0 ? formatMoney(shortfall) : "—"}
            </dd>
            <dt className="text-muted-foreground">Vuelto</dt>
            <dd className="text-right text-base font-extrabold tabular-nums text-success">
              {change.amount > 0 ? formatMoney(change) : "—"}
            </dd>
          </dl>

          {overdraw.amount > 0 ? (
            <p className="text-xs text-destructive" role="alert">
              El anticipo supera el saldo disponible en {formatMoney(overdraw)}.
            </p>
          ) : null}
          {error ? (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {!ready && rows.some((row) => row.amountSoles.trim()) ? (
            <p className="text-xs text-muted-foreground">
              Los pagos deben cubrir el total para confirmar.
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-critical text-critical-foreground hover:bg-critical/90"
            disabled={!ready || isPending}
            onClick={() => onConfirm(rowsToPaymentValues(rows))}
          >
            Confirmar cobro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
