import { z } from "zod";

const qtyString = z
  .string()
  .trim()
  .min(1, "Ingresá la cantidad")
  .regex(/^\d+$/, "Solo números")
  .transform((s) => parseInt(s, 10))
  .pipe(z.number().int().positive());

export const addConsumptionSchema = z.object({
  menuItemId: z
    .number()
    .refine((n) => Number.isInteger(n) && n > 0, "Elegí un producto del menú"),
  quantity: qtyString,
  note: z
    .string()
    .max(500)
    .optional()
    .transform((s) => {
      if (s === undefined) return undefined;
      const t = s.trim();
      return t === "" ? undefined : t;
    }),
});

export type AddConsumptionFormInput = z.input<typeof addConsumptionSchema>;
export type AddConsumptionParsed = z.output<typeof addConsumptionSchema>;

export const editConsumptionSchema = z.object({
  quantity: qtyString,
  note: z.string().max(500).transform((s) => {
    const t = s.trim();
    return t === "" ? null : t;
  }),
});

export type EditConsumptionFormInput = z.input<typeof editConsumptionSchema>;
export type EditConsumptionParsed = z.output<typeof editConsumptionSchema>;
