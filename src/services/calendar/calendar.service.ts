import prisma from '~/lib/prisma';
import { TipoDia } from '@prisma/client';

export const CalendarioService = {
  async getCalendarioCompleto(escolaId: string, anoLetivoId: string) {
    const eventos = await prisma.calendarioEscolar.findMany({
      where: {
        escolaId,
        anoLetivoId
      },
      orderBy: { dataInicio: "asc" },
    });

    return eventos.map(evento => ({
      ...evento,
      isPeriodo: evento.dataInicio.getTime() !== evento.dataFim.getTime(),
      colorConfig: this.getColorByType(evento.tipo)
    }));
  },

  getColorByType(tipo: TipoDia) {
    const configs = {
      LETIVO_EXTRA: "bg-emerald-100 text-emerald-700 border-emerald-200",
      NAO_LETIVO_FERIADO: "bg-rose-100 text-rose-700 border-rose-200",
      NAO_LETIVO_RECESSO: "bg-sky-100 text-sky-700 border-sky-200",
      REUNIAO_PEDAGOGICA: "bg-amber-100 text-amber-700 border-amber-200",
      EVENTO_ESCOLAR: "bg-indigo-100 text-indigo-600 border-indigo-200",
    };
    return configs[tipo] || "bg-gray-100 text-gray-700";
  }
};

export const getLabelByType = (tipo: string) => {
  const labels: Record<string, string> = {
    NAO_LETIVO_FERIADO: "Feriado",
    NAO_LETIVO_RECESSO: "Recesso",
    REUNIAO_PEDAGOGICA: "Reunião Pedagógica",
    LETIVO_EXTRA: "Letivo Extra",
    EVENTO_ESCOLAR: "Evento Escolar",
    PROVA: "Avaliação",
    TRABALHO: "Trabalho Acadêmico"
  };
  return labels[tipo] || tipo;
};