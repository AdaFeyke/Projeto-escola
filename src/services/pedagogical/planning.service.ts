import prisma from '~/lib/prisma';
import { getCurrentEscolaId, getUserSession } from '~/config/permission-manager';

export async function getPlanningData(filters?: { anoLetivoId?: string; cicloId?: string }) {
  const escolaId = await getCurrentEscolaId();
  const session = await getUserSession();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const where: any = { escolaId };

  if (filters?.cicloId) {
    const ciclo = await prisma.cicloLetivo.findUnique({
      where: { id: filters.cicloId }
    });
    if (ciclo) {
      where.data = {
        gte: ciclo.dataInicio,
        lte: ciclo.dataFim
      };
    }
  } else if (filters?.anoLetivoId) {
    where.turma = {
      anoLetivoId: filters.anoLetivoId
    };
  } else {
    // Default: Current or Future only for non-history view
    // OR current year only if no date filter is applied.
    // The user complained professors see "old" plannings.
    // Let's default to today onwards if no year/cycle is selected.
    where.data = { gte: today };
  }

  if (session.role === 'PROFESSOR') {
    const prof = await prisma.professor.findUnique({
      where: { usuarioId: session.id },
      select: { id: true }
    });
    where.professorId = prof?.id;
  }

  return await prisma.planejamento.findMany({
    where,
    include: {
      turma: true,
      disciplinas: true,
      professor: { select: { usuario: { select: { nome: true } } } }
    },
    orderBy: { data: 'asc' }
  });
}

export async function getClassesAndSubjects() {
  const escolaId = await getCurrentEscolaId();
  const session = await getUserSession();

  const [anosLetivos, cicloLetivos] = await Promise.all([
    prisma.anoLetivo.findMany({
      where: { escolaId },
      orderBy: { ano: 'desc' }
    }),
    prisma.cicloLetivo.findMany({
      where: { escolaId },
      orderBy: { dataInicio: 'desc' }
    })
  ]);

  if (session.role === 'PROFESSOR') {
    const prof = await prisma.professor.findUnique({
      where: { usuarioId: session.id },
      include: {
        turmasDisciplina: {
          include: {
            turma: { select: { id: true, nome: true, anoLetivoId: true } },
            disciplina: { select: { id: true, nome: true } }
          }
        }
      }
    });

    const turmas = Array.from(new Map(prof?.turmasDisciplina.map(td => [td.turma.id, {
      ...td.turma,
      disciplinas: prof.turmasDisciplina
        .filter(innerTd => innerTd.turma.id === td.turma.id)
        .map(innerTd => innerTd.disciplina)
    }])).values());

    const disciplinas = Array.from(new Map(prof?.turmasDisciplina.map(td => [td.disciplina.id, td.disciplina])).values());

    return { turmas, disciplinas, anosLetivos, cicloLetivos };
  }

  const [turmasRaw, disciplinas] = await Promise.all([
    prisma.turma.findMany({
      where: { escolaId },
      include: {
        disciplinas: {
          include: {
            disciplina: { select: { id: true, nome: true } }
          }
        }
      }
    }),
    prisma.disciplina.findMany({
      where: { escolaId },
      select: { id: true, nome: true }
    })
  ]);

  const turmas = turmasRaw.map(t => ({
    id: t.id,
    nome: t.nome,
    disciplinas: t.disciplinas.map(td => td.disciplina)
  }));

  return { turmas, disciplinas, anosLetivos, cicloLetivos };
}
