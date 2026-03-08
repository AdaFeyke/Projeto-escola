"use server";

import { revalidatePath } from "next/cache";
import prisma from "~/lib/prisma";
import { checkAdminPermissionReturnAction, getCurrentEscolaId } from "~/config/permission-manager";
import { type ActionResponse, Action } from "~/services/form/ActionResponse.types";

export async function createCicloAction(
    prevState: ActionResponse,
    formData: FormData
): Promise<ActionResponse> {
    try {
        const authError = await checkAdminPermissionReturnAction();
        if (authError) return authError;
        const escolaId = await getCurrentEscolaId();

        const values = {
            nome: formData.get('nome') as string,
            dataInicio: formData.get('dataInicio') as string,
            dataFim: formData.get('dataFim') as string,
            anoLetivoId: formData.get('anoLetivoId') as string,
        };

        if (!values.nome || !values.dataInicio || !values.dataFim || !values.anoLetivoId) {
            return Action.error("Todos os campos são obrigatórios.");
        }

        const dataInicio = new Date(`${values.dataInicio}T12:00:00Z`);
        const dataFim = new Date(`${values.dataFim}T12:00:00Z`);

        if (dataFim < dataInicio) {
            return Action.error("A data de término não pode ser anterior ao início.");
        }

        await prisma.cicloLetivo.create({
            data: {
                nome: values.nome,
                dataInicio,
                dataFim,
                escolaId,
                anoLetivoId: values.anoLetivoId
            }
        });

        revalidatePath('/dashboard/settings');
        return Action.success(`O ciclo "${values.nome}" foi criado com sucesso!`);

    } catch (error) {
        console.error("ERRO_CREATE_CICLO:", error);
        return Action.error("Erro interno ao salvar o ciclo.");
    }
}

export async function updateCicloAction(
    prevState: ActionResponse,
    formData: FormData
): Promise<ActionResponse> {
    try {
        const authError = await checkAdminPermissionReturnAction();
        if (authError) return authError;
        const escolaId = await getCurrentEscolaId();    

        const id = formData.get('cicloId') as string;

        const values = {
            nome: formData.get('nome') as string,
            dataInicio: formData.get('dataInicio') as string,
            dataFim: formData.get('dataFim') as string,
            anoLetivoId: formData.get('anoLetivoId') as string,
        };

        const dataInicio = new Date(`${values.dataInicio}T12:00:00Z`);
        const dataFim = new Date(`${values.dataFim}T12:00:00Z`);

        if (!id) return Action.error("ID do ciclo não encontrado.");

        await prisma.cicloLetivo.update({
            where: { id, escolaId },
            data: {
                nome: values.nome,
                dataInicio: dataInicio,
                dataFim: dataFim,
                anoLetivoId: values.anoLetivoId
            }
        });

        revalidatePath('/dashboard/settings');
        return Action.success("Ciclo atualizado com sucesso!");
    } catch (error) {
        console.error("ERRO_UPDATE_CICLO:", error);
        return Action.error("Erro ao atualizar o ciclo.");
    }
}
export async function deleteCicloAction(cicloId: string): Promise<ActionResponse> {
    try {
        const authError = await checkAdminPermissionReturnAction();
        if (authError) return authError;

        const escolaId = await getCurrentEscolaId();

        if (!cicloId) {
            return Action.error("ID do ciclo não fornecido.");
        }

        const ciclo = await prisma.cicloLetivo.findFirst({
            where: { id: cicloId, escolaId }
        });

        if (!ciclo) {
            return Action.error("Ciclo não encontrado.");
        }

       /*const temNotas = await prisma.nota.count({ where: {  } });
       if (temNotas > 0) return Action.error("Não é possível excluir um ciclo que já possui notas lançadas.");*/

        await prisma.cicloLetivo.delete({
            where: { 
                id: cicloId,
                escolaId 
            },
        });

        revalidatePath('/dashboard/settings');

        return Action.success(`O ciclo "${ciclo.nome}" foi removido com sucesso.`);

    } catch (error) {
        console.error("ERRO_DELETE_CICLO:", error);
        
        if (error instanceof Error && error.message.includes("Foreign key constraint")) {
            return Action.error("Este ciclo não pode ser excluído pois está sendo usado em outros registros.");
        }

        return Action.error("Erro interno ao tentar excluir o ciclo.");
    }
}