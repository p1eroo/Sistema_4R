import { z } from "zod";

import { CashMovementType } from "@/domain/cash/types";
import type { EntityId } from "@/domain/shared";
import { moneySchema } from "@/domain/shared/schemas";

const entityIdSchema = z.custom<EntityId>(
  (value) => typeof value === "string" && value.trim().length > 0,
  { message: "Selecciona una opción válida." },
);

const amountSchema = moneySchema.refine((value) => value.amount >= 0, {
  message: "El monto no puede ser negativo.",
});

export const cashOpenSchema = z.object({
  branchId: entityIdSchema,
  branchSlug: z
    .string()
    .trim()
    .min(1, "La sede es obligatoria.")
    .transform((value) => value.toLowerCase()),
  cashierId: entityIdSchema.optional(),
  openingAmount: amountSchema,
  notes: z.string().trim().optional(),
});

export const cashCloseSchema = z.object({
  closingAmount: amountSchema,
  notes: z.string().trim().optional(),
});

export const cashMovementSchema = z.object({
  type: z.nativeEnum(CashMovementType, {
    errorMap: () => ({ message: "Selecciona el tipo de movimiento." }),
  }),
  amount: amountSchema,
  reference: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type CashOpenValues = z.infer<typeof cashOpenSchema>;
export type CashCloseValues = z.infer<typeof cashCloseSchema>;
export type CashMovementValues = z.infer<typeof cashMovementSchema>;
