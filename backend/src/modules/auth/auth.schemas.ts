import { z } from "zod";

/** Payload mínimo del JWT (userId + email). */
export interface JwtUserPayload {
  userId: number;
  email: string;
}

export const loginBodySchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
