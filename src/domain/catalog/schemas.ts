import { z } from "zod";

import type { EntityId } from "@/domain/shared";

const entityIdSchema = z.custom<EntityId>(
  (value) => typeof value === "string" && value.trim().length > 0,
  { message: "Selecciona una opción válida." },
);

const codeSchema = z
  .string({ required_error: "El código es obligatorio." })
  .trim()
  .toUpperCase()
  .regex(
    /^[A-Z0-9-]{2,20}$/,
    "El código debe tener entre 2 y 20 caracteres (letras, números o guiones).",
  );

const nameSchema = z
  .string({ required_error: "El nombre es obligatorio." })
  .trim()
  .min(1, "El nombre es obligatorio.");

const descriptionSchema = z.string().trim().optional();

export const categoryObjectSchema = z.object({
  code: codeSchema,
  name: nameSchema,
  description: descriptionSchema,
});

export const categoryCreateSchema = categoryObjectSchema;
export const categoryUpdateSchema = categoryObjectSchema.partial();

export const brandObjectSchema = z.object({
  code: codeSchema,
  name: nameSchema,
  description: descriptionSchema,
});

export const brandCreateSchema = brandObjectSchema;
export const brandUpdateSchema = brandObjectSchema.partial();

export const lineObjectSchema = z.object({
  code: codeSchema,
  name: nameSchema,
  brandId: entityIdSchema.optional(),
  categoryId: entityIdSchema.optional(),
});

export const lineCreateSchema = lineObjectSchema;
export const lineUpdateSchema = lineObjectSchema.partial();

export type CategoryCreateValues = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateValues = z.infer<typeof categoryUpdateSchema>;
export type BrandCreateValues = z.infer<typeof brandCreateSchema>;
export type BrandUpdateValues = z.infer<typeof brandUpdateSchema>;
export type LineCreateValues = z.infer<typeof lineCreateSchema>;
export type LineUpdateValues = z.infer<typeof lineUpdateSchema>;
