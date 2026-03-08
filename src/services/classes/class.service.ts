'use server';

import prisma from '~/lib/prisma';
import { getCurrentEscolaId } from '~/config/permission-manager'
import type { ClassDetailed, SerieSimple, AnoLetivoSimple, CreateClassData } from "./class.service.types";
import { StatusMatricula } from '@prisma/client';

export type UpdateClassData = CreateClassData & { id: string };

export async function createClass(data: CreateClassData) {
  const escolaId = await getCurrentEscolaId();


  const novaTurma = await prisma.turma.create({
    data: {
      nome: data.nome,
      codigo: data.codigo ?? "",
      escolaId: escolaId,
      serieId: data.serieId,
      anoLetivoId: data.anoLetivoId,
    }
  });

  if (data.disciplinasIds.length > 0) {
    const turmaDisciplinasData = data.disciplinasIds.map(disciplinaId => ({
      turmaId: novaTurma.id,
      disciplinaId: disciplinaId,
    }));

    await prisma.turmaDisciplina.createMany({
      data: turmaDisciplinasData,
      skipDuplicates: true,
    });
  }
  return novaTurma;
}

export async function updateClass(data: UpdateClassData) {
  const { id, nome, codigo, serieId, anoLetivoId, disciplinasIds } = data;

  return await prisma.$transaction(async (tx) => {

    const updatedTurma = await tx.turma.update({
      where: { id },
      data: {
        nome: nome,
        codigo: codigo ?? "",
        serieId: serieId,
        anoLetivoId: anoLetivoId,
      }
    });

    const currentDisciplinas = await tx.turmaDisciplina.findMany({
      where: { turmaId: id },
      select: { disciplinaId: true }
    });
    const currentDisciplinaIds = currentDisciplinas.map(td => td.disciplinaId);

    const disciplinasToRemove = currentDisciplinaIds.filter(
      (disciplinaId) => !disciplinasIds.includes(disciplinaId)
    );

    const disciplinasToAdd = disciplinasIds.filter(
      (disciplinaId) => !currentDisciplinaIds.includes(disciplinaId)
    );

    if (disciplinasToRemove.length > 0) {
      await tx.turmaDisciplina.deleteMany({
        where: {
          turmaId: id,
          disciplinaId: { in: disciplinasToRemove }
        }
      });
    }

    if (disciplinasToAdd.length > 0) {
      const newTurmaDisciplinasData = disciplinasToAdd.map(disciplinaId => ({
        turmaId: id,
        disciplinaId: disciplinaId,
      }));

      await tx.turmaDisciplina.createMany({
        data: newTurmaDisciplinasData,
        skipDuplicates: true,
      });
    }

    return updatedTurma;
  });
}

export async function deleteClass(turmaId: string) {
  const deletedTurma = await prisma.turma.delete({
    where: { id: turmaId },
  });

  return deletedTurma;
}

export async function getClassesByEscola() {
  const escolaId = await getCurrentEscolaId();

  const turmas = await prisma.turma.findMany({
    where: { escolaId },
    include: {
      serie: {
        select: { id: true, nome: true }
      },
      anoLetivo: {
        select: { id: true, ano: true }
      },
      disciplinas: {
        select: {
          id: true,
          disciplina: {
            select: { id: true, nome: true }
          },
          professor: {
            select: {
              id: true,
              usuario: { select: { nome: true } }
            }
          }
        }
      },
    },
    orderBy: [
      { anoLetivo: { ano: 'desc' } },
      { serie: { nome: 'asc' } },
      { nome: 'asc' }
    ]
  });

  const turmaIds = turmas.map(t => t.id);

  const matriculaCounts = await prisma.matricula.groupBy({
    by: ['turmaId'],
    where: {
      turmaId: { in: turmaIds },
      status: StatusMatricula.ATIVA,
    },
    _count: {
      id: true,
    },
  });

  const countMap = new Map(matriculaCounts.map(item => [item.turmaId, item._count.id]));

  return turmas.map(turma => ({
    id: turma.id,
    nome: turma.nome,
    codigo: turma.codigo,
    serie: turma.serie,
    anoLetivo: turma.anoLetivo,

    turmaDisciplinas: turma.disciplinas.map(td => ({
      id: td.id,
      disciplina: td.disciplina,
      professor: td.professor ? {
        id: td.professor.id,
        usuario: td.professor.usuario
      } : null,
    })),

    alunosCount: countMap.get(turma.id) || 0,
  })) as ClassDetailed[];
}

export async function getClassesYearByEscola() {
  const escolaId = await getCurrentEscolaId();

  const turmas = await prisma.turma.findMany({
    where: {
      escolaId,
      anoLetivo: {
        anoAtual: true
      }
    },
    include: {
      serie: {
        select: { id: true, nome: true }
      },
      anoLetivo: {
        select: { id: true, ano: true }
      },
      disciplinas: {
        select: {
          id: true,
          disciplina: {
            select: { id: true, nome: true }
          },
          professor: {
            select: {
              id: true,
              usuario: { select: { nome: true } }
            }
          }
        }
      },
    },
    orderBy: [
      { anoLetivo: { ano: 'desc' } },
      { serie: { nome: 'asc' } },
      { nome: 'asc' }
    ]
  });

  const turmaIds = turmas.map(t => t.id);

  const matriculaCounts = await prisma.matricula.groupBy({
    by: ['turmaId'],
    where: {
      turmaId: { in: turmaIds },
      status: StatusMatricula.ATIVA,
    },
    _count: {
      id: true,
    },
  });

  const countMap = new Map(matriculaCounts.map(item => [item.turmaId, item._count.id]));

  return turmas.map(turma => ({
    id: turma.id,
    nome: turma.nome,
    codigo: turma.codigo,
    serie: turma.serie,
    anoLetivo: turma.anoLetivo,

    turmaDisciplinas: turma.disciplinas.map(td => ({
      id: td.id,
      disciplina: td.disciplina,
      professor: td.professor ? {
        id: td.professor.id,
        usuario: td.professor.usuario
      } : null,
    })),

    alunosCount: countMap.get(turma.id) || 0,
  })) as ClassDetailed[];
}

export async function getSeriesAndAnoLetivos(): Promise<{ series: SerieSimple[], anosLetivos: AnoLetivoSimple[] }> {
  try {
    const escolaId = await getCurrentEscolaId();

    const [series, anosLetivos] = await prisma.$transaction([

      prisma.serie.findMany({
        where: { escolaId },
        select: { id: true, nome: true },
        orderBy: { nome: 'asc' }
      }),

      prisma.anoLetivo.findMany({
        where: { escolaId },
        select: { id: true, ano: true, anoAtual: true },
        orderBy: { ano: 'desc' }
      }),
    ]);
    return {
      series: series,
      anosLetivos: anosLetivos
    };

  } catch (error) {
    console.error("Erro ao buscar Séries e Anos Letivos:", error);
    return {
      series: [],
      anosLetivos: []
    };
  }
}
