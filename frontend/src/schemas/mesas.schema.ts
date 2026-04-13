import { z } from "zod";

const positiveIntString = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Ingresá ${label}`)
    .regex(/^\d+$/, "Solo números enteros")
    .transform((s) => parseInt(s, 10))
    .pipe(z.number().int().positive());

export const createTableFormSchema = z.object({
  number: positiveIntString("el número"),
  capacity: positiveIntString("la capacidad"),
});

export type CreateTableFormValues = z.input<typeof createTableFormSchema>;
export type CreateTableParsed = z.output<typeof createTableFormSchema>;

export function editTableFormSchemaWithMinCapacity(minGuests: number) {
  const m = Math.max(1, Math.floor(minGuests));
  return z.object({
    number: positiveIntString("el número"),
    capacity: z
      .string()
      .trim()
      .min(1, "Ingresá la capacidad")
      .regex(/^\d+$/, "Solo números enteros")
      .transform((s) => parseInt(s, 10))
      .pipe(
        z.number().int().min(
          m,
          m > 1
            ? `La capacidad debe ser al menos ${m} (comensales en la sesión abierta).`
            : "La capacidad debe ser al menos 1",
        ),
      ),
  });
}

export const editTableFormSchema = editTableFormSchemaWithMinCapacity(1);

export type EditTableFormValues = z.input<typeof editTableFormSchema>;
export type EditTableParsed = z.output<typeof editTableFormSchema>;

export function openSessionFormSchemaForCapacity(maxCapacity: number) {
  return z.object({
    waiterId: z
      .number()
      .refine((n) => Number.isInteger(n) && n > 0, "Elegí un mesero"),
    guestCount: z
      .string()
      .trim()
      .min(1, "Ingresá la cantidad")
      .regex(/^\d+$/, "Solo números")
      .transform((s) => parseInt(s, 10))
      .pipe(
        z
          .number()
          .int()
          .min(1, "Mínimo 1 comensal")
          .max(
            maxCapacity,
            `No puede superar la capacidad de la mesa (${maxCapacity})`,
          ),
      ),
  });
}

export type OpenSessionFormInput = z.input<
  ReturnType<typeof openSessionFormSchemaForCapacity>
>;
