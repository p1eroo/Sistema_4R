import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useCashSession } from "@/components/pos/use-cash-session";
import { CashMovementType, CashSessionStatus } from "@/domain/cash";
import { PaymentMethod, PosStatus, type PosTicket } from "@/domain/pos";
import type { PosLineValues, PosPaymentValues } from "@/domain/pos/schemas";
import { asEntityId, money, type EntityId, type Money } from "@/domain/shared";
import { cashService } from "@/mocks/cash/service";
import { posService, type PosAdjustments } from "@/mocks/pos/service";

export const POS_BRANCH_ID = asEntityId("BR-LM");
export const POS_CASHIER_ID = asEntityId("USR-0001");
/** Valor de Select para venta sin cliente identificado. */
export const WALK_IN_CUSTOMER = "__walk_in__";

function errorMessage(cause: unknown, fallback: string): string {
  return cause instanceof Error ? cause.message : fallback;
}

/** Efectivo que realmente queda en caja: efectivo recibido menos vuelto. */
export function cashDrawerAmount(ticket: PosTicket): Money {
  const cash = ticket.payments
    .filter((payment) => payment.method === PaymentMethod.Cash)
    .reduce((acc, payment) => acc + payment.amount.amount, 0);
  return money(Math.max(0, cash - ticket.change.amount));
}

/**
 * Estado del ticket activo del POS. Encapsula el ciclo de vida
 * (crear → editar → espera/anular → cobrar) sobre `posService`, y registra
 * la venta en la sesión de caja abierta.
 */
export function usePosTicket({
  defaultCustomerId = WALK_IN_CUSTOMER,
}: { defaultCustomerId?: string } = {}) {
  const queryClient = useQueryClient();
  const [ticketId, setTicketId] = useState<EntityId | null>(null);
  const [customerId, setCustomerIdState] = useState(defaultCustomerId);
  const [error, setError] = useState<string | null>(null);
  const creating = useRef<Promise<EntityId> | null>(null);
  // Serializa las ediciones para que clics rápidos no pisen líneas.
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const cashQuery = useCashSession();
  const cashSession = cashQuery.data;
  const cashIsOpen = cashSession?.status === CashSessionStatus.Open;

  const ticketQuery = useQuery({
    queryKey: ["pos", "ticket", ticketId],
    queryFn: () => posService.getById(ticketId!),
    enabled: ticketId !== null,
  });
  const ticket = ticketQuery.data ?? null;

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["pos"] }),
    [queryClient],
  );

  const ensureTicket = useCallback(async (): Promise<EntityId> => {
    if (ticketId) {
      return ticketId;
    }
    if (!creating.current) {
      creating.current = posService
        .createTicket({
          branchId: POS_BRANCH_ID,
          cashierId: POS_CASHIER_ID,
          ...(customerId !== WALK_IN_CUSTOMER
            ? { customerId: asEntityId(customerId) }
            : {}),
        })
        .then((created) => {
          setTicketId(created.id);
          return created.id;
        })
        .finally(() => {
          creating.current = null;
        });
    }
    return creating.current;
  }, [ticketId, customerId]);

  useEffect(() => {
    if (ticketId || !cashIsOpen) {
      return;
    }
    void ensureTicket().catch((cause) =>
      setError(errorMessage(cause, "No se pudo abrir el ticket.")),
    );
  }, [ticketId, cashIsOpen, ensureTicket]);

  const run = useMutation({
    mutationFn: async (
      operation: (id: EntityId) => Promise<PosTicket>,
    ): Promise<PosTicket> => {
      const next = queue.current.then(async () =>
        operation(await ensureTicket()),
      );
      queue.current = next.catch(() => undefined);
      return next;
    },
    onSuccess: async (updated) => {
      setError(null);
      queryClient.setQueryData(["pos", "ticket", updated.id], updated);
      await invalidate();
    },
    onError: (cause) =>
      setError(errorMessage(cause, "No se pudo actualizar el ticket.")),
  });

  const mutate = run.mutate;

  const addLine = useCallback(
    (line: PosLineValues) => mutate((id) => posService.addLine(id, line)),
    [mutate],
  );
  const setQuantity = useCallback(
    (lineId: EntityId, quantity: number) =>
      mutate((id) => posService.updateLineQuantity(id, lineId, quantity)),
    [mutate],
  );
  const removeLine = useCallback(
    (lineId: EntityId) => mutate((id) => posService.removeLine(id, lineId)),
    [mutate],
  );
  const clearLines = useCallback(
    () => mutate((id) => posService.clearLines(id)),
    [mutate],
  );
  const setAdjustments = useCallback(
    (input: PosAdjustments) =>
      mutate((id) => posService.setAdjustments(id, input)),
    [mutate],
  );
  const setCustomerId = useCallback(
    (value: string) => {
      setCustomerIdState(value);
      mutate((id) =>
        posService.setCustomer(
          id,
          value === WALK_IN_CUSTOMER ? null : asEntityId(value),
        ),
      );
    },
    [mutate],
  );

  /** Descarta el ticket actual de la pantalla y abre uno nuevo. */
  const startNew = useCallback(() => {
    setTicketId(null);
    setCustomerIdState(defaultCustomerId);
    setError(null);
  }, [defaultCustomerId]);

  const hold = useMutation({
    mutationFn: async (notes?: string) =>
      posService.hold(await ensureTicket(), notes),
    onSuccess: async () => {
      startNew();
      await invalidate();
    },
    onError: (cause) =>
      setError(errorMessage(cause, "No se pudo dejar en espera.")),
  });

  const cancel = useMutation({
    mutationFn: async () => posService.cancel(await ensureTicket()),
    onSuccess: async () => {
      startNew();
      await invalidate();
    },
    onError: (cause) =>
      setError(errorMessage(cause, "No se pudo anular el ticket.")),
  });

  const resume = useMutation({
    mutationFn: async (heldId: EntityId) => {
      if (ticket && ticket.lines.length === 0) {
        await posService.cancel(ticket.id);
      } else if (ticket && ticket.status === PosStatus.Draft) {
        await posService.hold(ticket.id, "Reemplazado al retomar otro ticket");
      }
      return posService.resume(heldId);
    },
    onSuccess: async (resumed) => {
      setTicketId(resumed.id);
      setCustomerIdState(resumed.customerId ?? WALK_IN_CUSTOMER);
      setError(null);
      await invalidate();
    },
    onError: (cause) =>
      setError(errorMessage(cause, "No se pudo retomar el ticket.")),
  });

  const pay = useMutation({
    mutationFn: async (payments: PosPaymentValues[]) => {
      const paid = await posService.pay(await ensureTicket(), payments);
      const drawer = cashDrawerAmount(paid);
      if (cashSession && drawer.amount > 0) {
        await cashService.addMovement(cashSession.id, {
          type: CashMovementType.Sale,
          amount: drawer,
          reference: paid.documentNumber ?? paid.code,
          notes: `Venta POS ${paid.code}`,
        });
      }
      return paid;
    },
    onSuccess: async () => {
      setError(null);
      await Promise.all([
        invalidate(),
        queryClient.invalidateQueries({ queryKey: ["cash"] }),
        queryClient.invalidateQueries({ queryKey: ["advances"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
      ]);
    },
  });

  const quantities = useMemo(() => {
    const map = new Map<string, { lineId: EntityId; quantity: number }>();
    for (const line of ticket?.lines ?? []) {
      const key = line.productId ?? line.serviceId;
      if (key) {
        map.set(key, { lineId: line.id, quantity: line.quantity });
      }
    }
    return map;
  }, [ticket]);

  const canCheckout =
    cashIsOpen &&
    ticket !== null &&
    ticket.status === PosStatus.Draft &&
    ticket.lines.length > 0;

  return {
    ticket,
    customerId,
    setCustomerId,
    error,
    setError,
    cashSession,
    cashIsOpen,
    isCashLoading: cashQuery.isLoading,
    isBusy: run.isPending,
    quantities,
    canCheckout,
    addLine,
    setQuantity,
    removeLine,
    clearLines,
    setAdjustments,
    startNew,
    hold,
    cancel,
    resume,
    pay,
  };
}

export type PosTicketController = ReturnType<typeof usePosTicket>;
