"use server";

import { revalidatePath } from "next/cache";
import { checkAdminPermissionReturnAction, getCurrentEscolaId } from "~/config/permission-manager";
import prisma from "~/lib/prisma";
import { type ActionResponse, Action } from "~/services/form/ActionResponse.types";

export async function createPerguntaAction(
    prevState: ActionResponse,
    formData: FormData
): Promise<ActionResponse> {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;
    const escolaId = await getCurrentEscolaId();

    const perguntaTexto = formData.get('pergunta') as string;
    const tipo = formData.get('tipo') as string;

    if (!perguntaTexto) {
        return Action.error("O enunciado da pergunta é obrigatório.");
    }

    try {
        await prisma.questionarioPergunta.create({
            data: {
                pergunta: perguntaTexto,
                tipo: tipo || "TEXTO",
                escolaId: escolaId,
                ativa: true
            },
        });

        revalidatePath('/dashboard/settings');
        return Action.success("Pergunta criada com sucesso!");

    } catch (error) {
        console.error("Erro ao criar pergunta:", error);
        return Action.error("Erro interno ao salvar a pergunta.");
    }
}

export async function updatePerguntaAction(
    prevState: ActionResponse,
    formData: FormData
): Promise<ActionResponse> {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;
    const escolaId = await getCurrentEscolaId();

    const perguntaId = formData.get('perguntaId') as string;
    const perguntaTexto = formData.get('pergunta') as string;
    const tipo = formData.get('tipo') as string;

    if (!perguntaId || !perguntaTexto) {
        return Action.error("Dados incompletos para atualização.");
    }

    try {
        await prisma.questionarioPergunta.update({
            where: {
                id: perguntaId,
                escolaId: escolaId
            },
            data: {
                pergunta: perguntaTexto,
                tipo: tipo,
            },
        });

        revalidatePath('/dashboard/settings');
        return Action.success("Pergunta atualizada com sucesso!");

    } catch (error) {
        console.error("Erro ao atualizar pergunta:", error);
        return Action.error("Erro ao atualizar. Verifique os dados.");
    }
}


export async function deletePerguntaAction(id: string): Promise<ActionResponse> {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;
    const escolaId = await getCurrentEscolaId();

    try {
        await prisma.questionarioPergunta.delete({
            where: { id, escolaId }
        });

        revalidatePath('/dashboard/settings');
        return Action.success("Pergunta removida com sucesso.");
    } catch (error) {
        return Action.error("Não foi possível excluir a pergunta.");
    }
}