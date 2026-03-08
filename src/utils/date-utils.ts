import { format, parseISO, differenceInDays, startOfDay } from "date-fns";

export const toDateInputString = (date: Date | string | null | undefined): string => {
  if (!date) return "";

  if (typeof date === "string") {
    return date.split("T")[0] ?? '';
  }

  // Use UTC methods to avoid timezone shift on the input date
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Robustly formats a date for display, avoiding timezone shift on "pure" dates (like birthdays).
 */
export const formatDisplayDate = (date: string | Date | null | undefined): string => {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Data Inválida";

  // For "pure" dates (like birthdays), we use UTC methods to avoid timezone shift
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Formats a date and time for the pt-BR locale and America/Sao_Paulo timezone.
 */
export const formatDateTimePTBR = (date: string | Date | null | undefined): string => {
  if (!date) return "N/A";
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'America/Sao_Paulo'
    }).format(new Date(date));
  } catch (e) {
    return "Data Inválida";
  }
};

export const getDurationInDays = (inicio: string | Date, fim: string | Date) => {
  if (!inicio || !fim) return 0;

  const dataInicio = typeof inicio === 'string' ? parseISO(inicio) : startOfDay(inicio);
  const dataFim = typeof fim === 'string' ? parseISO(fim) : startOfDay(fim);

  return Math.abs(differenceInDays(dataFim, dataInicio)) + 1;
};