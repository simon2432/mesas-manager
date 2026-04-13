import { z } from "zod";

export const createUserBodySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio")
    .email("Correo electrónico inválido"),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

export const changeMyPasswordBodySchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es obligatoria"),
  newPassword: z
    .string()
    .min(1, "La nueva contraseña es obligatoria")
    .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});

export type ChangeMyPasswordBody = z.infer<typeof changeMyPasswordBodySchema>;
