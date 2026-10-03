import { z } from "zod";

import { ADVANCE_PAYMENT_METHODS } from "@/domain/advances/types";
import type { EntityId } from "@/domain/shared";
import { moneySchema } from "@/domain/shared/schemas";

const entityIdSchema = z.custom<EntityId>(
  (value) => typeof value === "string" && value.trim().length > 0,
  { message: "Selecciona una opción válida." },
);

const positiveAmountSchema = moneySchema.refine((value) => value.amount > 0, {
  message: "El monto debe ser mayor a 0.",
});

export const advanceCreateSchema = z.object({
  customerId: entityIdSchema,
  branchId: entityIdSchema,
  method: z.enum(ADVANCE_PAYMENT_METHODS, {
    errorMap: () => ({ message: "Selecciona el método de pago." }),
  }),
  amount: positiveAmountSchema,
  reference: z.string().trim().optional(),
  concept: z.string().trim().optional(),
});

export const advanceApplySchema = z.object({
  customerId: entityIdSchema,
  amount: positiveAmountSchema,
  reference: z.string().trim().min(1, "La referencia es obligatoria."),
  ticketId: entityIdSchema.optional(),
});

export const advanceCancelSchema = z.object({
  reason: z
    .string({ required_error: "Indica el motivo de la anulación." })
    .trim()
    .min(3, "Indica el motivo de la anulación."),
});

export type AdvanceCreateValues = z.infer<typeof advanceCreateSchema>;
export type AdvanceApplyValues = z.infer<typeof advanceApplySchema>;
export type AdvanceCancelValues = z.infer<typeof advanceCancelSchema>;
