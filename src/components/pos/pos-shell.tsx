import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, PackageSearch, ScanBarcode, Search } from "lucide-react";
import { toast } from "sonner";

import { ErrorState } from "@/components/erp/data-states";
import {
  catalogItemToLine,
  countByCategory,
  filterPosCatalog,
  findCatalogBySku,
  type PosCatalogItem,
} from "@/components/pos/pos-catalog";
import {
  PosCategoryRail,
  type PosCategoryFilter,
} from "@/components/pos/pos-category-rail";
import { PosCheckout } from "@/components/pos/pos-checkout";
import { PosOrderPanel } from "@/components/pos/pos-order-panel";
import { PosProductCard } from "@/components/pos/pos-product-card";
import { PosReceipt } from "@/components/pos/pos-receipt";
import { formatCashShiftLabel } from "@/components/pos/cash-session-format";
import { usePosCatalog, usePosCustomers } from "@/components/pos/use-pos-data";
import { usePosTicket } from "@/components/pos/use-pos-ticket";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentMethod, type PosTicket } from "@/domain/pos";
import { money } from "@/domain/shared";
import { PosValidationError } from "@/mocks/pos/service";

const ALL_BRANDS = "__all__";

function todayLabel(): string {
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Lima",
  }).format(new Date());
}

export function PosShell() {
  const controller = usePosTicket();
  const { ticket, cashIsOpen, cashSession, quantities } = controller;
  const { catalog, isLoading } = usePosCatalog();
  const customers = usePosCustomers();
  const searchRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<PosCategoryFilter>("all");
  const [brand, setBrand] = useState(ALL_BRANDS);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.Cash,
  );
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    ticket: PosTicket;
    variant: "receipt" | "proforma";
  } | null>(null);

  const customerNames = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer.name])),
    [customers],
  );
  const activeCustomer = customers.find(
    (customer) => customer.id === controller.customerId,
  );
  const advanceBalance = activeCustomer?.advanceBalance ?? money(0);

  const brands = useMemo(
    () =>
      [
        ...new Set(catalog.map((item) => item.brand).filter(Boolean)),
      ].sort() as string[],
    [catalog],
  );
  const counts = useMemo(() => countByCategory(catalog), [catalog]);
  const visible = useMemo(
    () =>
      filterPosCatalog(catalog, search, category).filter(
        (item) => brand === ALL_BRANDS || item.brand === brand,
      ),
    [catalog, search, category, brand],
  );

  const openCheckout = (method: PaymentMethod = paymentMethod) => {
    if (!controller.canCheckout) {
      return;
    }
    setPaymentMethod(method);
    setCheckoutError(null);
    setCheckoutOpen(true);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F2") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "F9") {
        event.preventDefault();
        openCheckout();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const addItem = (item: PosCatalogItem) => {
    controller.addLine(catalogItemToLine(item));
  };

  const decrementItem = (item: PosCatalogItem) => {
    const entry = quantities.get(item.productId ?? item.serviceId ?? "");
    if (entry) {
      controller.setQuantity(entry.lineId, entry.quantity - 1);
    }
  };

  const addFromSearch = () => {
    const match = findCatalogBySku(catalog, search);
    if (match) {
      addItem(match);
      setSearch("");
      toast.success(`${match.name} agregado`);
      return;
    }
    if (visible.length === 1 && visible[0]) {
      addItem(visible[0]);
      setSearch("");
      toast.success(`${visible[0].name} agregado`);
      return;
    }
    controller.setError("No hay un SKU exacto. Elige un ítem de la grilla.");
  };

  const handlePay = (payments: Parameters<typeof controller.pay.mutate>[0]) => {
    controller.pay.mutate(payments, {
      onSuccess: (paid) => {
        setCheckoutOpen(false);
        setCheckoutError(null);
        setReceipt({ ticket: paid, variant: "receipt" });
        setPaymentMethod(PaymentMethod.Cash);
        toast.success(`Venta ${paid.documentNumber ?? paid.code} registrada`);
      },
      onError: (cause) =>
        setCheckoutError(
          cause instanceof PosValidationError || cause instanceof Error
            ? cause.message
            : "No se pudo confirmar el cobro.",
        ),
    });
  };

  return (
    <div className="space-y-4">
      {!controller.isCashLoading && !cashIsOpen ? (
        <ErrorState
          title="Caja cerrada"
          message="Abre la sesión de caja desde el footer del menú lateral para registrar ventas."
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[5.5rem_minmax(0,1fr)_minmax(22rem,26rem)]">
        <div className="xl:sticky xl:top-20 xl:self-start">
          <PosCategoryRail
            value={category}
            counts={counts}
            onChange={setCategory}
          />
        </div>

        <section className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h2 className="text-base font-extrabold tracking-tight">
                Punto de venta · Sede La Molina
              </h2>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] capitalize text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3.5" aria-hidden />
                  {todayLabel()}
                </span>
                {cashSession ? (
                  <span className="inline-flex items-center gap-1 normal-case">
                    <span className="size-1.5 rounded-full bg-success" />
                    {cashSession.code} ·{" "}
                    {formatCashShiftLabel(cashSession.openedAt)}
                  </span>
                ) : null}
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row lg:w-[30rem]">
              <form
                className="relative min-w-0 flex-1"
                onSubmit={(event) => {
                  event.preventDefault();
                  addFromSearch();
                }}
              >
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    controller.setError(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setSearch("");
                    }
                  }}
                  placeholder="Buscar producto o escanear SKU (F2)"
                  className="h-9 bg-background pl-9 pr-9"
                  aria-label="Buscar producto o SKU"
                  disabled={!cashIsOpen}
                />
                <ScanBarcode className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </form>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger
                  className="h-9 bg-background sm:w-40"
                  aria-label="Marca"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_BRANDS}>Todas las marcas</SelectItem>
                  {brands.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {controller.error ? (
            <p
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
              role="alert"
            >
              {controller.error}
            </p>
          ) : null}

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <div
                  key={index}
                  className="h-72 animate-pulse rounded-xl border border-border bg-card"
                />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
              <PackageSearch
                className="size-10 text-muted-foreground/60"
                aria-hidden
              />
              <p className="text-sm font-semibold">Sin resultados</p>
              <p className="text-xs text-muted-foreground">
                Prueba con otro nombre, SKU, categoría o marca.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
              {visible.map((item) => (
                <PosProductCard
                  key={item.key}
                  item={item}
                  quantity={
                    quantities.get(item.productId ?? item.serviceId ?? "")
                      ?.quantity ?? 0
                  }
                  disabled={!cashIsOpen}
                  onAdd={() => addItem(item)}
                  onDecrement={() => decrementItem(item)}
                />
              ))}
            </div>
          )}
        </section>

        <PosOrderPanel
          controller={controller}
          customers={customers}
          catalog={catalog}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={(method) => {
            setPaymentMethod(method);
            if (method === PaymentMethod.Advance) {
              openCheckout(method);
            }
          }}
          onCheckout={() => openCheckout()}
          onProforma={() =>
            ticket && setReceipt({ ticket, variant: "proforma" })
          }
        />
      </div>

      <PosCheckout
        ticket={ticket}
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onConfirm={handlePay}
        isPending={controller.pay.isPending}
        error={checkoutError}
        initialMethod={paymentMethod}
        advanceBalance={advanceBalance}
      />

      <PosReceipt
        ticket={receipt?.ticket ?? null}
        open={receipt !== null}
        onOpenChange={(open) => {
          if (open) {
            return;
          }
          if (
            receipt?.variant === "receipt" &&
            receipt.ticket.id === ticket?.id
          ) {
            controller.startNew();
          }
          setReceipt(null);
        }}
        variant={receipt?.variant ?? "receipt"}
        customerName={
          receipt?.ticket.customerId
            ? customerNames.get(receipt.ticket.customerId)
            : undefined
        }
        {...(receipt?.variant === "receipt" && receipt.ticket.id === ticket?.id
          ? { onNewSale: () => undefined }
          : {})}
      />
    </div>
  );
}
