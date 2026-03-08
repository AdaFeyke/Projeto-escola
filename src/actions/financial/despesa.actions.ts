"use server";

import prisma from "~/lib/prisma";
import { revalidatePath } from "next/cache";
import { Action } from "~/services/form/ActionResponse.types";
import { type ActionResponse } from "~/services/form/ActionResponse.types";
import { getUserSession, getCurrentEscolaId } from "~/config/permission-manager";

export async function createDespesaAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    try {
        const user = await getUserSession();
        if (user.role !== "ADMINISTRADOR") return Action.error("Não autorizado.");

        const escolaId = await getCurrentEscolaId();

        const descricao = formData.get("descricao") as string;
        const valor = Number(formData.get("valor"));
        const categoria = formData.get("categoria") as string;
        const dataStr = formData.get("data") as string;
        const status = formData.get("status") as string || "PAGO";

        if (!descricao || !valor || !categoria) {
            return Action.error("Preencha todos os campos obrigatórios.");
        }

        await prisma.despesaEscola.create({
            data: {
                escolaId,
                descricao,
                valor,
                categoria,
                data: dataStr ? new Date(dataStr) : new Date(),
                status,
            }
        });

        revalidatePath("/dashboard/financial/extra-expenses");
        return Action.success("Despesa registrada com sucesso!");
    } catch (error) {
        console.error("Erro ao criar despesa:", error);
        return Action.error("Erro ao registrar despesa.");
    }
}

export async function updateDespesaAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    try {
        const user = await getUserSession();
        if (user.role !== "ADMINISTRADOR") return Action.error("Não autorizado.");

        const id = formData.get("id") as string;
        const descricao = formData.get("descricao") as string;
        const valor = Number(formData.get("valor"));
        const categoria = formData.get("categoria") as string;
        const dataStr = formData.get("data") as string;
        const status = formData.get("status") as string;

        await prisma.despesaEscola.update({
            where: { id },
            data: {
                descricao,
                valor,
                categoria,
                data: dataStr ? new Date(dataStr) : undefined,
                status,
            }
        });

        revalidatePath("/dashboard/financial/extra-expenses");
        return Action.success("Despesa atualizada com sucesso!");
    } catch (error) {
        console.error("Erro ao atualizar despesa:", error);
        return Action.error("Erro ao atualizar despesa.");
    }
}

export async function deleteDespesaAction(id: string): Promise<ActionResponse> {
    try {
        const user = await getUserSession();
        if (user.role !== "ADMINISTRADOR") return Action.error("Não autorizado.");

        await prisma.despesaEscola.delete({
            where: { id }
        });

        revalidatePath("/dashboard/financial/extra-expenses");
        return Action.success("Despesa excluída com sucesso!");
    } catch (error) {
        console.error("Erro ao excluir despesa:", error);
        return Action.error("Erro ao excluir despesa.");
    }
}
export async function updateDespesaStatusAction(id: string, status: string): Promise<ActionResponse> {
    try {
        const user = await getUserSession();
        if (user.role !== "ADMINISTRADOR") return Action.error("Não autorizado.");

        await prisma.despesaEscola.update({
            where: { id },
            data: { status }
        });

        revalidatePath("/dashboard/financial/extra-expenses");
        return Action.success(`Status atualizado para ${status}!`);
    } catch (error) {
        console.error("Erro ao atualizar status da despesa:", error);
        return Action.error("Erro ao atualizar status.");
    }
}
