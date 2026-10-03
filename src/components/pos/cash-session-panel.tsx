import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useCashSession } from "@/components/pos/use-cash-session";

import { solesToMoney } from "@/components/estimates/estimate-money";
import { formatCashShiftLabel } from "@/components/pos/cash-session-format";
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
import { CASH_SESSION_STATUS_LABELS, CashSessionStatus } from "@/domain/cash";
import { asEntityId, formatMoney } from "@/domain/shared";
import { CashValidationError, cashService } from "@/mocks/cash/service";

const BRANCH_ID = asEntityId("BR-LM");
const BRANCH_SLUG = "molina";

export function CashSessionPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const sessionQuery = useCashSession();
  const session = sessionQuery.data;
  const [openingSoles, setOpeningSoles] = useState("500");
  const [closingSoles, setClosingSoles] = useState("");
  const [error, setError] = useState<string | null>(null);

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["cash"] });
  };

  const openMutation = useMutation({
    mutationFn: () =>
      cashService.open({
        branchId: BRANCH_ID,
        branchSlug: BRANCH_SLUG,
        openingAmount: solesToMoney(openingSoles),
      }),
    onSuccess: async () => {
      setError(null);
      await invalidate();
    },
    onError: (cause) => {
      setError(
        cause instanceof CashValidationError
          ? cause.message
          : cause instanceof Error
            ? cause.message
            : "No se pudo abrir la caja.",
      );
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => {
      if (!session) {
        throw new Error("No hay sesión activa.");
      }
      const amount =
        closingSoles.trim().length > 0
          ? solesToMoney(closingSoles)
          : session.expectedAmount;
      return cashService.close(session.id, { closingAmount: amount });
    },
    onSuccess: async () => {
      setError(null);
      setClosingSoles("");
      await invalidate();
      onOpenChange(false);
    },
    onError: (cause) => {
      setError(
        cause instanceof CashValidationError
          ? cause.message
          : cause instanceof Error
            ? cause.message
            : "No se pudo cerrar la caja.",
      );
    },
  });

  const isOpen = session?.status === CashSessionStatus.Open;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sesión de caja</DialogTitle>
          <DialogDescription>
            Sede La Molina ·{" "}
            {session
              ? CASH_SESSION_STATUS_LABELS[session.status]
              : "Sin sesión"}
          </DialogDescription>
        </DialogHeader>

        {isOpen && session ? (
          <div className="space-y-3 text-sm">
            <p className="text-xs text-muted-foreground">
              {formatCashShiftLabel(session.openedAt)} · {session.code}
            </p>
            <dl className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3 text-xs">
              <dt className="text-muted-foreground">Apertura</dt>
              <dd className="text-right tabular-nums">
                {formatMoney(session.openingAmount)}
              </dd>
              <dt className="text-muted-foreground">Esperado</dt>
              <dd className="text-right font-semibold tabular-nums">
                {formatMoney(session.expectedAmount)}
              </dd>
              <dt className="text-muted-foreground">Movimientos</dt>
              <dd className="text-right tabular-nums">
                {session.movementCount}
              </dd>
            </dl>
            <div className="space-y-1.5">
              <Label>Arqueo de cierre (S/)</Label>
              <Input
                inputMode="decimal"
                value={closingSoles}
                onChange={(event) => setClosingSoles(event.target.value)}
                placeholder={(session.expectedAmount.amount / 100).toFixed(2)}
                className="bg-white/70 tabular-nums"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Registra el fondo inicial para habilitar ventas en mostrador.
            </p>
            <div className="space-y-1.5">
              <Label>Fondo de apertura (S/)</Label>
              <Input
                inputMode="decimal"
                value={openingSoles}
                onChange={(event) => setOpeningSoles(event.target.value)}
                className="bg-white/70 tabular-nums"
              />
            </div>
          </div>
        )}

        {error ? (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar panel
          </Button>
          {isOpen ? (
            <Button
              variant="destructive"
              disabled={closeMutation.isPending}
              onClick={() => closeMutation.mutate()}
            >
              Cerrar caja
            </Button>
          ) : (
            <Button
              disabled={openMutation.isPending}
              onClick={() => openMutation.mutate()}
            >
              Abrir caja
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
