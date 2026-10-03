import { z } from "zod";

import type { EntityId } from "@/domain/shared";
import { isoDateSchema } from "@/domain/shared/schemas";
import { WorkOrderStatus } from "@/domain/work-orders/status";
import { WorkOrderPriority } from "@/domain/work-orders/types";

const entityIdSchema = z.custom<EntityId>(
  (value) => typeof value === "string" && value.trim().length > 0,
  { message: "Selecciona una opción válida." },
);

export const workOrderObjectSchema = z.object({
  customerId: entityIdSchema,
  vehicleId: entityIdSchema,
  branchId: entityIdSchema,
  advisorId: entityIdSchema.optional(),
  technicianId: entityIdSchema.optional(),
  receptionId: entityIdSchema.optional(),
  estimateId: entityIdSchema.optional(),
  bayId: entityIdSchema.optional(),
  reason: z
    .string({ required_error: "El motivo de la orden es obligatorio." })
    .trim()
    .min(1, "El motivo de la orden es obligatorio."),
  odometerKm: z
    .number({ required_error: "El kilometraje es obligatorio." })
    .int("El kilometraje debe ser un número entero.")
    .min(0, "El kilometraje no puede ser negativo."),
  priority: z.nativeEnum(WorkOrderPriority, {
    errorMap: () => ({ message: "Selecciona la prioridad." }),
  }),
  promisedAt: isoDateSchema.optional(),
  notes: z.string().trim().optional(),
});

export const workOrderCreateSchema = workOrderObjectSchema;

export const workOrderUpdateSchema = workOrderObjectSchema.partial();

export const workOrderStatusUpdateSchema = z.object({
  status: z.nativeEnum(WorkOrderStatus, {
    errorMap: () => ({ message: "Selecciona un estado válido." }),
  }),
});

export type WorkOrderCreateValues = z.infer<typeof workOrderCreateSchema>;
export type WorkOrderUpdateValues = z.infer<typeof workOrderUpdateSchema>;
export type WorkOrderStatusUpdateValues = z.infer<
  typeof workOrderStatusUpdateSchema
>;
