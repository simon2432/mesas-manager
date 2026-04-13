import { z } from "zod";

export const tableIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createTableBodySchema = z.object({
  number: z.coerce
    .number()
    .int()
    .positive("El número de mesa debe ser un entero positivo"),
  capacity: z.coerce
    .number()
    .int()
    .positive("La capacidad debe ser mayor que 0"),
});

export type CreateTableBody = z.infer<typeof createTableBodySchema>;

export const updateTableBodySchema = z
  .object({
    number: z.coerce.number().int().positive().optional(),
    capacity: z.coerce.number().int().positive().optional(),
  })
  .refine((b) => b.number !== undefined || b.capacity !== undefined, {
    message: "Indicá número o capacidad (o ambos)",
  });

export type UpdateTableBody = z.infer<typeof updateTableBodySchema>;
