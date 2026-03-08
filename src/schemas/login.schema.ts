import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(1, "A senha é obrigatória."),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  email: z.string().email("Email inválido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});
