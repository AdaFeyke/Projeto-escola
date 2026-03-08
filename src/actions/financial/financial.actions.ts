"use server";

import prisma from "~/lib/prisma";
import { revalidatePath } from "next/cache";
import { Action } from "~/services/form/ActionResponse.types";
import { type ActionResponse } from "~/services/form/ActionResponse.types";
import { getUserSession, getCurrentEscolaId } from "~/config/permission-manager";

export async function markAsPaidAction(
    pendenciaId: string,
    metodo: "DINHEIRO" | "PIX" | "BOLETO" | "CARTAO" | "TRANSFERENCIA" = "DINHEIRO"
): Promise<ActionResponse> {
    try {
        const user = await getUserSession();
        if (user.role !== "ADMINISTRADOR") {
            return Action.error("Apenas administradores podem dar baixa manual.");
        }

        const pendencia = await prisma.pendencia.findUnique({
            where: { id: pendenciaId },
        });

        if (!pendencia) {
            return Action.error("Pendência não encontrada.");
        }

        if (pendencia.status === "PAGO") {
            return Action.error("Esta pendência já está paga.");
        }

        await prisma.$transaction(async (tx) => {
            await tx.pagamento.create({
                data: {
                    escolaId: pendencia.escolaId,
                    pendenciaId: pendencia.id,
                    valorPago: pendencia.valor,
                    metodo: metodo,
                    dataPagamento: new Date(),
                },
            });

            await tx.pendencia.update({
                where: { id: pendenciaId },
                data: { status: "PAGO" },
            });
            const participante = await tx.participanteEvento.findUnique({
                where: { pendenciaId: pendencia.id }
            });

            if (participante) {
                await tx.participanteEvento.update({
                    where: { id: participante.id },
                    data: { confirmado: true }
                });
            }
        });

        revalidatePath("/dashboard/financial");
        return Action.success("Pagamento registrado com sucesso!");
    } catch (error) {
        console.error("Erro ao dar baixa:", error);
        return Action.error("Erro ao registrar pagamento.");
    }
}

export async function updateFinancialStatusAction(
    pendenciaId: string,
    newStatus: "PENDENTE" | "PAGO" | "ATRASADO" | "CANCELADO"
): Promise<ActionResponse> {
    try {
        const user = await getUserSession();
        if (user.role !== "ADMINISTRADOR") return Action.error("Não autorizado.");

        const pendencia = await prisma.pendencia.findUnique({
            where: { id: pendenciaId },
            include: { pagamento: true }
        });

        if (!pendencia) return Action.error("Pendência não encontrada.");

        await prisma.$transaction(async (tx) => {
            // Se o novo status não for PAGO, mas existir pagamento, remove o pagamento
            if (newStatus !== "PAGO" && pendencia.pagamento) {
                await tx.pagamento.delete({
                    where: { id: pendencia.pagamento.id }
                });
            }

            // Atualiza o status
            await tx.pendencia.update({
                where: { id: pendenciaId },
                data: { status: newStatus }
            });

            // Se for evento, atualiza confirmação
            const participante = await tx.participanteEvento.findUnique({
                where: { pendenciaId: pendencia.id }
            });

            if (participante) {
                await tx.participanteEvento.update({
                    where: { id: participante.id },
                    data: { confirmado: newStatus === "PAGO" }
                });
            }
        });

        revalidatePath("/dashboard/financial");
        return Action.success("Status atualizado com sucesso.");
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        return Action.error("Erro ao atualizar status.");
    }
}

export async function deleteFinancialRecordAction(pendenciaId: string): Promise<ActionResponse> {
    try {
        const user = await getUserSession();
        if (user.role !== "ADMINISTRADOR") return Action.error("Não autorizado.");

        const pendencia = await prisma.pendencia.findUnique({
            where: { id: pendenciaId },
            include: { pagamento: true }
        });

        if (!pendencia) return Action.error("Pendência não encontrada.");

        await prisma.$transaction(async (tx) => {
            if (pendencia.pagamento) {
                await tx.pagamento.delete({ where: { id: pendencia.pagamento.id } });
            }
            await tx.pendencia.delete({ where: { id: pendenciaId } });
        });

        revalidatePath("/dashboard/financial");
        return Action.success("Registro excluído com sucesso.");
    } catch (error) {
        console.error("Erro ao excluir registro:", error);
        return Action.error("Erro ao excluir registro.");
    }
}

export async function createExtraChargeAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    try {
        const user = await getUserSession();
        if (user.role !== "ADMINISTRADOR") return Action.error("Não autorizado.");

        const escolaId = await getCurrentEscolaId();

        const alunoId = formData.get("alunoId") as string;
        const descricao = formData.get("descricao") as string;
        const valor = Number(formData.get("valor"));
        const dataVencimentoStr = formData.get("dataVencimento") as string;
        const tipo = formData.get("tipo") as "EXTRA" | "OUTROS" || "EXTRA";

        if (!alunoId || !descricao || !valor || !dataVencimentoStr) {
            return Action.error("Preencha todos os campos obrigatórios.");
        }

        await prisma.pendencia.create({
            data: {
                escolaId,
                alunoId,
                descricao,
                valor,
                dataVencimento: new Date(dataVencimentoStr),
                tipo,
                status: "PENDENTE",
            }
        });

        revalidatePath("/dashboard/financial");
        revalidatePath("/dashboard/financial/extra-expenses");
        return Action.success("Cobrança extra registrada com sucesso!");
    } catch (error) {
        console.error("Erro ao criar cobrança extra:", error);
        return Action.error("Erro ao registrar cobrança extra.");
    }
}

export async function updateExtraChargeAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    try {
        const user = await getUserSession();
        if (user.role !== "ADMINISTRADOR") return Action.error("Não autorizado.");

        const chargeId = formData.get("id") as string;
        const descricao = formData.get("descricao") as string;
        const valor = Number(formData.get("valor"));
        const dataVencimentoStr = formData.get("dataVencimento") as string;
        const tipo = formData.get("tipo") as "EXTRA" | "OUTROS";

        if (!chargeId || !descricao || !valor || !dataVencimentoStr) {
            return Action.error("Preencha todos os campos obrigatórios.");
        }

        await prisma.pendencia.update({
            where: { id: chargeId },
            data: {
                descricao,
                valor,
                dataVencimento: new Date(dataVencimentoStr),
                tipo,
            }
        });

        revalidatePath("/dashboard/financial/extra-expenses");
        return Action.success("Cobrança extra atualizada com sucesso!");
    } catch (error) {
        console.error("Erro ao atualizar cobrança extra:", error);
        return Action.error("Erro ao atualizar cobrança extra.");
    }
}
