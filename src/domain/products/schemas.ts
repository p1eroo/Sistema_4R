import { z } from "zod";

import { ProductStatus, ProductUnit } from "@/domain/products/types";
import type { EntityId } from "@/domain/shared";
import { moneySchema } from "@/domain/shared/schemas";

const entityIdSchema = z.custom<EntityId>(
  (value) => typeof value === "string" && value.trim().length > 0,
  { message: "Selecciona una opción válida." },
);

export const skuSchema = z
  .string({ required_error: "El SKU es obligatorio." })
  .trim()
  .toUpperCase()
  .regex(
    /^[A-Z0-9-]{3,20}$/,
    "El SKU debe tener entre 3 y 20 caracteres (letras, números o guiones).",
  );

const priceSchema = moneySchema.refine((value) => value.amount >= 0, {
  message: "El precio no puede ser negativo.",
});

export const productObjectSchema = z.object({
  sku: skuSchema,
  name: z
    .string({ required_error: "El nombre es obligatorio." })
    .trim()
    .min(1, "El nombre es obligatorio."),
  description: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  categoryId: entityIdSchema.optional(),
  unit: z.nativeEnum(ProductUnit, {
    errorMap: () => ({ message: "Selecciona la unidad." }),
  }),
  price: priceSchema,
  cost: priceSchema.optional(),
  igvRate: z
    .number()
    .min(0, "El IGV no puede ser negativo.")
    .max(1, "El IGV no puede superar el 100%.")
    .optional(),
  stock: z
    .number({ required_error: "El stock es obligatorio." })
    .int("El stock debe ser un número entero.")
    .min(0, "El stock no puede ser negativo."),
  minStock: z
    .number({ required_error: "El stock mínimo es obligatorio." })
    .int("El stock mínimo debe ser un número entero.")
    .min(0, "El stock mínimo no puede ser negativo."),
  location: z.string().trim().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
});

export const productCreateSchema = productObjectSchema;
export const productUpdateSchema = productObjectSchema.partial();

export type ProductCreateValues = z.infer<typeof productCreateSchema>;
export type ProductUpdateValues = z.infer<typeof productUpdateSchema>;
