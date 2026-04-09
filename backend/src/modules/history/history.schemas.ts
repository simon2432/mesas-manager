import { z } from "zod";

export const historySessionIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
