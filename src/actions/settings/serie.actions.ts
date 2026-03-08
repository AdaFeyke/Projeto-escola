"use server";

import { revalidatePath } from 'next/cache';
import { checkAdminPermissionReturnAction, getCurrentEscolaId } from '~/config/permission-manager';
import prisma from '~/lib/prisma';
import { type ActionResponse, Action } from "~/services/form/ActionResponse.types";

export async function createSerieAction(
    prevState: ActionResponse,
    formData: FormData
): Promise<ActionResponse> {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;
    const escolaId = await getCurrentEscolaId();

    const nome = formData.get('nome') as string;

    if (!nome) {
        return Action.error("O nome da Série é obrigatório.");
    }

    try {
        const newSerie = await prisma.serie.create({
            data: {
                nome: nome,
                escolaId: escolaId,
            },
        });

        revalidatePath('/dashboard/settings');

        return Action.success(`Série "${newSerie.nome}" criada com sucesso.`);

    } catch (error) {
        console.error("Erro ao criar série:", error);
        return Action.error("Erro ao criar série. Verifique se o nome já existe.");
    }
}

export async function updateSerieAction(
    prevState: ActionResponse,
    formData: FormData
): Promise<ActionResponse> {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;
    const escolaId = await getCurrentEscolaId();

    const serieId = formData.get('serieId') as string;
    const nome = formData.get('nome') as string;

    if (!serieId || !nome) {
        return Action.error("Dados incompletos para atualização.");
    }

    try {
        const updatedSerie = await prisma.serie.update({
            where: { id: serieId, escolaId: escolaId },
            data: { nome: nome },
        });

        revalidatePath('/dashboard/settings');

        return Action.success(`Série "${updatedSerie.nome}" atualizada com sucesso.`);

    } catch (error) {
        console.error("Erro ao atualizar série:", error);
        return Action.error("Erro ao atualizar série. Verifique o nome.");
    }
}

export async function deleteSerieAction(serieId: string): Promise<ActionResponse> {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;
    const escolaId = await getCurrentEscolaId();

    if (!serieId) {
        return Action.error("ID da Série não fornecido.");
    }

    try {
        const turmasAssociadas = await prisma.turma.count({
            where: { serieId: serieId, escolaId: escolaId }
        });

        if (turmasAssociadas > 0) {
            return Action.error(`Não foi possível deletar. ${turmasAssociadas} turmas ainda estão associadas a esta série.`);
        }

        await prisma.serie.delete({
            where: { id: serieId, escolaId: escolaId },
        });

        revalidatePath('/dashboard/settings');

        return Action.success("Série excluída com sucesso.");

    } catch (error) {
        console.error("Erro ao deletar série:", error);
        return Action.error("Erro ao excluir série. Tente novamente.");
    }
}
