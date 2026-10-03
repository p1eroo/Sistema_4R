import { z } from "zod";

export const plateSchema = z
  .string({ required_error: "La placa es obligatoria." })
  .trim()
  .regex(/^[A-Za-z0-9]{3}-[0-9]{3}$/, "Ingresa una placa válida (ej. ABC-123).")
  .transform((value) => value.toUpperCase());

export const dniSchema = z
  .string({ required_error: "El DNI es obligatorio." })
  .trim()
  .regex(/^\d{8}$/, "El DNI debe tener 8 dígitos.");

export const rucSchema = z
  .string({ required_error: "El RUC es obligatorio." })
  .trim()
  .regex(/^\d{11}$/, "El RUC debe tener 11 dígitos.");

export const phoneSchema = z
  .string({ required_error: "El teléfono es obligatorio." })
  .trim()
  .regex(
    /^(?:\+51)?9\d{8}$/,
    "Ingresa un celular válido de 9 dígitos (ej. 987654321).",
  );

export const emailSchema = z
  .string({ required_error: "El correo es obligatorio." })
  .trim()
  .email("Ingresa un correo válido.");

export const isoDateSchema = z
  .string({ required_error: "La fecha es obligatoria." })
  .datetime({ offset: true, message: "Ingresa una fecha ISO válida." });

export const moneySchema = z.object({
  amount: z
    .number({ required_error: "El monto es obligatorio." })
    .int("El monto debe estar en céntimos (entero)."),
  currency: z.enum(["PEN"], {
    errorMap: () => ({ message: "La moneda debe ser PEN." }),
  }),
});

export const paginationSchema = z.object({
  page: z
    .number({ required_error: "La página es obligatoria." })
    .int("La página debe ser un entero.")
    .min(1, "La página debe ser mayor o igual a 1."),
  pageSize: z
    .number({ required_error: "El tamaño de página es obligatorio." })
    .int("El tamaño de página debe ser un entero.")
    .min(1, "El tamaño de página debe ser mayor o igual a 1."),
  total: z
    .number({ required_error: "El total es obligatorio." })
    .int("El total debe ser un entero.")
    .min(0, "El total no puede ser negativo."),
  totalPages: z
    .number({ required_error: "El total de páginas es obligatorio." })
    .int("El total de páginas debe ser un entero.")
    .min(0, "El total de páginas no puede ser negativo."),
});

export type Plate = z.infer<typeof plateSchema>;
export type MoneyInput = z.infer<typeof moneySchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
