import { z } from "zod";

/** Query opcional `date=YYYY-MM-DD` (día calendario local del servidor). */
export const optionalLocalYmdQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});
