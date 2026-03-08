"use server";

import prisma from "~/lib/prisma";
import { revalidatePath } from "next/cache";
import { StatusFrequencia } from "@prisma/client"; 
import { checkAdminPermissionReturnAction } from "~/config/permission-manager";

export async function salvarChamadaAction(
  turmaDisciplinaId: string,
  dados: Record<string, StatusFrequencia>
) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  try {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;

    const operacoes = Object.entries(dados).map(([alunoId, status]) => {
      return prisma.frequencia.upsert({
        where: {
          alunoId_turmaDisciplinaId_data: {
            alunoId,
            turmaDisciplinaId,
            data: hoje,
          },
        },
        update: {
          status: status, 
          observacao: status === "ATRASO" ? "Atraso registrado via sistema" : null,
        },
        create: {
          alunoId,
          turmaDisciplinaId,
          data: hoje,
          status: status,
          observacao: status === "ATRASO" ? "Atraso registrado via sistema" : null,
        },
      });
    });

    await prisma.$transaction(operacoes);
    
    revalidatePath(`/dashboard/professor/class/[id]`, "page");
    
    return { success: true, message: "Presença registrada com sucesso." };
  } catch (error) {
    console.error("Erro ao salvar frequência:", error);
    return { success: false, message: "Falha ao registrar presença no banco de dados." };
  }
}