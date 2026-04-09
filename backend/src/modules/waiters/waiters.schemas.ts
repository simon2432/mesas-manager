import { z } from "zod";

export const waiterIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createWaiterBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
});

export const updateWaiterBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .optional(),
});

export type CreateWaiterBody = z.infer<typeof createWaiterBodySchema>;
export type UpdateWaiterBody = z.infer<typeof updateWaiterBodySchema>;
