"use server";

import { revalidatePath } from 'next/cache';
import { checkAdminPermissionReturnAction, getCurrentEscolaId } from '~/config/permission-manager';
import prisma from '~/lib/prisma';
import { type ActionResponse, Action } from "~/services/form/ActionResponse.types";

export async function createAnoLetivoAction(
    prevState: ActionResponse,
    formData: FormData
): Promise<ActionResponse> {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;

    const escolaId = await getCurrentEscolaId();

    const anoString = formData.get('ano') as string;
    const isCurrent = formData.get('isCurrent') === 'on';

    const ano = parseInt(anoString);
    if (isNaN(ano) || ano < 2000) {
        return Action.error("Ano Letivo inválido.");
    }

    try {
        if (isCurrent) {
            await prisma.anoLetivo.updateMany({
                where: { escolaId: escolaId, anoAtual: true },
                data: { anoAtual: false },
            });
        }

        const newAnoLetivo = await prisma.anoLetivo.create({
            data: {
                ano: ano,
                anoAtual: isCurrent,
                escolaId: escolaId,
            },
        });

        revalidatePath('/dashboard/settings');

        return Action.success(`Ano Letivo ${newAnoLetivo.ano} criado com sucesso.`);

    } catch (error) {
        console.error("Erro ao criar Ano Letivo:", error);
        return Action.error("Erro ao criar Ano Letivo. Verifique se o ano já existe.");
    }
}

export async function setAnoLetivoAtualAction(
    _: any,
    formData: FormData
) {
    try {
        const authError = await checkAdminPermissionReturnAction();
        if (authError) return authError;

        const escolaId = await getCurrentEscolaId();

        const anoLetivoId = formData.get("anoLetivoId") as string;

        await prisma.anoLetivo.updateMany({
            where: { escolaId, anoAtual: true },
            data: { anoAtual: false },
        });

        await prisma.anoLetivo.update({
            where: { id: anoLetivoId },
            data: { anoAtual: true },
        });

        revalidatePath("/dashboard/settings");

        return Action.success("Ano letivo definido como atual.");
    } catch {
        return Action.error("Erro ao definir ano atual.");
    }
}

export async function updateAnoLetivoAction(
    _: any,
    formData: FormData
) {
    try {
        const authError = await checkAdminPermissionReturnAction();
        if (authError) return authError;

        const id = formData.get("anoLetivoId") as string;
        const ano = Number(formData.get("ano"));

        await prisma.anoLetivo.update({
            where: { id },
            data: { ano },
        });

        revalidatePath("/dashboard/settings");

        return Action.success("Ano letivo atualizado.");
    } catch {
        return Action.error("Erro ao atualizar ano letivo.");
    }
}


export async function deleteAnoLetivoAction(id: string) {
    try {
        const authError = await checkAdminPermissionReturnAction();
        if (authError) return authError;

        const ano = await prisma.anoLetivo.findUnique({
            where: { id },
            include: { turmas: true },
        });

        if (!ano) {
            return Action.error("Ano letivo não encontrado.");
        }

        if (ano.anoAtual) {
            return Action.error("Não é possível excluir o ano atual.");
        }

        if (ano.turmas.length > 0) {
            return Action.error("Ano letivo possui turmas vinculadas.");
        }

        await prisma.anoLetivo.delete({ where: { id } });

        revalidatePath("/dashboard/settings");

        return Action.success("Ano letivo excluído.");
    } catch {
        return Action.error("Erro ao excluir ano letivo.");
    }
}
