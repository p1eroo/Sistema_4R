import { z } from "zod";

import { DiscountType, PromotionScope } from "@/domain/pricing/types";
import type { EntityId } from "@/domain/shared";
import { isoDateSchema, moneySchema } from "@/domain/shared/schemas";

const entityIdSchema = z.custom<EntityId>(
  (value) => typeof value === "string" && value.trim().length > 0,
  { message: "Selecciona una opción válida." },
);

export const discountSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(DiscountType.Percentage),
    value: z
      .number({ required_error: "El porcentaje es obligatorio." })
      .int("El porcentaje debe ser un número entero.")
      .min(0, "El porcentaje no puede ser negativo.")
      .max(100, "El porcentaje no puede superar 100."),
    maxAmount: moneySchema.optional(),
  }),
  z.object({
    type: z.literal(DiscountType.FixedAmount),
    value: z
      .number({ required_error: "El monto es obligatorio." })
      .int("El monto debe estar en céntimos (entero).")
      .min(0, "El monto no puede ser negativo."),
  }),
]);

export const promotionObjectSchema = z.object({
  code: z
    .string({ required_error: "El código es obligatorio." })
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z0-9-]{2,20}$/,
      "El código debe tener entre 2 y 20 caracteres (letras, números o guiones).",
    ),
  name: z
    .string({ required_error: "El nombre es obligatorio." })
    .trim()
    .min(1, "El nombre es obligatorio."),
  description: z.string().trim().optional(),
  discount: discountSchema,
  scope: z.nativeEnum(PromotionScope, {
    errorMap: () => ({ message: "Selecciona el alcance." }),
  }),
  targetIds: z.array(entityIdSchema).optional(),
  startsAt: isoDateSchema.optional(),
  endsAt: isoDateSchema.optional(),
});

export const promotionCreateSchema = promotionObjectSchema;
export const promotionUpdateSchema = promotionObjectSchema.partial();

export type PromotionCreateValues = z.infer<typeof promotionCreateSchema>;
export type PromotionUpdateValues = z.infer<typeof promotionUpdateSchema>;
