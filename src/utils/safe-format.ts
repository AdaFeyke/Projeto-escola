import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Converte diversos tipos de entrada para um objeto Date válido ou null
 */
export const safeParseDate = (dateInput: any): Date | null => {
  if (!dateInput) return null;
  
  // Se já for Date, retorna ele mesmo
  if (dateInput instanceof Date) return isValid(dateInput) ? dateInput : null;
  
  // Se for string ISO ou formato comum, tenta parsear
  const parsed = typeof dateInput === "string" ? parseISO(dateInput) : new Date(dateInput);
  
  return isValid(parsed) ? parsed : null;
};

/**
 * Formata uma data de forma segura para exibição
 */
export const safeFormat = (dateInput: any, formatStr: string = "dd/MM/yyyy") => {
  const date = safeParseDate(dateInput);
  
  if (!date) return "--/--";

  return format(date, formatStr, { locale: ptBR });
};