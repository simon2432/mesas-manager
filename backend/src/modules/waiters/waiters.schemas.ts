import { z } from "zod";

export const waiterIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createWaiterBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
});

export const updateWaiterBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .optional(),
});

export type CreateWaiterBody = z.infer<typeof createWaiterBodySchema>;
export type UpdateWaiterBody = z.infer<typeof updateWaiterBodySchema>;
