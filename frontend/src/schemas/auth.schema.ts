import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().trim().min(1, "Ingresá tu email").email("Email inválido"),
  password: z
    .string()
    .min(1, "Ingresá tu contraseña")
    .min(6, "Mínimo 6 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z.object({
  name: z.string().trim().min(1, "Ingresá tu nombre").max(120),
  email: z.string().trim().min(1, "Ingresá tu email").email("Email inválido"),
  password: z
    .string()
    .min(1, "Ingresá una contraseña")
    .min(6, "Mínimo 6 caracteres"),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
