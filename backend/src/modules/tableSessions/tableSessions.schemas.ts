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
    .positive("La cantidad de personas debe ser mayor que 0"),
});

export type OpenSessionBody = z.infer<typeof openSessionBodySchema>;

export const addSessionItemBodySchema = z.object({
  menuItemId: z.coerce.number().int().positive(),
  quantity: z.coerce
    .number()
    .int()
    .positive("La cantidad debe ser mayor que 0"),
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
    message: "Indicá cantidad o nota (o ambos)",
  });

export type UpdateSessionItemBody = z.infer<typeof updateSessionItemBodySchema>;

export const updateOpenSessionBodySchema = z
  .object({
    waiterId: z.coerce.number().int().positive().optional(),
    guestCount: z.coerce.number().int().positive().optional(),
  })
  .refine((b) => b.waiterId !== undefined || b.guestCount !== undefined, {
    message: "Indicá al menos un cambio (mesero o personas)",
  });

export type UpdateOpenSessionBody = z.infer<typeof updateOpenSessionBodySchema>;
