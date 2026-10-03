import { z } from "zod";

import {
  DiagnosticSeverity,
  DiagnosticStatus,
} from "@/domain/diagnostics/types";
import type { EntityId } from "@/domain/shared";

const entityIdSchema = z.custom<EntityId>(
  (value) => typeof value === "string" && value.trim().length > 0,
  { message: "Selecciona una opción válida." },
);

export const diagnosticFindingSchema = z.object({
  id: entityIdSchema.optional(),
  code: z.string().trim().optional(),
  title: z
    .string({ required_error: "El título del hallazgo es obligatorio." })
    .trim()
    .min(1, "El título del hallazgo es obligatorio."),
  description: z.string().trim().optional(),
  severity: z.nativeEnum(DiagnosticSeverity, {
    errorMap: () => ({ message: "Selecciona la severidad." }),
  }),
  recommendation: z.string().trim().optional(),
});

export const diagnosticObjectSchema = z.object({
  workOrderId: entityIdSchema,
  technicianId: entityIdSchema.optional(),
  status: z.nativeEnum(DiagnosticStatus).optional(),
  summary: z
    .string({ required_error: "El resumen es obligatorio." })
    .trim()
    .min(1, "El resumen es obligatorio."),
  findings: z
    .array(diagnosticFindingSchema)
    .min(1, "Registra al menos un hallazgo."),
  recommendation: z.string().trim().optional(),
});

export const diagnosticCreateSchema = diagnosticObjectSchema;
export const diagnosticUpdateSchema = diagnosticObjectSchema.partial();

export type DiagnosticCreateValues = z.infer<typeof diagnosticCreateSchema>;
export type DiagnosticUpdateValues = z.infer<typeof diagnosticUpdateSchema>;
