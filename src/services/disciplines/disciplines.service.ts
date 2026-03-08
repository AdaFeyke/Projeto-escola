'use server';

import prisma from '~/lib/prisma';
import { getCurrentEscolaId } from '~/config/permission-manager'

export async function getDisciplinasByEscola() {
  const escolaId = await getCurrentEscolaId();

  return prisma.disciplina.findMany({
    where: { escolaId },
    select: {
      id: true,
      nome: true,
      sigla: true,
    },
    orderBy: { nome: "asc" },
  });
}

