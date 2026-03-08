'use server';

import { revalidatePath } from 'next/cache';
import { checkAdminPermissionReturnAction, getCurrentEscolaId } from '~/config/permission-manager';
import prisma from '~/lib/prisma';
import { Action, type ActionResponse } from "~/services/form/ActionResponse.types";

type ActionState = ActionResponse | undefined;

export async function createDisciplinaAction(
    prevState: ActionState,
    formData: FormData
): Promise<ActionResponse> {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;
    const escolaId = await getCurrentEscolaId();

    const nome = formData.get('nome') as string;
    const sigla = formData.get('sigla') as string;

    if (!nome || !sigla) {
        return Action.error("O nome e a sigla da Disciplina são obrigatórios.");
    }

    const siglaUpper = sigla.toUpperCase();

    try {
        const newDisciplina = await prisma.disciplina.create({
            data: {
                nome: nome,
                sigla: siglaUpper,
                escolaId: escolaId,
            },
        });

        revalidatePath('/dashboard/settings');

        return Action.success(`Disciplina "${newDisciplina.nome}" (${newDisciplina.sigla}) criada com sucesso.`);

    } catch (error) {
        console.error("Erro ao criar disciplina:", error);
        return Action.error("Erro ao criar disciplina. Verifique se o nome ou a sigla já existem.");
    }
}

export async function updateDisciplinaAction(
    prevState: ActionResponse | undefined,
    formData: FormData
): Promise<ActionResponse> {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;
    const escolaId = await getCurrentEscolaId();

    const disciplinaId = formData.get('disciplinaId') as string;
    const nome = formData.get('nome') as string;
    const sigla = formData.get('sigla') as string;

    if (!disciplinaId || !nome || !sigla) {
        return Action.error("Dados incompletos para atualização.");
    }

    const siglaUpper = sigla.toUpperCase();

    try {
        const updatedDisciplina = await prisma.disciplina.update({
            where: { id: disciplinaId, escolaId: escolaId },
            data: {
                nome: nome,
                sigla: siglaUpper,
            },
        });

        revalidatePath('/dashboard/settings');

        return Action.success(`Disciplina "${updatedDisciplina.nome}" atualizada com sucesso.`);

    } catch (error) {
        console.error("Erro ao atualizar disciplina:", error);
        return Action.error("Erro ao atualizar disciplina. Verifique o nome/sigla.");
    }
}

export async function deleteDisciplinaAction(disciplinaId: string) {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;
    const escolaId = await getCurrentEscolaId();

    if (!disciplinaId) {
        return Action.error("ID da Disciplina não fornecido.");
    }

    try {
        const associacoes = await prisma.turmaDisciplina.count({
            where: { disciplinaId: disciplinaId }
        });

        if (associacoes > 0) {
            return Action.error(`Não foi possível deletar. ${associacoes} turmas ou horários ainda usam esta disciplina.`);
        }

        await prisma.disciplina.delete({
            where: { id: disciplinaId, escolaId: escolaId },
        });

        revalidatePath('/dashboard/settings');

        return Action.success("Disciplina excluída com sucesso.");

    } catch (error) {
        console.error("Erro ao deletar disciplina:", error);
        return Action.error("Erro ao excluir disciplina. Tente novamente.");
    }
}
