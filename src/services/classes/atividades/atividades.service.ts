import prisma from "~/lib/prisma";

export async function getAtividadesDaAula(turmaDisciplinaId: string) {
  const vinculo = await prisma.turmaDisciplina.findUnique({
    where: { id: turmaDisciplinaId },
    select: { turmaId: true, disciplinaId: true }
  });

  if (!vinculo) return [];

  return await prisma.atividadeTurma.findMany({
    where: {
      turmaId: vinculo.turmaId,
      disciplinaId: vinculo.disciplinaId
    },
    include: {
      ciclo: { select: { nome: true } }
    },
    orderBy: { data: 'asc' }
  });
}

export async function getAtividadesComNotas(turmaDisciplinaId: string) {
  const relacao = await prisma.turmaDisciplina.findUnique({
    where: { id: turmaDisciplinaId },
    select: {
      turmaId: true,
      disciplinaId: true,
    }
  });

  if (!relacao) return [];

  return await prisma.atividadeTurma.findMany({
    where: {
      turmaId: relacao.turmaId,
      disciplinaId: relacao.disciplinaId
    },
    include: {
      notas: {
        include: {
          aluno: {
            include: { usuario: { select: { nome: true } } }
          }
        }
      }
    },
    orderBy: {
      data: 'asc'
    }
  });
}