import { z } from "zod";

export const tableIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createTableBodySchema = z.object({
  number: z.coerce.number().int().positive("number must be a positive integer"),
  capacity: z.coerce
    .number()
    .int()
    .positive("capacity must be greater than 0"),
});

export type CreateTableBody = z.infer<typeof createTableBodySchema>;

export const updateTableBodySchema = z
  .object({
    number: z.coerce.number().int().positive().optional(),
    capacity: z.coerce.number().int().positive().optional(),
  })
  .refine((b) => b.number !== undefined || b.capacity !== undefined, {
    message: "At least one of number, capacity is required",
  });

export type UpdateTableBody = z.infer<typeof updateTableBodySchema>;
