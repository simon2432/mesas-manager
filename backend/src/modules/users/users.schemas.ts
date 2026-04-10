import { z } from "zod";

export const createUserBodySchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  name: z.string().trim().min(1, "Name is required").max(120),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

export const changeMyPasswordBodySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(1, "New password is required")
    .min(6, "New password must be at least 6 characters"),
});

export type ChangeMyPasswordBody = z.infer<typeof changeMyPasswordBodySchema>;
