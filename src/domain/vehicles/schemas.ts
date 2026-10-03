import { z } from "zod";

import { FuelType } from "@/domain/vehicles/types";
import type { EntityId } from "@/domain/shared";
import { plateSchema } from "@/domain/shared/schemas";

export const MIN_VEHICLE_YEAR = 1950;
export const MAX_VEHICLE_YEAR = new Date().getFullYear() + 1;

const entityIdSchema = z.custom<EntityId>(
  (value) => typeof value === "string" && value.trim().length > 0,
  { message: "Selecciona un cliente válido." },
);

const yearSchema = z
  .number({ required_error: "El año es obligatorio." })
  .int("El año debe ser un número entero.")
  .min(MIN_VEHICLE_YEAR, `El año no puede ser menor a ${MIN_VEHICLE_YEAR}.`)
  .max(MAX_VEHICLE_YEAR, `El año no puede ser mayor a ${MAX_VEHICLE_YEAR}.`);

const branchRefSchema = z.object({
  id: entityIdSchema,
  name: z.string().trim().min(1, "El nombre de la sede es obligatorio."),
});

const vinSchema = z
  .string()
  .trim()
  .regex(/^[A-HJ-NPR-Z0-9]{17}$/i, "El VIN debe tener 17 caracteres válidos.");

export const vehicleObjectSchema = z.object({
  customerId: entityIdSchema,
  plate: plateSchema,
  brand: z
    .string({ required_error: "La marca es obligatoria." })
    .trim()
    .min(1, "La marca es obligatoria."),
  model: z
    .string({ required_error: "El modelo es obligatorio." })
    .trim()
    .min(1, "El modelo es obligatorio."),
  year: yearSchema,
  color: z
    .string({ required_error: "El color es obligatorio." })
    .trim()
    .min(1, "El color es obligatorio."),
  fuelType: z.nativeEnum(FuelType, {
    errorMap: () => ({ message: "Selecciona el tipo de combustible." }),
  }),
  odometerKm: z
    .number({ required_error: "El kilometraje es obligatorio." })
    .int("El kilometraje debe ser un número entero.")
    .min(0, "El kilometraje no puede ser negativo."),
  vin: vinSchema.optional(),
  usualBranch: branchRefSchema.optional(),
  notes: z.string().trim().optional(),
});

export const vehicleCreateSchema = vehicleObjectSchema;
export const vehicleUpdateSchema = vehicleObjectSchema.partial();

export type VehicleCreateValues = z.infer<typeof vehicleCreateSchema>;
export type VehicleUpdateValues = z.infer<typeof vehicleUpdateSchema>;
