import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  CircleCheck,
  Eye,
  HandCoins,
  Plus,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { MetricCard, StatusBadge } from "@/components/erp/dashboard-ui";
import { EmptyState, LoadingState } from "@/components/erp/data-states";
import {
  ListToolbar,
  ListToolbarChips,
  ListToolbarSearch,
} from "@/components/erp/list-toolbar";
import { solesToMoney } from "@/components/estimates/estimate-money";
import { useCashSession } from "@/components/pos/use-cash-session";
import { POS_BRANCH_ID } from "@/components/pos/use-pos-ticket";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  ADVANCE_PAYMENT_METHODS,
  ADVANCE_STATUS_LABELS,
  AdvanceStatus,
  advanceAppliedAmount,
  advanceBalance,
  type AdvancePaymentMethod,
  type CustomerAdvance,
} from "@/domain/advances";
import { CashMovementType } from "@/domain/cash";
import { PAYMENT_METHOD_LABELS, PaymentMethod } from "@/domain/pos";
import { asEntityId, formatMoney, money } from "@/domain/shared";
import { advanceService } from "@/mocks/advances/service";
import { cashService } from "@/mocks/cash/service";
import { customerService } from "@/mocks/customers/service";

type StatusFilter = "all" | AdvanceStatus;

const STATUS_FILTERS: readonly { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: AdvanceStatus.Active, label: "Con saldo" },
  { value: AdvanceStatus.Applied, label: "Aplicados" },
  { value: AdvanceStatus.Cancelled, label: "Anulados" },
];

const STATUS_VARIANT: Record<AdvanceStatus, "success" | "info" | "danger"> = {
  [AdvanceStatus.Active]: "success",
  [AdvanceStatus.Applied]: "info",
  [AdvanceStatus.Cancelled]: "danger",
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Lima",
  }).format(new Date(value));
}

function errorMessage(cause: unknown, fallback: string): string {
  return cause instanceof Error ? cause.message : fallback;
}

export function CustomerAdvanceList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const advancesQuery = useQuery({
    queryKey: ["advances", "all"],
    queryFn: () => advanceService.getAll(),
  });
  const customersQuery = useQuery({
    queryKey: ["customers", "pos"],
    queryFn: () => customerService.list({ pageSize: 100 }),
  });

  const customers = useMemo(
    () => customersQuery.data?.items ?? [],
    [customersQuery.data],
  );
  const customerNames = useMemo(
    () =>
      new Map(
        customers.map((customer) => [
          customer.id as string,
          customer.displayName,
        ]),
      ),
    [customers],
  );
  const advances = useMemo(
    () =>
      [...(advancesQuery.data ?? [])].sort((a, b) =>
        b.receivedAt.localeCompare(a.receivedAt),
      ),
    [advancesQuery.data],
  );

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return advances.filter((advance) => {
      if (status !== "all" && advance.status !== status) {
        return false;
      }
      if (!term) {
        return true;
      }
      return [
        advance.code,
        customerNames.get(advance.customerId),
        advance.reference,
        advance.concept,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [advances, search, status, customerNames]);

  const metrics = useMemo(() => {
    const valid = advances.filter(
      (advance) => advance.status !== AdvanceStatus.Cancelled,
    );
    const balance = valid.reduce(
      (acc, advance) => acc + advanceBalance(advance).amount,
      0,
    );
    const received = valid.reduce(
      (acc, advance) => acc + advance.amount.amount,
      0,
    );
    const applied = valid.reduce(
      (acc, advance) => acc + advanceAppliedAmount(advance).amount,
      0,
    );
    const withBalance = new Set(
      valid
        .filter((advance) => advanceBalance(advance).amount > 0)
        .map((advance) => advance.customerId),
    ).size;
    return { balance, received, applied, withBalance };
  }, [advances]);

  const detail = advances.find((advance) => advance.id === detailId) ?? null;
  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["advances"] }),
      queryClient.invalidateQueries({ queryKey: ["cash"] }),
    ]).then(() => undefined);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Saldo vigente a favor de clientes"
          value={formatMoney(money(metrics.balance))}
          detail="Disponible para aplicar en el POS"
          icon={Wallet}
        />
        <MetricCard
          label="Anticipos recibidos"
          value={formatMoney(money(metrics.received))}
          detail="Sin considerar anulados"
          icon={HandCoins}
          trend="up"
        />
        <MetricCard
          label="Aplicado a ventas"
          value={formatMoney(money(metrics.applied))}
          detail="Consumido en comprobantes"
          icon={CircleCheck}
        />
        <MetricCard
          label="Clientes con saldo"
          value={String(metrics.withBalance)}
          detail="Tienen anticipo por aplicar"
          icon={Users}
        />
      </div>

      <ListToolbar>
        <ListToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Buscar por código, cliente, referencia o concepto"
          ariaLabel="Buscar anticipos"
        />
        <ListToolbarChips>
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              size="sm"
              variant={status === filter.value ? "default" : "outline"}
              className="h-9"
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </ListToolbarChips>
        <Button className="h-9" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Nuevo anticipo
        </Button>
      </ListToolbar>

      {advancesQuery.isLoading ? (
        <LoadingState />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Sin anticipos"
          description="No hay anticipos que coincidan con los filtros."
        />
      ) : (
        <div className="glass-strong overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-xs">
              <thead className="bg-white/40 text-[11px] text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold">
                    Anticipo
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold">
                    Cliente
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold">Fecha</th>
                  <th className="px-3 py-2.5 text-left font-semibold">
                    Método
                  </th>
                  <th className="px-3 py-2.5 text-right font-semibold">
                    Monto
                  </th>
                  <th className="px-3 py-2.5 text-right font-semibold">
                    Aplicado
                  </th>
                  <th className="px-3 py-2.5 text-right font-semibold">
                    Saldo
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold">
                    Estado
                  </th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((advance) => {
                  const balance = advanceBalance(advance);
                  const applied = advanceAppliedAmount(advance);
                  const ratio =
                    advance.amount.amount > 0
                      ? Math.min(
                          100,
                          (applied.amount / advance.amount.amount) * 100,
                        )
                      : 0;
                  return (
                    <tr
                      key={advance.id}
                      className="cursor-pointer transition-colors hover:bg-muted/30"
                      onClick={() => setDetailId(advance.id)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold">{advance.code}</p>
                        <p className="max-w-56 truncate text-[11px] text-muted-foreground">
                          {advance.concept ?? "Sin concepto"}
                        </p>
                      </td>
                      <td className="px-3 py-3 font-medium">
                        {customerNames.get(advance.customerId) ??
                          advance.customerId}
                      </td>
                      <td className="px-3 py-3 tabular-nums">
                        {formatDateTime(advance.receivedAt)}
                      </td>
                      <td className="px-3 py-3">
                        {PAYMENT_METHOD_LABELS[advance.method]}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {formatMoney(advance.amount)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <p className="tabular-nums">{formatMoney(applied)}</p>
                        <div className="ml-auto mt-1 h-1 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-info"
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right font-bold tabular-nums text-success">
                        {formatMoney(balance)}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge variant={STATUS_VARIANT[advance.status]}>
                          {ADVANCE_STATUS_LABELS[advance.status]}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          aria-label={`Ver ${advance.code}`}
                        >
                          <Eye className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AdvanceSheet
        advance={detail}
        customerName={detail ? customerNames.get(detail.customerId) : undefined}
        onOpenChange={(open) => !open && setDetailId(null)}
        onChanged={invalidate}
      />

      <CreateAdvanceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        customers={customers.map((customer) => ({
          id: customer.id,
          name: customer.displayName,
        }))}
        onCreated={invalidate}
      />
    </div>
  );
}

function AdvanceSheet({
  advance,
  customerName,
  onOpenChange,
  onChanged,
}: {
  advance: CustomerAdvance | null;
  customerName: string | undefined;
  onOpenChange: (open: boolean) => void;
  onChanged: () => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const cancelMutation = useMutation({
    mutationFn: () => advanceService.archive(advance!.id, { reason }),
    onSuccess: async (cancelled) => {
      setReason("");
      setError(null);
      toast.warning(`Anticipo ${cancelled.code} anulado`);
      await onChanged();
    },
    onError: (cause) =>
      setError(errorMessage(cause, "No se pudo anular el anticipo.")),
  });

  const canCancel =
    advance !== null &&
    advance.status === AdvanceStatus.Active &&
    advance.applications.length === 0;

  return (
    <Sheet open={advance !== null} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        {advance ? (
          <>
            <SheetHeader className="border-b border-border px-5 py-4">
              <SheetTitle className="flex items-center gap-2">
                {advance.code}
                <StatusBadge variant={STATUS_VARIANT[advance.status]}>
                  {ADVANCE_STATUS_LABELS[advance.status]}
                </StatusBadge>
              </SheetTitle>
              <SheetDescription>
                {customerName ?? advance.customerId} ·{" "}
                {formatDateTime(advance.receivedAt)}
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
              <div className="rounded-xl bg-foreground px-4 py-3 text-background">
                <p className="text-[11px] uppercase tracking-wide opacity-70">
                  Saldo disponible
                </p>
                <p className="text-3xl font-extrabold tabular-nums">
                  {formatMoney(advanceBalance(advance))}
                </p>
                <p className="mt-1 text-[11px] opacity-70">
                  de {formatMoney(advance.amount)} recibidos por{" "}
                  {PAYMENT_METHOD_LABELS[advance.method]}
                  {advance.reference ? ` · ${advance.reference}` : ""}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold">Concepto</p>
                <p className="text-xs text-muted-foreground">
                  {advance.concept ?? "Sin concepto registrado."}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold">
                  Aplicaciones ({advance.applications.length})
                </p>
                {advance.applications.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
                    Aún no se aplicó a ninguna venta. Úsalo desde el Punto de
                    venta eligiendo el método “Anticipo”.
                  </p>
                ) : (
                  <ul className="divide-y divide-border/60 rounded-lg border border-border">
                    {advance.applications.map((application) => (
                      <li
                        key={application.id}
                        className="flex items-center justify-between gap-2 px-3 py-2.5 text-xs"
                      >
                        <div>
                          <p className="font-semibold">
                            {application.reference}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatDateTime(application.appliedAt)}
                          </p>
                        </div>
                        <p className="font-bold tabular-nums">
                          −{formatMoney(application.amount)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {advance.status === AdvanceStatus.Cancelled ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                  Anulado: {advance.cancelReason ?? "sin motivo"}
                </p>
              ) : null}

              {canCancel ? (
                <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold">
                    <Ban className="size-3.5" aria-hidden />
                    Anular anticipo
                  </p>
                  <Textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Motivo (ej. devolución al cliente)"
                    aria-label="Motivo de anulación"
                    className="min-h-16 bg-white/70 text-xs"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full"
                    disabled={
                      reason.trim().length < 3 || cancelMutation.isPending
                    }
                    onClick={() => cancelMutation.mutate()}
                  >
                    Anular
                  </Button>
                </div>
              ) : null}

              {error ? (
                <p className="text-xs text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function CreateAdvanceDialog({
  open,
  onOpenChange,
  customers,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: readonly { id: string; name: string }[];
  onCreated: () => Promise<void>;
}) {
  const cashQuery = useCashSession();
  const [customerId, setCustomerId] = useState("");
  const [method, setMethod] = useState<AdvancePaymentMethod>(
    PaymentMethod.Cash,
  );
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [concept, setConcept] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setCustomerId("");
    setMethod(PaymentMethod.Cash);
    setAmount("");
    setReference("");
    setConcept("");
    setError(null);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const created = await advanceService.create({
        customerId: asEntityId(customerId),
        branchId: POS_BRANCH_ID,
        method,
        amount: solesToMoney(amount),
        ...(reference.trim() ? { reference: reference.trim() } : {}),
        ...(concept.trim() ? { concept: concept.trim() } : {}),
      });
      // El efectivo recibido entra a la caja abierta de la sede.
      const session = cashQuery.data;
      if (method === PaymentMethod.Cash && session) {
        await cashService.addMovement(session.id, {
          type: CashMovementType.Deposit,
          amount: created.amount,
          reference: created.code,
          notes: "Anticipo de cliente",
        });
      }
      return created;
    },
    onSuccess: async (created) => {
      toast.success(`Anticipo ${created.code} registrado`);
      reset();
      onOpenChange(false);
      await onCreated();
    },
    onError: (cause) =>
      setError(errorMessage(cause, "No se pudo registrar el anticipo.")),
  });

  const valid = customerId !== "" && solesToMoney(amount).amount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo anticipo de cliente</DialogTitle>
          <DialogDescription>
            El saldo quedará disponible como método de pago en el POS.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Cliente</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="bg-white/70" aria-label="Cliente">
                <SelectValue placeholder="Selecciona el cliente" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Método</Label>
              <Select
                value={method}
                onValueChange={(value) =>
                  setMethod(value as AdvancePaymentMethod)
                }
              >
                <SelectTrigger className="bg-white/70" aria-label="Método">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADVANCE_PAYMENT_METHODS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {PAYMENT_METHOD_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Monto (S/)</Label>
              <Input
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                className="bg-white/70 tabular-nums"
              />
            </div>
          </div>
          {method !== PaymentMethod.Cash ? (
            <div className="space-y-1.5">
              <Label>Referencia</Label>
              <Input
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="N.° de operación o voucher"
                className="bg-white/70"
              />
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              {cashQuery.data
                ? `Se registrará un ingreso en la caja ${cashQuery.data.code}.`
                : "No hay caja abierta: el efectivo no se registrará en caja."}
            </p>
          )}
          <div className="space-y-1.5">
            <Label>Concepto</Label>
            <Textarea
              value={concept}
              onChange={(event) => setConcept(event.target.value)}
              placeholder="Ej. Separación de repuestos para mantenimiento"
              className="min-h-16 bg-white/70"
            />
          </div>
          {error ? (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!valid || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Registrar anticipo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
