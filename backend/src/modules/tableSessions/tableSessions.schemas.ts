import { z } from "zod";

export const sessionIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const sessionItemParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  itemId: z.coerce.number().int().positive(),
});

export const openSessionBodySchema = z.object({
  tableId: z.coerce.number().int().positive(),
  waiterId: z.coerce.number().int().positive(),
  guestCount: z.coerce
    .number()
    .int()
    .positive("guestCount must be greater than 0"),
});

export type OpenSessionBody = z.infer<typeof openSessionBodySchema>;

export const addSessionItemBodySchema = z.object({
  menuItemId: z.coerce.number().int().positive(),
  quantity: z.coerce
    .number()
    .int()
    .positive("quantity must be greater than 0"),
  note: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export type AddSessionItemBody = z.infer<typeof addSessionItemBodySchema>;

export const updateSessionItemBodySchema = z
  .object({
    quantity: z.coerce.number().int().positive().optional(),
    note: z
      .union([z.string().trim().max(500), z.literal(""), z.null()])
      .optional(),
  })
  .refine((b) => b.quantity !== undefined || b.note !== undefined, {
    message: "At least one of quantity, note is required",
  });

export type UpdateSessionItemBody = z.infer<typeof updateSessionItemBodySchema>;
