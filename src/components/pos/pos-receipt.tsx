import { CheckCircle2, FileText, Printer } from "lucide-react";

import { formatDocumentLabel } from "@/components/pos/pos-payment-plan";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PAYMENT_METHOD_LABELS, type PosTicket } from "@/domain/pos";
import { formatMoney, money } from "@/domain/shared";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Lima",
  }).format(new Date(value));
}

export function PosReceipt({
  ticket,
  open,
  onOpenChange,
  onNewSale,
  variant = "receipt",
  customerName,
}: {
  ticket: PosTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewSale?: () => void;
  variant?: "receipt" | "proforma";
  customerName?: string | undefined;
}) {
  if (!ticket) {
    return null;
  }

  const isProforma = variant === "proforma";
  const documentLabel = isProforma
    ? `Proforma ${ticket.code}`
    : formatDocumentLabel(ticket);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center gap-2">
            {isProforma ? (
              <FileText className="size-5 text-primary" aria-hidden />
            ) : (
              <CheckCircle2 className="size-5 text-success" aria-hidden />
            )}
            {isProforma ? "Proforma de venta" : "Venta confirmada"}
          </DialogTitle>
          <DialogDescription>
            {isProforma
              ? "Documento referencial, sin valor tributario."
              : `Comprobante ${documentLabel} · ${ticket.code}`}
          </DialogDescription>
        </DialogHeader>

        <div
          id="pos-print-area"
          className="rounded-lg border border-dashed border-border bg-background p-4 font-mono text-[11px] leading-relaxed"
        >
          <div className="text-center">
            <img
              src="/4ruedas.png"
              alt="4 RUEDAS"
              className="mx-auto mb-1 h-8 w-auto object-contain"
            />
            <p className="font-bold">4 RUEDAS MECÁNICA AUTOMOTRIZ</p>
            <p className="text-muted-foreground">Sede La Molina</p>
            <p className="mt-1 font-bold">{documentLabel}</p>
            <p className="text-muted-foreground">
              {formatDateTime(ticket.updatedAt)}
            </p>
            <p>Cliente: {customerName ?? "Cliente varios"}</p>
          </div>
          <div className="my-2 border-t border-dashed border-border" />
          <ul className="space-y-1">
            {ticket.lines.map((line) => (
              <li key={line.id}>
                <p className="truncate">{line.description}</p>
                <p className="flex justify-between text-muted-foreground">
                  <span>
                    {line.quantity} × {formatMoney(line.unitPrice)}
                  </span>
                  <span className="text-foreground">
                    {formatMoney(
                      money(
                        line.quantity * line.unitPrice.amount,
                        line.unitPrice.currency,
                      ),
                    )}
                  </span>
                </p>
              </li>
            ))}
          </ul>
          <div className="my-2 border-t border-dashed border-border" />
          <dl className="grid grid-cols-2 gap-0.5">
            <dt>Subtotal</dt>
            <dd className="text-right">
              {formatMoney(ticket.totals.subtotal)}
            </dd>
            {ticket.totals.discount.amount > 0 ? (
              <>
                <dt>Descuento</dt>
                <dd className="text-right">
                  −{formatMoney(ticket.totals.discount)}
                </dd>
              </>
            ) : null}
            <dt>IGV 18%</dt>
            <dd className="text-right">{formatMoney(ticket.totals.igv)}</dd>
            {ticket.totals.rounding && ticket.totals.rounding.amount !== 0 ? (
              <>
                <dt>Redondeo</dt>
                <dd className="text-right">
                  {formatMoney(ticket.totals.rounding)}
                </dd>
              </>
            ) : null}
            <dt className="font-bold">TOTAL</dt>
            <dd className="text-right font-bold">
              {formatMoney(ticket.totals.total)}
            </dd>
          </dl>
          {!isProforma ? (
            <>
              <div className="my-2 border-t border-dashed border-border" />
              <ul className="space-y-0.5">
                {ticket.payments.map((payment) => (
                  <li key={payment.id} className="flex justify-between">
                    <span>
                      {PAYMENT_METHOD_LABELS[payment.method]}
                      {payment.reference ? ` (${payment.reference})` : ""}
                    </span>
                    <span>{formatMoney(payment.amount)}</span>
                  </li>
                ))}
                <li className="flex justify-between font-bold">
                  <span>Vuelto</span>
                  <span>{formatMoney(ticket.change)}</span>
                </li>
              </ul>
            </>
          ) : null}
          <p className="mt-3 text-center text-muted-foreground">
            ¡Gracias por su preferencia!
          </p>
        </div>

        <DialogFooter className="gap-2 print:hidden sm:gap-0">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" />
            Imprimir
          </Button>
          {onNewSale ? (
            <Button
              className="bg-critical text-critical-foreground hover:bg-critical/90"
              onClick={() => {
                onOpenChange(false);
                onNewSale();
              }}
            >
              Nueva venta
            </Button>
          ) : (
            <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
