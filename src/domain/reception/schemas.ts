import { z } from "zod";

import {
  FuelLevel,
  RECEPTION_CHECKLIST_CATALOG,
  type ChecklistItemId,
} from "@/domain/reception/types";
import type { EntityId } from "@/domain/shared";

const entityIdSchema = z.custom<EntityId>(
  (value) => typeof value === "string" && value.trim().length > 0,
  { message: "Selecciona una opción válida." },
);

const checklistItemIdSchema = z.enum(
  RECEPTION_CHECKLIST_CATALOG.map((item) => item.id) as [
    ChecklistItemId,
    ...ChecklistItemId[],
  ],
);

export const receptionChecklistItemSchema = z.object({
  id: checklistItemIdSchema,
  label: z
    .string({ required_error: "La etiqueta del ítem es obligatoria." })
    .trim()
    .min(1, "La etiqueta del ítem es obligatoria."),
  checked: z.boolean(),
  notes: z.string().trim().optional(),
});

export const receptionBelongingSchema = z.object({
  id: entityIdSchema,
  label: z
    .string({ required_error: "El nombre de la pertenencia es obligatorio." })
    .trim()
    .min(1, "El nombre de la pertenencia es obligatorio."),
  quantity: z
    .number({ required_error: "La cantidad es obligatoria." })
    .int("La cantidad debe ser un número entero.")
    .min(1, "La cantidad debe ser al menos 1."),
  notes: z.string().trim().optional(),
});

export const receptionStepPartySchema = z.object({
  customerId: entityIdSchema,
  vehicleId: entityIdSchema,
  branchId: entityIdSchema,
  advisorId: entityIdSchema.optional(),
  reason: z
    .string({ required_error: "El motivo de ingreso es obligatorio." })
    .trim()
    .min(1, "El motivo de ingreso es obligatorio."),
});

export const receptionStepChecklistSchema = z.object({
  odometerKm: z
    .number({ required_error: "El kilometraje es obligatorio." })
    .int("El kilometraje debe ser un número entero.")
    .min(0, "El kilometraje no puede ser negativo."),
  fuelLevel: z.nativeEnum(FuelLevel, {
    errorMap: () => ({ message: "Selecciona el nivel de combustible." }),
  }),
  belongings: z.array(receptionBelongingSchema).default([]),
  checklist: z.array(receptionChecklistItemSchema).default([]),
  observations: z.string().trim().optional(),
});

export const receptionCompleteSchema = receptionStepPartySchema.merge(
  receptionStepChecklistSchema,
);

export const receptionDraftSchema = z.object({
  customerId: entityIdSchema,
  vehicleId: entityIdSchema,
  branchId: entityIdSchema,
  advisorId: entityIdSchema.optional(),
  reason: z.string().trim().min(1).optional(),
  odometerKm: z.number().int().min(0).optional(),
  fuelLevel: z.nativeEnum(FuelLevel).optional(),
  belongings: z.array(receptionBelongingSchema).optional(),
  checklist: z.array(receptionChecklistItemSchema).optional(),
  observations: z.string().trim().optional(),
});

export type ReceptionPartyValues = z.infer<typeof receptionStepPartySchema>;
export type ReceptionChecklistValues = z.infer<
  typeof receptionStepChecklistSchema
>;
export type ReceptionCompleteValues = z.infer<typeof receptionCompleteSchema>;
export type ReceptionDraftValues = z.infer<typeof receptionDraftSchema>;
