"use server";

import prisma from '~/lib/prisma';
import { revalidatePath } from "next/cache";
import { checkAdminPermissionReturnAction, getCurrentEscolaId } from '~/config/permission-manager';
import { type ActionResponse, Action } from '~/services/form/ActionResponse.types';

export async function enrollStudent(prevState: ActionResponse, formData: FormData) {
  const authError = await checkAdminPermissionReturnAction();
  if (authError) return authError;
  const escolaId = await getCurrentEscolaId();

  const userIdDoAluno = formData.get("alunoId") as string;
  const turmaId = formData.get("turmaId") as string;

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const vínculoEscola = await tx.userEscola.findUnique({
        where: {
          userId_escolaId: {
            userId: userIdDoAluno,
            escolaId: escolaId
          }
        },
        include: {
          user: {
            include: { aluno: true }
          }
        }
      });

      if (!vínculoEscola?.user.aluno) {
        throw new Error("O aluno não possui vínculo ativo nesta escola.");
      }

      const alunoIdInterno = vínculoEscola.user.aluno.id;

      const turmaAlvo = await tx.turma.findFirst({
        where: {
          id: turmaId,
          escolaId: escolaId 
        },
        select: {
          id: true,
          codigo: true,
          anoLetivoId: true, 
          anoLetivo: { select: { ano: true } }
        }
      });

      if (!turmaAlvo) {
        throw new Error("Turma inválida ou não encontrada para esta unidade.");
      }

      const matriculaNoMesmoAno = await tx.matricula.findFirst({
        where: {
          alunoId: alunoIdInterno,
          turma: {
            anoLetivoId: turmaAlvo.anoLetivoId 
          },
          status: { in: ["ATIVA", "TRANCADA"] } 
        },
        include: {
          turma: { select: { nome: true } }
        }
      });

      if (matriculaNoMesmoAno) {
        throw new Error(
          `O aluno já possui uma matrícula na turma ${matriculaNoMesmoAno.turma?.nome} para o ano ${turmaAlvo.anoLetivo.ano}.`
        );
      }

      const ultima = await tx.matricula.findFirst({
        where: { turmaId },
        orderBy: { sequencial: "desc" }
      });

      const sequencial = (ultima?.sequencial ?? 0) + 1;

      const numeroMatricula = `${turmaAlvo.codigo}${sequencial
        .toString()
        .padStart(4, "0")}`;

      return await tx.matricula.create({
        data: {
          numero: numeroMatricula,
          sequencial,
          alunoId: alunoIdInterno,
          turmaId: turmaId,
          status: "ATIVA"
        }
      });
    });

    revalidatePath("/matriculas");

    return Action.success("Matrícula realizada com sucesso!", resultado);

  } catch (error: any) {
    return Action.error(error?.message ?? "Erro ao processar matrícula.");
  }
}