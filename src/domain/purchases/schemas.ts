import { z } from "zod";

import { ExpenseCategory } from "@/domain/purchases/types";
import type { EntityId } from "@/domain/shared";
import { isoDateSchema, moneySchema } from "@/domain/shared/schemas";

const entityIdSchema = z.custom<EntityId>(
  (value) => typeof value === "string" && value.trim().length > 0,
  { message: "Selecciona una opción válida." },
);

const amountSchema = moneySchema.refine((value) => value.amount >= 0, {
  message: "El monto no puede ser negativo.",
});

export const purchaseLineSchema = z.object({
  id: entityIdSchema.optional(),
  productId: entityIdSchema.optional(),
  description: z
    .string({ required_error: "La descripción es obligatoria." })
    .trim()
    .min(1, "La descripción es obligatoria."),
  quantity: z
    .number({ required_error: "La cantidad es obligatoria." })
    .int("La cantidad debe ser un número entero.")
    .min(1, "La cantidad debe ser mayor a 0."),
  unitCost: amountSchema,
  discount: amountSchema.optional(),
  igvRate: z
    .number()
    .min(0, "El IGV no puede ser negativo.")
    .max(1, "El IGV no puede superar el 100%.")
    .optional(),
});

const linesSchema = z
  .array(purchaseLineSchema)
  .min(1, "Agrega al menos una línea.");

export const purchaseCreateSchema = z.object({
  supplierId: entityIdSchema,
  branchId: entityIdSchema,
  lines: linesSchema,
  invoiceNumber: z.string().trim().optional(),
  purchasedAt: isoDateSchema.optional(),
  notes: z.string().trim().optional(),
});

export const purchaseOrderCreateSchema = z.object({
  supplierId: entityIdSchema,
  branchId: entityIdSchema,
  lines: linesSchema,
  expectedAt: isoDateSchema.optional(),
  notes: z.string().trim().optional(),
});

export const quoteCreateSchema = z.object({
  supplierId: entityIdSchema,
  branchId: entityIdSchema,
  lines: linesSchema,
  validUntil: isoDateSchema.optional(),
  notes: z.string().trim().optional(),
});

export const expenseCreateSchema = z.object({
  supplierId: entityIdSchema.optional(),
  branchId: entityIdSchema,
  category: z.nativeEnum(ExpenseCategory, {
    errorMap: () => ({ message: "Selecciona la categoría del gasto." }),
  }),
  description: z
    .string({ required_error: "La descripción es obligatoria." })
    .trim()
    .min(1, "La descripción es obligatoria."),
  amount: amountSchema,
  igv: amountSchema.optional(),
  incurredAt: isoDateSchema,
  documentNumber: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type PurchaseLineValues = z.infer<typeof purchaseLineSchema>;
export type PurchaseCreateValues = z.infer<typeof purchaseCreateSchema>;
export type PurchaseOrderCreateValues = z.infer<
  typeof purchaseOrderCreateSchema
>;
export type QuoteCreateValues = z.infer<typeof quoteCreateSchema>;
export type ExpenseCreateValues = z.infer<typeof expenseCreateSchema>;
