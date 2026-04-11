import { z } from "zod";

export const layoutNameFormSchema = z.object({
  name: z.string().trim().min(1, "Ingresá un nombre").max(120),
});

export type LayoutNameFormInput = z.input<typeof layoutNameFormSchema>;
export type LayoutNameFormParsed = z.output<typeof layoutNameFormSchema>;
