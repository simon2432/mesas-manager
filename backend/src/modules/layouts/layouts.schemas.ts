import { z } from "zod";

export const layoutIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createLayoutBodySchema = z.object({
  name: z.string().trim().min(1, "name is required").max(120),
});

export type CreateLayoutBody = z.infer<typeof createLayoutBodySchema>;

export const updateLayoutBodySchema = z.object({
  name: z.string().trim().min(1, "name is required").max(120),
});

export type UpdateLayoutBody = z.infer<typeof updateLayoutBodySchema>;

export const setLayoutTablesBodySchema = z.object({
  tableIds: z.array(z.coerce.number().int().positive()),
});

export type SetLayoutTablesBody = z.infer<typeof setLayoutTablesBodySchema>;
