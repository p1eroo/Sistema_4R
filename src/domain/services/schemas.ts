import { z } from "zod";

import { ServiceCategory } from "@/domain/services/types";
import { moneySchema } from "@/domain/shared/schemas";

const priceSchema = moneySchema.refine((value) => value.amount >= 0, {
  message: "El precio no puede ser negativo.",
});

export const serviceObjectSchema = z.object({
  code: z
    .string({ required_error: "El código es obligatorio." })
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z0-9-]{3,20}$/,
      "El código debe tener entre 3 y 20 caracteres (letras, números o guiones).",
    ),
  name: z
    .string({ required_error: "El nombre es obligatorio." })
    .trim()
    .min(1, "El nombre es obligatorio."),
  description: z.string().trim().optional(),
  category: z.nativeEnum(ServiceCategory, {
    errorMap: () => ({ message: "Selecciona la categoría." }),
  }),
  estimatedMinutes: z
    .number({ required_error: "La duración es obligatoria." })
    .int("La duración debe ser un número entero.")
    .min(15, "La duración mínima es de 15 minutos."),
  price: priceSchema,
  igvRate: z
    .number()
    .min(0, "El IGV no puede ser negativo.")
    .max(1, "El IGV no puede superar el 100%.")
    .optional(),
});

export const serviceCreateSchema = serviceObjectSchema;
export const serviceUpdateSchema = serviceObjectSchema.partial();

export type ServiceCreateValues = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdateValues = z.infer<typeof serviceUpdateSchema>;
