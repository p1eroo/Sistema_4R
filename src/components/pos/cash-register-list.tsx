import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Banknote,
  CircleDollarSign,
  Eye,
  LockKeyhole,
  Plus,
  Scale,
  Store,
} from "lucide-react";
import { toast } from "sonner";

import { MetricCard, StatusBadge } from "@/components/erp/dashboard-ui";
import { EmptyState, LoadingState } from "@/components/erp/data-states";
import {
  ListToolbar,
  ListToolbarChips,
  ListToolbarSearch,
  toolbarControlClass,
} from "@/components/erp/list-toolbar";
import { solesToMoney } from "@/components/estimates/estimate-money";
import { CashMovementsList } from "@/components/pos/cash-movements-list";
import { POS_CASHIER_ID } from "@/components/pos/use-pos-ticket";
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
import {
  CASH_MOVEMENT_TYPE_LABELS,
  CASH_SESSION_STATUS_LABELS,
  CashMovementType,
  CashSessionStatus,
  cashFlowTotals,
  summarizeCashSession,
  type CashSession,
} from "@/domain/cash";
import { asEntityId, formatMoney, money } from "@/domain/shared";
import { cn } from "@/lib/utils";
import { branchService } from "@/mocks/branches/service";
import { cashService } from "@/mocks/cash/service";
import { identityService } from "@/mocks/identity/service";

type StatusFilter = "all" | CashSessionStatus;

const STATUS_FILTERS: readonly { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: CashSessionStatus.Open, label: "Abiertas" },
  { value: CashSessionStatus.Closed, label: "Cerradas" },
];

const MANUAL_MOVEMENTS = [
  CashMovementType.Deposit,
  CashMovementType.Withdrawal,
  CashMovementType.Expense,
] as const;

const ALL_BRANCHES = "__all__";

function formatDateTime(value: string | undefined): string {
  if (!value) {
    return "—";
  }
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Lima",
  }).format(new Date(value));
}

function errorMessage(cause: unknown, fallback: string): string {
  return cause instanceof Error ? cause.message : fallback;
}

export function CashRegisterList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [branchFilter, setBranchFilter] = useState(ALL_BRANCHES);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const sessionsQuery = useQuery({
    queryKey: ["cash", "sessions"],
    queryFn: () =>
      cashService.list({ pageSize: 100, sortBy: "openedAt", sortDir: "desc" }),
  });
  const branchesQuery = useQuery({
    queryKey: ["branches", "all"],
    queryFn: () => branchService.list({ pageSize: 50 }),
  });
  const usersQuery = useQuery({
    queryKey: ["identity", "users", "all"],
    queryFn: () => identityService.listUsers({ pageSize: 100 }),
  });

  const branches = useMemo(
    () => branchesQuery.data?.items ?? [],
    [branchesQuery.data],
  );
  const branchNames = useMemo(
    () => new Map(branches.map((branch) => [branch.id as string, branch.name])),
    [branches],
  );
  const userNames = useMemo(
    () =>
      new Map(
        (usersQuery.data?.items ?? []).map((user) => [
          user.id as string,
          user.fullName,
        ]),
      ),
    [usersQuery.data],
  );

  const sessions = useMemo(
    () => sessionsQuery.data?.items ?? [],
    [sessionsQuery.data],
  );
  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sessions.filter((session) => {
      if (status !== "all" && session.status !== status) {
        return false;
      }
      if (branchFilter !== ALL_BRANCHES && session.branchId !== branchFilter) {
        return false;
      }
      if (!term) {
        return true;
      }
      const haystack = [
        session.code,
        branchNames.get(session.branchId),
        session.cashierId ? userNames.get(session.cashierId) : "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [sessions, search, status, branchFilter, branchNames, userNames]);

  const metrics = useMemo(() => {
    const open = sessions.filter(
      (session) => session.status === CashSessionStatus.Open,
    );
    const expectedOpen = open.reduce(
      (acc, session) =>
        acc + summarizeCashSession(session).expectedAmount.amount,
      0,
    );
    const sales = sessions.reduce(
      (acc, session) =>
        acc +
        session.movements
          .filter((movement) => movement.type === CashMovementType.Sale)
          .reduce((sum, movement) => sum + movement.amount.amount, 0),
      0,
    );
    const differences = sessions.reduce(
      (acc, session) =>
        acc + (summarizeCashSession(session).difference?.amount ?? 0),
      0,
    );
    return { open: open.length, expectedOpen, sales, differences };
  }, [sessions]);

  const detail = sessions.find((session) => session.id === detailId) ?? null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Cajas abiertas"
          value={String(metrics.open)}
          detail={`${sessions.length} sesiones registradas`}
          icon={Store}
        />
        <MetricCard
          label="Efectivo esperado en cajas abiertas"
          value={formatMoney(money(metrics.expectedOpen))}
          detail="Fondo inicial + ingresos − egresos"
          icon={Banknote}
        />
        <MetricCard
          label="Ventas en efectivo"
          value={formatMoney(money(metrics.sales))}
          detail="Suma de ventas registradas en caja"
          icon={CircleDollarSign}
          trend="up"
        />
        <MetricCard
          label="Diferencias de arqueo"
          value={formatMoney(money(metrics.differences))}
          detail="Contado − esperado en cajas cerradas"
          icon={Scale}
          emphasis={metrics.differences !== 0 ? "warning" : "default"}
        />
      </div>

      <ListToolbar>
        <ListToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Buscar por código, sede o cajero"
          ariaLabel="Buscar cajas"
        />
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger
            className={cn(toolbarControlClass, "w-full sm:w-48")}
            aria-label="Sede"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_BRANCHES}>Todas las sedes</SelectItem>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <Button className="h-9" onClick={() => setOpenDialog(true)}>
          <Plus className="size-4" />
          Abrir caja
        </Button>
      </ListToolbar>

      {sessionsQuery.isLoading ? (
        <LoadingState />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Sin cajas"
          description="No hay sesiones de caja que coincidan con los filtros."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] text-xs">
              <thead className="bg-muted/40 text-[11px] text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold">Caja</th>
                  <th className="px-3 py-2.5 text-left font-semibold">
                    Cajero
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold">
                    Apertura
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold">
                    Cierre
                  </th>
                  <th className="px-3 py-2.5 text-right font-semibold">
                    Fondo
                  </th>
                  <th className="px-3 py-2.5 text-right font-semibold">
                    Esperado
                  </th>
                  <th className="px-3 py-2.5 text-right font-semibold">
                    Contado
                  </th>
                  <th className="px-3 py-2.5 text-right font-semibold">
                    Diferencia
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold">
                    Estado
                  </th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((session) => {
                  const summary = summarizeCashSession(session);
                  const difference = summary.difference?.amount ?? 0;
                  return (
                    <tr
                      key={session.id}
                      className="cursor-pointer transition-colors hover:bg-muted/30"
                      onClick={() => setDetailId(session.id)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold">{session.code}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {branchNames.get(session.branchId) ??
                            session.branchSlug}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        {session.cashierId
                          ? (userNames.get(session.cashierId) ??
                            session.cashierId)
                          : "—"}
                      </td>
                      <td className="px-3 py-3 tabular-nums">
                        {formatDateTime(session.openedAt)}
                      </td>
                      <td className="px-3 py-3 tabular-nums">
                        {formatDateTime(session.closedAt)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {formatMoney(session.openingAmount)}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold tabular-nums">
                        {formatMoney(summary.expectedAmount)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {summary.closingAmount
                          ? formatMoney(summary.closingAmount)
                          : "—"}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-3 text-right font-semibold tabular-nums",
                          difference < 0 && "text-destructive",
                          difference > 0 && "text-success",
                        )}
                      >
                        {summary.difference
                          ? formatMoney(summary.difference)
                          : "—"}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge
                          variant={
                            session.status === CashSessionStatus.Open
                              ? "success"
                              : "neutral"
                          }
                        >
                          {CASH_SESSION_STATUS_LABELS[session.status]}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          aria-label={`Ver ${session.code}`}
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

      <CashSessionSheet
        session={detail}
        branchName={detail ? branchNames.get(detail.branchId) : undefined}
        cashierName={
          detail?.cashierId ? userNames.get(detail.cashierId) : undefined
        }
        onOpenChange={(open) => !open && setDetailId(null)}
        onChanged={() => queryClient.invalidateQueries({ queryKey: ["cash"] })}
      />

      <OpenCashDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        branches={branches.map((branch) => ({
          id: branch.id,
          slug: branch.slug,
          name: branch.name,
        }))}
        onOpened={() => queryClient.invalidateQueries({ queryKey: ["cash"] })}
      />
    </div>
  );
}

function CashSessionSheet({
  session,
  branchName,
  cashierName,
  onOpenChange,
  onChanged,
}: {
  session: CashSession | null;
  branchName: string | undefined;
  cashierName: string | undefined;
  onOpenChange: (open: boolean) => void;
  onChanged: () => Promise<void>;
}) {
  const [type, setType] = useState<(typeof MANUAL_MOVEMENTS)[number]>(
    CashMovementType.Deposit,
  );
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [counted, setCounted] = useState("");
  const [error, setError] = useState<string | null>(null);

  const movementMutation = useMutation({
    mutationFn: () =>
      cashService.addMovement(session!.id, {
        type,
        amount: solesToMoney(amount),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      }),
    onSuccess: async () => {
      setAmount("");
      setNotes("");
      setError(null);
      toast.success("Movimiento registrado");
      await onChanged();
    },
    onError: (cause) =>
      setError(errorMessage(cause, "No se pudo registrar el movimiento.")),
  });

  const closeMutation = useMutation({
    mutationFn: () =>
      cashService.close(session!.id, { closingAmount: solesToMoney(counted) }),
    onSuccess: async (closed) => {
      setCounted("");
      setError(null);
      toast.success(`Caja ${closed.code} cerrada`);
      await onChanged();
    },
    onError: (cause) =>
      setError(errorMessage(cause, "No se pudo cerrar la caja.")),
  });

  const summary = session ? summarizeCashSession(session) : null;
  const flow = session ? cashFlowTotals(session.movements) : null;
  const isOpen = session?.status === CashSessionStatus.Open;
  const countedMoney = solesToMoney(counted);
  const preview =
    summary && counted.trim()
      ? countedMoney.amount - summary.expectedAmount.amount
      : null;

  return (
    <Sheet open={session !== null} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        {session && summary && flow ? (
          <>
            <SheetHeader className="border-b border-border px-5 py-4">
              <SheetTitle className="flex items-center gap-2">
                {session.code}
                <StatusBadge variant={isOpen ? "success" : "neutral"}>
                  {CASH_SESSION_STATUS_LABELS[session.status]}
                </StatusBadge>
              </SheetTitle>
              <SheetDescription>
                {branchName ?? session.branchSlug} · {cashierName ?? "—"} ·{" "}
                {formatDateTime(session.openedAt)}
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
              <div className="grid grid-cols-2 gap-2">
                <Tile label="Fondo inicial" value={session.openingAmount} />
                <Tile label="Esperado" value={summary.expectedAmount} strong />
                <Tile
                  label="Ingresos"
                  value={money(flow.inflow)}
                  tone="success"
                />
                <Tile
                  label="Egresos"
                  value={money(flow.outflow)}
                  tone="destructive"
                />
              </div>

              {isOpen ? (
                <div className="space-y-3 rounded-lg border border-border p-3">
                  <p className="text-xs font-bold">Registrar movimiento</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Select
                      value={type}
                      onValueChange={(value) => setType(value as typeof type)}
                    >
                      <SelectTrigger
                        className="bg-background"
                        aria-label="Tipo"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MANUAL_MOVEMENTS.map((item) => (
                          <SelectItem key={item} value={item}>
                            {CASH_MOVEMENT_TYPE_LABELS[item]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      inputMode="decimal"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="Monto S/"
                      aria-label="Monto del movimiento"
                      className="bg-background tabular-nums"
                    />
                  </div>
                  <Input
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Detalle (ej. pago de movilidad)"
                    aria-label="Detalle del movimiento"
                    className="bg-background"
                  />
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={
                      solesToMoney(amount).amount <= 0 ||
                      movementMutation.isPending
                    }
                    onClick={() => movementMutation.mutate()}
                  >
                    Registrar
                  </Button>
                </div>
              ) : null}

              <div className="space-y-2">
                <p className="text-xs font-bold">
                  Movimientos ({session.movements.length})
                </p>
                <CashMovementsList movements={session.movements} />
              </div>

              {isOpen ? (
                <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold">
                    <LockKeyhole className="size-3.5" aria-hidden />
                    Arqueo y cierre de caja
                  </p>
                  <Label htmlFor="cash-counted" className="text-[11px]">
                    Efectivo contado (S/)
                  </Label>
                  <Input
                    id="cash-counted"
                    inputMode="decimal"
                    value={counted}
                    onChange={(event) => setCounted(event.target.value)}
                    placeholder={(summary.expectedAmount.amount / 100).toFixed(
                      2,
                    )}
                    className="bg-background tabular-nums"
                  />
                  {preview !== null ? (
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        preview === 0
                          ? "text-success"
                          : preview < 0
                            ? "text-destructive"
                            : "text-warning-foreground",
                      )}
                    >
                      {preview === 0
                        ? "Cuadra exacto con lo esperado."
                        : `${preview < 0 ? "Faltante" : "Sobrante"} de ${formatMoney(money(Math.abs(preview)))}`}
                    </p>
                  ) : null}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    disabled={!counted.trim() || closeMutation.isPending}
                    onClick={() => closeMutation.mutate()}
                  >
                    Cerrar caja
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

function Tile({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: ReturnType<typeof money>;
  strong?: boolean;
  tone?: "success" | "destructive";
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-sm tabular-nums",
          strong ? "font-extrabold" : "font-semibold",
          tone === "success" && "text-success",
          tone === "destructive" && "text-destructive",
        )}
      >
        {formatMoney(value)}
      </p>
    </div>
  );
}

function OpenCashDialog({
  open,
  onOpenChange,
  branches,
  onOpened,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branches: readonly { id: string; slug: string; name: string }[];
  onOpened: () => Promise<void>;
}) {
  const [branchId, setBranchId] = useState("");
  const [opening, setOpening] = useState("500");
  const [error, setError] = useState<string | null>(null);
  const branch = branches.find((item) => item.id === branchId);

  const mutation = useMutation({
    mutationFn: () =>
      cashService.open({
        branchId: asEntityId(branch!.id),
        branchSlug: branch!.slug,
        cashierId: POS_CASHIER_ID,
        openingAmount: solesToMoney(opening),
      }),
    onSuccess: async (session) => {
      toast.success(`Caja ${session.code} abierta`);
      setError(null);
      onOpenChange(false);
      await onOpened();
    },
    onError: (cause) => setError(errorMessage(cause, "No se pudo abrir.")),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Abrir caja</DialogTitle>
          <DialogDescription>
            Registra el fondo inicial de la sesión.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Sede</Label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger className="bg-background" aria-label="Sede">
                <SelectValue placeholder="Selecciona la sede" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Fondo de apertura (S/)</Label>
            <Input
              inputMode="decimal"
              value={opening}
              onChange={(event) => setOpening(event.target.value)}
              className="bg-background tabular-nums"
            />
          </div>
          {error ? (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!branch || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Abrir caja
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
