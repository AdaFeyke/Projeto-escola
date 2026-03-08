import { z } from "zod";

export const StudentFormSchema = z.object({
  nome: z.string().min(3, "O nome é obrigatório e deve ter no mínimo 3 caracteres."),
  email: z.string().email("Formato de e-mail inválido."),
  senha: z.string().min(8, "A senha é obrigatória e deve ter no mínimo 8 caracteres."),
  dataNascimento: z.date({
    required_error: "A data de nascimento é obrigatória.",
  }),

  matricula: z.string().min(5, "A matrícula é obrigatória."),
  endereco: z.string().optional(), // Pode ser nulo
  
});

export type StudentFormValues = z.infer<typeof StudentFormSchema>;