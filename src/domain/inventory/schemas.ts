import { z } from "zod";

import {
  StockMovementReason,
  StockReturnDirection,
} from "@/domain/inventory/types";
import type { EntityId } from "@/domain/shared";

const entityIdSchema = z.custom<EntityId>(
  (value) => typeof value === "string" && value.trim().length > 0,
  { message: "Selecciona una opción válida." },
);

const positiveQuantitySchema = z
  .number({ required_error: "La cantidad es obligatoria." })
  .int("La cantidad debe ser un número entero.")
  .min(1, "La cantidad debe ser mayor a 0.");

export const stockMovementCreateSchema = z.object({
  productId: entityIdSchema,
  branchId: entityIdSchema,
  reason: z.nativeEnum(StockMovementReason, {
    errorMap: () => ({ message: "Selecciona el motivo del movimiento." }),
  }),
  quantity: z
    .number({ required_error: "La cantidad es obligatoria." })
    .int("La cantidad debe ser un número entero.")
    .refine((value) => value !== 0, "La cantidad no puede ser 0."),
  referenceType: z.string().trim().optional(),
  referenceId: entityIdSchema.optional(),
  notes: z.string().trim().optional(),
});

export const transferLineSchema = z.object({
  productId: entityIdSchema,
  quantity: positiveQuantitySchema,
});

export const transferCreateSchema = z
  .object({
    fromBranchId: entityIdSchema,
    toBranchId: entityIdSchema,
    lines: z.array(transferLineSchema).min(1, "Agrega al menos una línea."),
    notes: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.fromBranchId === value.toBranchId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["toBranchId"],
        message: "La sede de destino debe ser distinta a la de origen.",
      });
    }
  });

export const returnCreateSchema = z.object({
  productId: entityIdSchema,
  branchId: entityIdSchema,
  direction: z.nativeEnum(StockReturnDirection, {
    errorMap: () => ({ message: "Selecciona el tipo de devolución." }),
  }),
  quantity: positiveQuantitySchema,
  reason: z
    .string({ required_error: "El motivo es obligatorio." })
    .trim()
    .min(1, "El motivo es obligatorio."),
  notes: z.string().trim().optional(),
});

export const adjustmentCreateSchema = z.object({
  productId: entityIdSchema,
  branchId: entityIdSchema,
  newQuantity: z
    .number({ required_error: "La cantidad es obligatoria." })
    .int("La cantidad debe ser un número entero.")
    .min(0, "La cantidad no puede ser negativa."),
  reason: z
    .string({ required_error: "El motivo es obligatorio." })
    .trim()
    .min(1, "El motivo es obligatorio."),
  notes: z.string().trim().optional(),
});

export const physicalCountLineSchema = z.object({
  productId: entityIdSchema,
  counted: z
    .number({ required_error: "La cantidad contada es obligatoria." })
    .int("La cantidad contada debe ser un número entero.")
    .min(0, "La cantidad contada no puede ser negativa."),
});

export const physicalCountCreateSchema = z.object({
  branchId: entityIdSchema,
  lines: z.array(physicalCountLineSchema).min(1, "Agrega al menos una línea."),
  notes: z.string().trim().optional(),
});

export type StockMovementCreateValues = z.infer<
  typeof stockMovementCreateSchema
>;
export type TransferCreateValues = z.infer<typeof transferCreateSchema>;
export type ReturnCreateValues = z.infer<typeof returnCreateSchema>;
export type AdjustmentCreateValues = z.infer<typeof adjustmentCreateSchema>;
export type PhysicalCountCreateValues = z.infer<
  typeof physicalCountCreateSchema
>;
