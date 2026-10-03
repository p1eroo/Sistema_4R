import { z } from "zod";

import {
  PaymentMethod,
  PosLineKind,
  PosStatus,
  calculatePosTotals,
} from "@/domain/pos/types";
import type { EntityId } from "@/domain/shared";
import { moneySchema } from "@/domain/shared/schemas";

const entityIdSchema = z.custom<EntityId>(
  (value) => typeof value === "string" && value.trim().length > 0,
  { message: "Selecciona una opción válida." },
);

const priceSchema = moneySchema.refine((value) => value.amount >= 0, {
  message: "El precio no puede ser negativo.",
});

export const posLineSchema = z.object({
  id: entityIdSchema.optional(),
  kind: z.nativeEnum(PosLineKind, {
    errorMap: () => ({ message: "Selecciona el tipo de línea." }),
  }),
  productId: entityIdSchema.optional(),
  serviceId: entityIdSchema.optional(),
  description: z
    .string({ required_error: "La descripción es obligatoria." })
    .trim()
    .min(1, "La descripción es obligatoria."),
  quantity: z
    .number({ required_error: "La cantidad es obligatoria." })
    .int("La cantidad debe ser un número entero.")
    .min(1, "La cantidad debe ser mayor a 0."),
  unitPrice: priceSchema,
  discount: priceSchema.optional(),
  igvRate: z
    .number()
    .min(0, "El IGV no puede ser negativo.")
    .max(1, "El IGV no puede superar el 100%.")
    .optional(),
});

export const posPaymentSchema = z.object({
  id: entityIdSchema.optional(),
  method: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({ message: "Selecciona el método de pago." }),
  }),
  amount: priceSchema,
  reference: z.string().trim().optional(),
});

export const posTicketDraftSchema = z.object({
  customerId: entityIdSchema.optional(),
  branchId: entityIdSchema,
  cashierId: entityIdSchema.optional(),
  lines: z.array(posLineSchema).default([]),
  globalDiscount: priceSchema.optional(),
  notes: z.string().trim().optional(),
});

export const posCheckoutSchema = z
  .object({
    customerId: entityIdSchema.optional(),
    branchId: entityIdSchema,
    cashierId: entityIdSchema.optional(),
    lines: z.array(posLineSchema).min(1, "Agrega al menos una línea."),
    globalDiscount: priceSchema.optional(),
    payments: z.array(posPaymentSchema).min(1, "Registra al menos un pago."),
    notes: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    const totals = calculatePosTotals(value.lines, value.globalDiscount);
    const paid = value.payments.reduce(
      (acc, payment) => acc + payment.amount.amount,
      0,
    );

    if (paid < totals.total.amount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["payments"],
        message: "Los pagos no cubren el total del ticket.",
      });
    }
  });

export const posTicketObjectSchema = z.object({
  customerId: entityIdSchema.optional(),
  branchId: entityIdSchema,
  cashierId: entityIdSchema.optional(),
  status: z.nativeEnum(PosStatus).optional(),
  lines: z.array(posLineSchema).min(1, "Agrega al menos una línea."),
  payments: z.array(posPaymentSchema).default([]),
  globalDiscount: priceSchema.optional(),
  notes: z.string().trim().optional(),
});

export type PosLineValues = z.infer<typeof posLineSchema>;
export type PosPaymentValues = z.infer<typeof posPaymentSchema>;
export type PosTicketDraftValues = z.infer<typeof posTicketDraftSchema>;
export type PosTicketDraftInput = z.input<typeof posTicketDraftSchema>;
export type PosCheckoutValues = z.infer<typeof posCheckoutSchema>;
