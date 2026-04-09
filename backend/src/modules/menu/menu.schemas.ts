import { z } from "zod";

export const menuItemIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createMenuItemBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  price: z
    .number({ error: () => ({ message: "Price must be a number" }) })
    .positive("Price must be greater than 0"),
  description: z.string().trim().max(5000).optional(),
});

export const updateMenuItemBodySchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
    price: z
      .number({ error: () => ({ message: "Price must be a number" }) })
      .positive("Price must be greater than 0")
      .optional(),
    description: z
      .union([z.string().trim().max(5000), z.null()])
      .optional(),
  })
  .refine(
    (d) =>
      d.name !== undefined ||
      d.price !== undefined ||
      d.description !== undefined,
    { message: "At least one field is required" },
  );

export type CreateMenuItemBody = z.infer<typeof createMenuItemBodySchema>;
export type UpdateMenuItemBody = z.infer<typeof updateMenuItemBodySchema>;
