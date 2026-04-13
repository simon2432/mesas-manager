import { z } from "zod";

export const menuItemIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createMenuItemBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  price: z
    .number({ error: () => ({ message: "El precio debe ser un número" }) })
    .positive("El precio debe ser mayor que 0"),
  description: z.string().trim().max(5000).optional(),
});

export const updateMenuItemBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .optional(),
    price: z
      .number({ error: () => ({ message: "El precio debe ser un número" }) })
      .positive("El precio debe ser mayor que 0")
      .optional(),
    description: z.union([z.string().trim().max(5000), z.null()]).optional(),
  })
  .refine(
    (d) =>
      d.name !== undefined ||
      d.price !== undefined ||
      d.description !== undefined,
    { message: "Indicá al menos un campo para actualizar" },
  );

export type CreateMenuItemBody = z.infer<typeof createMenuItemBodySchema>;
export type UpdateMenuItemBody = z.infer<typeof updateMenuItemBodySchema>;
