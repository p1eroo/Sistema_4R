import { z } from "zod";

import { PaymentTerms } from "@/domain/suppliers/types";
import { emailSchema, phoneSchema, rucSchema } from "@/domain/shared/schemas";

const contactSchema = z.object({
  name: z
    .string({ required_error: "El nombre del contacto es obligatorio." })
    .trim()
    .min(1, "El nombre del contacto es obligatorio."),
  role: z.string().trim().optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
});

export const supplierObjectSchema = z.object({
  ruc: rucSchema,
  businessName: z
    .string({ required_error: "La razón social es obligatoria." })
    .trim()
    .min(1, "La razón social es obligatoria."),
  tradeName: z.string().trim().optional(),
  contact: contactSchema.optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  address: z.string().trim().optional(),
  paymentTerms: z.nativeEnum(PaymentTerms, {
    errorMap: () => ({ message: "Selecciona la condición de pago." }),
  }),
  notes: z.string().trim().optional(),
});

export const supplierCreateSchema = supplierObjectSchema;
export const supplierUpdateSchema = supplierObjectSchema.partial();

export type SupplierCreateValues = z.infer<typeof supplierCreateSchema>;
export type SupplierUpdateValues = z.infer<typeof supplierUpdateSchema>;
