import { z } from "zod";

import { AppointmentServiceType } from "@/domain/appointments/types";
import type { EntityId } from "@/domain/shared";
import { isoDateSchema } from "@/domain/shared/schemas";

const entityIdSchema = z.custom<EntityId>(
  (value) => typeof value === "string" && value.trim().length > 0,
  { message: "Selecciona una opción válida." },
);

export const appointmentObjectSchema = z.object({
  customerId: entityIdSchema,
  vehicleId: entityIdSchema,
  branchId: entityIdSchema,
  advisorId: entityIdSchema.optional(),
  scheduledAt: isoDateSchema,
  durationMinutes: z
    .number({ required_error: "La duración es obligatoria." })
    .int("La duración debe ser un número entero.")
    .min(15, "La duración mínima es de 15 minutos."),
  serviceType: z.nativeEnum(AppointmentServiceType, {
    errorMap: () => ({ message: "Selecciona el tipo de servicio." }),
  }),
  notes: z.string().trim().optional(),
});

export const appointmentCreateSchema = appointmentObjectSchema;
export const appointmentUpdateSchema = appointmentObjectSchema.partial();

export type AppointmentCreateValues = z.infer<typeof appointmentCreateSchema>;
export type AppointmentUpdateValues = z.infer<typeof appointmentUpdateSchema>;
