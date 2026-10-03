import { z, type ZodType } from "zod";

import {
  PaymentMethod,
  PosStatus,
  calculatePosTotals,
  type PosLine,
  type PosPayment,
  type PosTicket,
} from "@/domain/pos";
import {
  posLineSchema,
  posPaymentSchema,
  posTicketDraftSchema,
  type PosLineValues,
  type PosPaymentValues,
  type PosTicketDraftInput,
} from "@/domain/pos/schemas";
import {
  money,
  nowIso,
  type DateTimeIso,
  type EntityId,
  type Money,
} from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import { advanceService } from "@/mocks/advances/service";
import { inventoryService } from "@/mocks/inventory/service";
import { posTicketSeed } from "@/mocks/pos/seed";
import { settingsService } from "@/mocks/settings/service";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";

export class PosNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró el ticket ${id}.`);
    this.name = "PosNotFoundError";
  }
}

export class PosValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "La operación de POS no es válida.");
    this.name = "PosValidationError";
    this.issues = issues;
  }
}

export type PosService = {
  list(query?: ListQuery): Promise<ListResult<PosTicket>>;
  getById(id: EntityId): Promise<PosTicket | undefined>;
  createTicket(input: PosTicketDraftInput): Promise<PosTicket>;
  addLine(id: EntityId, input: PosLineValues): Promise<PosTicket>;
  updateLineQuantity(
    id: EntityId,
    lineId: EntityId,
    quantity: number,
  ): Promise<PosTicket>;
  removeLine(id: EntityId, lineId: EntityId): Promise<PosTicket>;
  clearLines(id: EntityId): Promise<PosTicket>;
  setCustomer(id: EntityId, customerId: EntityId | null): Promise<PosTicket>;
  setAdjustments(id: EntityId, input: PosAdjustments): Promise<PosTicket>;
  /** Deja el ticket en espera para retomarlo luego. */
  hold(id: EntityId, notes?: string): Promise<PosTicket>;
  resume(id: EntityId): Promise<PosTicket>;
  /** Anula un ticket abierto o en espera. */
  cancel(id: EntityId): Promise<PosTicket>;
  pay(id: EntityId, payments: readonly PosPaymentValues[]): Promise<PosTicket>;
};

export type PosAdjustments = {
  readonly globalDiscount?: Money | null;
  readonly roundTotal?: boolean;
};

const EDITABLE_STATUSES: ReadonlySet<PosStatus> = new Set([
  PosStatus.Draft,
  PosStatus.PendingPayment,
]);

const SORT_SELECTORS = {
  code: (ticket: PosTicket) => ticket.code,
  status: (ticket: PosTicket) => ticket.status,
  createdAt: (ticket: PosTicket) => ticket.createdAt,
};

function parseOrThrow<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new PosValidationError(
      result.error.issues.map((issue) => issue.message),
    );
  }

  return result.data;
}

function nextCode(tickets: readonly PosTicket[], now: DateTimeIso): string {
  const year = new Date(now).getUTCFullYear();
  const max = tickets.reduce((acc, ticket) => {
    const value = /^TKT-\d{4}-(\d+)$/.exec(ticket.code)?.[1];
    return value ? Math.max(acc, Number(value)) : acc;
  }, 0);

  return `TKT-${year}-${String(max + 1).padStart(4, "0")}`;
}

function normalizeLines(
  lines: readonly PosLineValues[],
  offset: number,
): PosLine[] {
  return lines.map((line, index) => ({
    id:
      line.id ??
      (`PLN-${String(offset + index + 1).padStart(4, "0")}` as EntityId),
    kind: line.kind,
    description: line.description,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    igvRate: line.igvRate ?? 0.18,
    ...(line.productId !== undefined ? { productId: line.productId } : {}),
    ...(line.serviceId !== undefined ? { serviceId: line.serviceId } : {}),
    ...(line.discount !== undefined ? { discount: line.discount } : {}),
  }));
}

function nextLineIndex(ticket: PosTicket): number {
  return ticket.lines.reduce((acc, line) => {
    const value = /^PLN-(\d+)$/.exec(line.id)?.[1];
    return value ? Math.max(acc, Number(value)) : acc;
  }, ticket.lines.length);
}

function countLines(tickets: readonly PosTicket[]): number {
  return tickets.reduce((acc, ticket) => acc + ticket.lines.length, 0);
}

function countPayments(tickets: readonly PosTicket[]): number {
  return tickets.reduce((acc, ticket) => acc + ticket.payments.length, 0);
}

function nextDocumentNumber(
  tickets: readonly PosTicket[],
  series: string,
): string {
  const max = tickets.reduce((acc, ticket) => {
    if (!ticket.documentNumber?.startsWith(`${series}-`)) {
      return acc;
    }

    const suffix = ticket.documentNumber.slice(series.length + 1);
    const value = Number.parseInt(suffix, 10);
    return Number.isFinite(value) ? Math.max(acc, value) : acc;
  }, 0);

  return `${series}-${String(max + 1).padStart(5, "0")}`;
}

export function createPosService(
  repository: InMemoryRepository<PosTicket> = createInMemoryRepository<PosTicket>(
    { seed: posTicketSeed, idPrefix: "TK" },
  ),
): PosService {
  async function requireTicket(id: EntityId): Promise<PosTicket> {
    const ticket = await repository.getById(id);
    if (!ticket) {
      throw new PosNotFoundError(id);
    }
    return ticket;
  }

  async function requireEditable(id: EntityId): Promise<PosTicket> {
    const ticket = await requireTicket(id);
    if (!EDITABLE_STATUSES.has(ticket.status)) {
      throw new PosValidationError([
        "Solo se pueden modificar tickets abiertos.",
      ]);
    }
    return ticket;
  }

  function saveLines(ticket: PosTicket, lines: PosLine[]): Promise<PosTicket> {
    return repository.update(ticket.id, {
      lines,
      totals: calculatePosTotals(lines, ticket.globalDiscount, {
        roundTotal: ticket.roundTotal,
      }),
      updatedAt: nowIso(),
    });
  }

  return {
    list(query: ListQuery = {}) {
      return repository.query({
        query,
        searchFields: ["code", "documentNumber", "status"],
        sortSelectors: SORT_SELECTORS,
      });
    },

    getById(id: EntityId) {
      return repository.getById(id);
    },

    async createTicket(input: PosTicketDraftInput) {
      const values = parseOrThrow(posTicketDraftSchema, input);
      const existing = await repository.getAll();
      const lines = normalizeLines(values.lines, countLines(existing));
      const now = nowIso();

      return repository.create({
        code: nextCode(existing, now),
        ...(values.customerId !== undefined
          ? { customerId: values.customerId }
          : {}),
        branchId: values.branchId,
        ...(values.cashierId !== undefined
          ? { cashierId: values.cashierId }
          : {}),
        status: PosStatus.Draft,
        lines,
        payments: [],
        totals: calculatePosTotals(lines, values.globalDiscount),
        paidAmount: money(0, lines[0]?.unitPrice.currency),
        change: money(0, lines[0]?.unitPrice.currency),
        ...(values.notes !== undefined ? { notes: values.notes } : {}),
        createdAt: now,
        updatedAt: now,
      });
    },

    async addLine(id: EntityId, input: PosLineValues) {
      const ticket = await requireEditable(id);

      const values = parseOrThrow(posLineSchema, input);
      const existing = ticket.lines.find(
        (line) =>
          ((values.productId !== undefined &&
            line.productId === values.productId) ||
            (values.serviceId !== undefined &&
              line.serviceId === values.serviceId)) &&
          line.unitPrice.amount === values.unitPrice.amount,
      );
      const lines = existing
        ? ticket.lines.map((line) =>
            line.id === existing.id
              ? { ...line, quantity: line.quantity + values.quantity }
              : line,
          )
        : [...ticket.lines, ...normalizeLines([values], nextLineIndex(ticket))];

      return saveLines(ticket, lines);
    },

    async updateLineQuantity(id: EntityId, lineId: EntityId, quantity: number) {
      const ticket = await requireEditable(id);
      if (!Number.isInteger(quantity) || quantity < 0) {
        throw new PosValidationError([
          "La cantidad debe ser un número entero.",
        ]);
      }
      if (!ticket.lines.some((line) => line.id === lineId)) {
        throw new PosValidationError(["La línea no existe en el ticket."]);
      }

      const lines =
        quantity === 0
          ? ticket.lines.filter((line) => line.id !== lineId)
          : ticket.lines.map((line) =>
              line.id === lineId ? { ...line, quantity } : line,
            );
      return saveLines(ticket, lines);
    },

    async removeLine(id: EntityId, lineId: EntityId) {
      const ticket = await requireEditable(id);
      return saveLines(
        ticket,
        ticket.lines.filter((line) => line.id !== lineId),
      );
    },

    async clearLines(id: EntityId) {
      const ticket = await requireEditable(id);
      return saveLines(ticket, []);
    },

    async setCustomer(id: EntityId, customerId: EntityId | null) {
      await requireEditable(id);
      return repository.update(id, {
        customerId: customerId ?? undefined,
        updatedAt: nowIso(),
      });
    },

    async setAdjustments(id: EntityId, input: PosAdjustments) {
      const ticket = await requireEditable(id);
      const globalDiscount =
        input.globalDiscount === undefined
          ? ticket.globalDiscount
          : (input.globalDiscount ?? undefined);
      if (globalDiscount !== undefined && globalDiscount.amount < 0) {
        throw new PosValidationError(["El descuento no puede ser negativo."]);
      }
      const roundTotal = input.roundTotal ?? ticket.roundTotal ?? false;

      return repository.update(id, {
        globalDiscount,
        roundTotal,
        totals: calculatePosTotals(ticket.lines, globalDiscount, {
          roundTotal,
        }),
        updatedAt: nowIso(),
      });
    },

    async hold(id: EntityId, notes?: string) {
      const ticket = await requireEditable(id);
      if (ticket.lines.length === 0) {
        throw new PosValidationError([
          "No se puede dejar en espera un ticket vacío.",
        ]);
      }

      return repository.update(id, {
        status: PosStatus.OnHold,
        ...(notes?.trim() ? { notes: notes.trim() } : {}),
        updatedAt: nowIso(),
      });
    },

    async resume(id: EntityId) {
      const ticket = await requireTicket(id);
      if (ticket.status !== PosStatus.OnHold) {
        throw new PosValidationError(["El ticket no está en espera."]);
      }

      return repository.update(id, {
        status: PosStatus.Draft,
        updatedAt: nowIso(),
      });
    },

    async cancel(id: EntityId) {
      const ticket = await requireTicket(id);
      if (
        !EDITABLE_STATUSES.has(ticket.status) &&
        ticket.status !== PosStatus.OnHold
      ) {
        throw new PosValidationError([
          "Solo se pueden anular tickets abiertos o en espera.",
        ]);
      }

      return repository.update(id, {
        status: PosStatus.Cancelled,
        updatedAt: nowIso(),
      });
    },

    async pay(id: EntityId, payments: readonly PosPaymentValues[]) {
      const ticket = await requireTicket(id);
      if (ticket.status === PosStatus.Paid) {
        return ticket;
      }
      if (
        ticket.status === PosStatus.Cancelled ||
        ticket.status === PosStatus.Refunded
      ) {
        throw new PosValidationError([
          "No se puede cobrar un ticket cancelado o reembolsado.",
        ]);
      }

      const values = parseOrThrow(
        z.array(posPaymentSchema).min(1, "Registra al menos un pago."),
        payments,
      );
      const paid = values.reduce(
        (acc, payment) => acc + payment.amount.amount,
        0,
      );
      if (paid < ticket.totals.total.amount) {
        throw new PosValidationError([
          "Los pagos no cubren el total del ticket.",
        ]);
      }

      const advanceAmount = values
        .filter((payment) => payment.method === PaymentMethod.Advance)
        .reduce((acc, payment) => acc + payment.amount.amount, 0);
      if (advanceAmount > 0) {
        if (!ticket.customerId) {
          throw new PosValidationError([
            "Selecciona un cliente para aplicar su anticipo.",
          ]);
        }
        const balance = await advanceService.getCustomerBalance(
          ticket.customerId,
        );
        if (balance.amount < advanceAmount) {
          throw new PosValidationError([
            "El anticipo del cliente no cubre el monto indicado.",
          ]);
        }
        if (advanceAmount > ticket.totals.total.amount) {
          throw new PosValidationError([
            "El anticipo aplicado no puede superar el total.",
          ]);
        }
      }

      for (const line of ticket.lines) {
        if (!line.productId) {
          continue;
        }

        const stock = await inventoryService.getStock(
          line.productId,
          ticket.branchId,
        );
        const current = stock[0];
        if (!current || current.quantity < line.quantity) {
          throw new PosValidationError([
            `Stock insuficiente para ${line.description}.`,
          ]);
        }
      }

      for (const line of ticket.lines) {
        if (!line.productId) {
          continue;
        }

        const stock = await inventoryService.getStock(
          line.productId,
          ticket.branchId,
        );
        const current = stock[0];
        if (!current) {
          continue;
        }

        await inventoryService.adjust({
          productId: line.productId,
          branchId: ticket.branchId,
          newQuantity: current.quantity - line.quantity,
          reason: `Venta POS ${ticket.code}`,
        });
      }

      const now = nowIso();
      const allTickets = await repository.getAll();
      const settings = await settingsService.get();
      const documentNumber = nextDocumentNumber(
        allTickets,
        settings.documents.invoiceSeries,
      );
      const offset = countPayments(allTickets);
      const normalizedPayments: PosPayment[] = values.map((payment, index) => ({
        id:
          payment.id ??
          (`PAY-${String(offset + index + 1).padStart(4, "0")}` as EntityId),
        method: payment.method,
        amount: payment.amount,
        ...(payment.reference !== undefined
          ? { reference: payment.reference }
          : {}),
      }));

      if (advanceAmount > 0 && ticket.customerId) {
        await advanceService.apply({
          customerId: ticket.customerId,
          amount: money(advanceAmount),
          reference: documentNumber,
          ticketId: ticket.id,
        });
      }

      return repository.update(id, {
        status: PosStatus.Paid,
        documentNumber,
        payments: normalizedPayments,
        paidAmount: money(paid),
        change: money(paid - ticket.totals.total.amount),
        updatedAt: now,
      });
    },
  };
}

export const posService: PosService = createPosService();
