"use server";

import { revalidatePath } from "next/cache";
import { checkAdminPermissionReturnAction, getCurrentEscolaId } from "~/config/permission-manager";
import prisma from "~/lib/prisma";
import { type ActionResponse, Action } from "~/services/form/ActionResponse.types";

export async function criarOuEditarCalendarioAction(prevState: ActionResponse, formData: FormData) {
  try {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;
    const escolaId = await getCurrentEscolaId();

    const id = formData.get("id") as string | null;
    const anoLetivoId = formData.get("anoLetivoId") as string;
    const titulo = formData.get("titulo") as string;
    const tipo = formData.get("tipo") as any;
    const bloqueiaAula = formData.get("bloqueiaAula") === "on";

    const dataInicioStr = formData.get("dataInicio") as string;
    const dataFimStr = formData.get("dataFim") as string;

    if (!dataInicioStr) throw new Error("A data de início é obrigatória.");
    const dataInicio = new Date(`${dataInicioStr}T12:00:00.000Z`);

    let dataFim: Date;
    if (dataFimStr && dataFimStr !== dataInicioStr) {
      dataFim = new Date(`${dataFimStr}T12:00:00.000Z`);
    } else {
      dataFim = new Date(`${dataInicioStr}T12:00:00.000Z`);
    }

    if (dataFim < dataInicio) {
      throw new Error("A data de término não pode ser anterior ao início.");
    }

    const payload = {
      escolaId,
      anoLetivoId,
      titulo,
      tipo,
      bloqueiaAula,
      dataInicio,
      dataFim,
    };

    if (id) {
      await prisma.calendarioEscolar.update({
        where: { id, escolaId },
        data: payload,
      });
    } else {
      await prisma.calendarioEscolar.create({
        data: payload,
      });
    }

    revalidatePath("/dashboard/calendario");

    return Action.success(id ? "Calendário atualizado com sucesso." : "Evento registrado com sucesso.");

  } catch (error: any) {
    console.error("[ACTION ERROR]:", error.message);
    return Action.error(error.message || "Falha ao processar solicitação.");
  }
}

export async function deletarCalendarioAction(id: string) {
  try {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;
    const escolaId = await getCurrentEscolaId();

    await prisma.calendarioEscolar.delete({
      where: { id, escolaId },
    });

    revalidatePath("/dashboard/calendario");

    return Action.success("Evento removido com sucesso.");
  } catch (error: any) {
    console.error("[DELETE ACTION ERROR]:", error.message);
    return Action.error(error.message || "Falha ao excluir registro.");
  }
}
