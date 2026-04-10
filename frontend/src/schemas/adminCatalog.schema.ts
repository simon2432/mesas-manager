import { z } from "zod";

/** Acepta `12` o `12.5` o `12,50` (coma decimal). */
const priceString = z
  .string()
  .trim()
  .min(1, "Ingresá el precio")
  .transform((s) => s.replace(",", "."))
  .refine((s) => {
    const n = Number(s);
    return !Number.isNaN(n) && n > 0;
  }, "Precio inválido")
  .transform((s) => Number(s));

/** Alta y edición de ítem de menú (descripción vacía → null). */
export const menuItemFormSchema = z.object({
  name: z.string().trim().min(2, "Mínimo 2 caracteres"),
  price: priceString,
  description: z.string().max(5000).transform((s) => {
    const t = s.trim();
    return t === "" ? null : t;
  }),
});

export type MenuItemFormInput = z.input<typeof menuItemFormSchema>;
export type MenuItemFormParsed = z.output<typeof menuItemFormSchema>;

export const waiterNameSchema = z.object({
  name: z.string().trim().min(2, "Mínimo 2 caracteres"),
});

export type WaiterNameInput = z.input<typeof waiterNameSchema>;
export type WaiterNameParsed = z.output<typeof waiterNameSchema>;
