import prisma from "~/lib/prisma";

export class ParticipanteEventoService {
  static async confirmar(eventoId: string, alunoId: string) {
    return prisma.participanteEvento.upsert({
      where: {
        eventoId_alunoId: {
          eventoId,
          alunoId,
        },
      },
      create: {
        eventoId,
        alunoId,
        confirmado: true,
      },
      update: {
        confirmado: true,
        dataConfirmacao: new Date(),
      },
    });
  }

  static async remover(eventoId: string, alunoId: string) {
    return prisma.participanteEvento.delete({
      where: {
        eventoId_alunoId: {
          eventoId,
          alunoId,
        },
      },
    });
  }

  static async listarParticipantes(eventoId: string) {
    return prisma.participanteEvento.findMany({
      where: { eventoId },
      include: {
        aluno: {
          include: {
            usuario: true,
          },
        },
      },
    });
  }
}
