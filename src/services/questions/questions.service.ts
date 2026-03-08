
'use server';

import prisma from '~/lib/prisma';
import { getCurrentEscolaId } from '~/config/permission-manager'

export async function getEscolaQuestions() {
  try {
    const escolaId = await getCurrentEscolaId();

    const perguntas = await prisma.questionarioPergunta.findMany({
      where: {
        escolaId: escolaId,
        ativa: true,
      },
      orderBy: {
        criadoEm: 'asc',
      },
    });
    return perguntas;
  } catch (error) {
    console.error("Erro ao buscar perguntas:", error);
    return [];
  }
}