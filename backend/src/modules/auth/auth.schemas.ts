import { z } from "zod";

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

export const registerBodySchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  name: z.string().trim().min(1, "Name is required").max(120),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
