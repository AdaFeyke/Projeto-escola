"use server";

import prisma from '~/lib/prisma';
import { revalidatePath } from "next/cache";
import { getUserSession } from "~/config/permission-manager";
import { Action } from '~/services/form/ActionResponse.types';

export async function salvarNotasAtividade(
  atividadeId: string,
  notasData: Record<string, string | number>,
  usuarioId: string
) {
  try {
    const { role } = await getUserSession();

    if (role !== 'ADMINISTRADOR' && role !== 'PROFESSOR') {
      return Action.error("Acesso negado: Você não tem permissão de administrador ou professor.");
    }

    const professor = await prisma.professor.findUnique({
      where: { usuarioId },
      select: { id: true }
    });

    if (!professor) {
      return { success: false, error: "Usuário logado não possui perfil de professor." };
    }

    const atividade = await prisma.atividadeTurma.findUnique({
      where: { id: atividadeId },
      select: {
        valorMaximo: true,
        turmaId: true,
        disciplinaId: true
      }
    });

    if (!atividade) {
      return { success: false, error: "Atividade não encontrada." };
    }

    if (!atividade.disciplinaId) {
      return { success: false, error: "Esta atividade não possui uma disciplina vinculada." };
    }

    const td = await prisma.turmaDisciplina.findFirst({
      where: {
        turmaId: atividade.turmaId,
        disciplinaId: atividade.disciplinaId
      },
      select: { id: true }
    });

    const valorLimite = atividade.valorMaximo;
    const entries = Object.entries(notasData).filter(([_, valor]) => valor !== "");

    await prisma.$transaction(async (tx) => {
      for (const [alunoId, valor] of entries) {
        const valorNumerico = parseFloat(valor.toString());

        if (valorNumerico > valorLimite) {
          throw new Error(`Nota inválida. O valor máximo permitido é ${valorLimite}.`);
        }

        const notaExistente = await tx.nota.findFirst({
          where: {
            alunoId,
            atividadeTurmaId: atividadeId,
          },
        });

        if (notaExistente) {
          await tx.nota.update({
            where: { id: notaExistente.id },
            data: {
              valor: valorNumerico,
              professorId: professor.id,
              turmaDisciplinaId: td?.id
            },
          });
        } else {
          await tx.nota.create({
            data: {
              valor: valorNumerico,
              alunoId,
              atividadeTurmaId: atividadeId,
              professorId: professor.id,
              turmaDisciplinaId: td?.id
            },
          });
        }
      }
    });

    revalidatePath("/dashboard/classes/class");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao salvar notas:", error);
    return { success: false, error: error.message || "Falha ao salvar notas." };
  }
}