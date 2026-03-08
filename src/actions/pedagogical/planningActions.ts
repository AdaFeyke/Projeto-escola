"use server";

import { revalidatePath } from "next/cache";
import prisma from "~/lib/prisma";
import { getCurrentEscolaId, getUserSession } from "~/config/permission-manager";
import { Action, type ActionResponse } from "~/services/form/ActionResponse.types";

export async function checkDateStatusAction(dateString: string) {
    try {
        const escolaId = await getCurrentEscolaId();
        const dataBusca = new Date(dateString);

        const holiday = await prisma.calendarioEscolar.findFirst({
            where: {
                escolaId,
                dataInicio: { lte: dataBusca },
                dataFim: { gte: dataBusca },
                tipo: { in: ['NAO_LETIVO_FERIADO', 'NAO_LETIVO_RECESSO'] }
            }
        });

        const event = await prisma.evento.findFirst({
            where: {
                escolaId,
                dataEvento: dataBusca,
            }
        });

        return {
            hasHoliday: !!holiday,
            holidayName: holiday?.titulo,
            hasEvent: !!event,
            eventName: event?.nome,
            bloqueiaAula: holiday?.bloqueiaAula || false
        };
    } catch (error) {
        console.error("Erro ao verificar status da data:", error);
        return { error: true };
    }
}

export async function createPlanningAction(prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> {
    const data = Object.fromEntries(formData.entries());

    try {
        const escolaId = await getCurrentEscolaId();
        const session = await getUserSession();
        const dataPlanejamento = new Date(data.data as string);

        const calendarEvents = await prisma.calendarioEscolar.findMany({
            where: {
                escolaId,
                dataInicio: { lte: dataPlanejamento },
                dataFim: { gte: dataPlanejamento },
                tipo: { in: ['NAO_LETIVO_FERIADO', 'NAO_LETIVO_RECESSO'] }
            }
        });

        if (calendarEvents.length > 0) {
            return Action.error("Não é possível criar planejamento para esta data: Feriado ou Recesso escolar.");
        }

        const events = await prisma.evento.findMany({
            where: {
                escolaId,
                dataEvento: dataPlanejamento,
            }
        });

        if (events.length > 0) {
            return Action.error("Existe um evento escolar nesta data. Verifique a agenda.");
        }


        let professorId: string | null = null;

        if (session.role === 'PROFESSOR') {
            const prof = await prisma.professor.findUnique({
                where: { usuarioId: session.id }
            });
            professorId = prof?.id ?? null;
        } else {
            professorId = (data.professorId as string) || null;
        }

        const disciplinaIds = formData.getAll('disciplinaIds') as string[];

        await prisma.planejamento.create({
            data: {
                titulo: data.titulo as string,
                conteudo: data.conteudo as string,
                objetivos: data.objetivos as string,
                metodologia: data.metodologia as string,
                diario: data.diario as string,
                observacoes: data.observacoes as string,
                atividade: data.atividade as string,
                data: dataPlanejamento,
                turma: { connect: { id: data.turmaId as string } },
                disciplinas: { connect: disciplinaIds.map(id => ({ id })) },
                professor: professorId ? { connect: { id: professorId } } : undefined,
                escola: { connect: { id: escolaId } },
                status: 'PENDENTE'
            }
        });

        revalidatePath("/dashboard/pedagogical-planning");
        return Action.success("Planejamento criado com sucesso! Aguardando aprovação.");
    } catch (error) {
        console.error("Erro ao criar planejamento:", error);
        return Action.error("Erro ao criar planejamento.", data);
    }
}

export async function updatePlanningAction(prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> {
    const data = Object.fromEntries(formData.entries());
    const id = data.id as string;

    try {
        const disciplinaIds = formData.getAll('disciplinaIds') as string[];

        await prisma.planejamento.update({
            where: { id },
            data: {
                titulo: data.titulo as string,
                conteudo: data.conteudo as string,
                objetivos: data.objetivos as string,
                metodologia: data.metodologia as string,
                diario: data.diario as string,
                observacoes: data.observacoes as string,
                atividade: data.atividade as string,
                data: new Date(data.data as string),
                turma: { connect: { id: data.turmaId as string } },
                disciplinas: { set: disciplinaIds.map(id => ({ id })) },
                status: 'PENDENTE'
            }
        });

        revalidatePath("/dashboard/pedagogical-planning");
        return Action.success("Planejamento atualizado com sucesso!");
    } catch (error) {
        console.error("Erro ao atualizar planejamento:", error);
        return Action.error("Erro ao atualizar planejamento.", data);
    }
}

export async function deletePlanningAction(id: string) {
    try {
        await prisma.planejamento.delete({ where: { id } });
        revalidatePath("/dashboard/pedagogical-planning");
        return { success: true, message: "Planejamento excluído com sucesso!" };
    } catch (error) {
        console.error("Erro ao excluir planejamento:", error);
        return { success: false, message: "Erro ao excluir planejamento." };
    }
}

export async function approvePlanningAction(id: string, status: 'APROVADO' | 'REJEITADO' | 'PENDENTE') {
    try {
        await prisma.planejamento.update({
            where: { id },
            data: { status }
        });
        revalidatePath("/dashboard/pedagogical-planning");
        const statusMap = {
            'APROVADO': 'aprovado',
            'REJEITADO': 'rejeitado',
            'PENDENTE': 'definido como pendente'
        };
        return { success: true, message: `Planejamento ${statusMap[status]} com sucesso!` };
    } catch (error) {
        console.error("Erro ao aprovar/rejeitar planejamento:", error);
        return { success: false, message: "Erro ao processar." };
    }
}
