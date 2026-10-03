import { z } from "zod";

import { CustomerType, DocumentType } from "@/domain/customers/types";
import type { EntityId } from "@/domain/shared";
import {
  dniSchema,
  emailSchema,
  phoneSchema,
  rucSchema,
} from "@/domain/shared/schemas";

const entityIdSchema = z.custom<EntityId>(
  (value) => typeof value === "string" && value.trim().length > 0,
  { message: "Selecciona una opción válida." },
);

const ceSchema = z
  .string({ required_error: "El carné de extranjería es obligatorio." })
  .trim()
  .regex(
    /^[A-Za-z0-9]{9,12}$/,
    "El carné de extranjería debe tener entre 9 y 12 caracteres.",
  );

const addressSchema = z.object({
  line1: z
    .string({ required_error: "La dirección es obligatoria." })
    .trim()
    .min(1, "La dirección es obligatoria."),
  district: z
    .string()
    .trim()
    .min(1, "El distrito no puede estar vacío.")
    .optional(),
  city: z.string().trim().min(1, "La ciudad no puede estar vacía.").optional(),
  region: z
    .string()
    .trim()
    .min(1, "La región no puede estar vacía.")
    .optional(),
});

const customerPhoneSchema = z.object({
  label: z
    .string({ required_error: "La etiqueta del teléfono es obligatoria." })
    .trim()
    .min(1, "La etiqueta del teléfono es obligatoria."),
  number: phoneSchema,
});

const branchRefSchema = z.object({
  id: entityIdSchema,
  name: z.string().trim().min(1, "El nombre de la sede es obligatorio."),
});

export const customerObjectSchema = z.object({
  type: z.nativeEnum(CustomerType, {
    errorMap: () => ({ message: "Selecciona el tipo de cliente." }),
  }),
  documentType: z.nativeEnum(DocumentType, {
    errorMap: () => ({ message: "Selecciona el tipo de documento." }),
  }),
  documentNumber: z
    .string({ required_error: "El número de documento es obligatorio." })
    .trim()
    .min(1, "El número de documento es obligatorio."),
  firstName: z
    .string()
    .trim()
    .min(1, "El nombre no puede estar vacío.")
    .optional(),
  lastName: z
    .string()
    .trim()
    .min(1, "El apellido no puede estar vacío.")
    .optional(),
  businessName: z
    .string()
    .trim()
    .min(1, "La razón social no puede estar vacía.")
    .optional(),
  phones: z.array(customerPhoneSchema).min(1, "Registra al menos un teléfono."),
  email: emailSchema.optional(),
  address: addressSchema.optional(),
  preferredBranch: branchRefSchema.optional(),
  notes: z.string().trim().optional(),
});

type CustomerObjectValues = z.infer<typeof customerObjectSchema>;

function documentIssue(
  documentType: DocumentType,
  documentNumber: string,
): string | null {
  const schema =
    documentType === DocumentType.DNI
      ? dniSchema
      : documentType === DocumentType.RUC
        ? rucSchema
        : ceSchema;

  const result = schema.safeParse(documentNumber);
  return result.success
    ? null
    : (result.error.issues[0]?.message ?? "El documento no es válido.");
}

function refineCustomer(
  value: CustomerObjectValues,
  ctx: z.RefinementCtx,
): void {
  const documentMessage = documentIssue(
    value.documentType,
    value.documentNumber,
  );
  if (documentMessage) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["documentNumber"],
      message: documentMessage,
    });
  }

  if (value.type === CustomerType.Persona) {
    if (!value.firstName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["firstName"],
        message: "El nombre es obligatorio.",
      });
    }
    if (!value.lastName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lastName"],
        message: "El apellido es obligatorio.",
      });
    }
  } else if (!value.businessName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["businessName"],
      message: "La razón social es obligatoria.",
    });
  }

  if (
    value.type === CustomerType.Empresa &&
    value.documentType !== DocumentType.RUC
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["documentType"],
      message: "Para empresas el documento debe ser RUC.",
    });
  }
}

export const customerCreateSchema =
  customerObjectSchema.superRefine(refineCustomer);

export const customerUpdateSchema = customerObjectSchema.partial();

export type CustomerCreateValues = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateValues = z.infer<typeof customerUpdateSchema>;
