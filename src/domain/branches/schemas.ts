import { z } from "zod";

export const branchObjectSchema = z.object({
  slug: z
    .string({ required_error: "El código de sede es obligatorio." })
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9-]{2,20}$/,
      "El código debe tener entre 2 y 20 caracteres (minúsculas, números o guiones).",
    ),
  name: z
    .string({ required_error: "El nombre es obligatorio." })
    .trim()
    .min(1, "El nombre es obligatorio."),
  address: z.string().trim().min(1, "La dirección es obligatoria."),
  phone: z.string().trim().min(1, "El teléfono es obligatorio."),
  capacity: z
    .number({ required_error: "La capacidad es obligatoria." })
    .int("La capacidad debe ser un número entero.")
    .min(1, "La capacidad debe ser al menos 1."),
  isDefault: z.boolean().optional(),
});

export const branchCreateSchema = branchObjectSchema;
export const branchUpdateSchema = branchObjectSchema.partial();

export type BranchCreateValues = z.infer<typeof branchCreateSchema>;
export type BranchUpdateValues = z.infer<typeof branchUpdateSchema>;
