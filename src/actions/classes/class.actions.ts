"use server";

import prisma from '~/lib/prisma';
import { checkAdminPermissionReturnAction, getCurrentEscolaId } from '~/config/permission-manager'

import { revalidatePath } from "next/cache";
import * as ClassService from "~/services/classes/class.service";
import { type ActionResponse, Action } from "~/services/form/ActionResponse.types";

interface DisciplinaPayloadItem {
    disciplinaId: string;
    professorId: string | null | 'nao_alocado';
}

function validateClassFields(formData: FormData): { isValid: true } | { isValid: false, message: string } {
    const nome = formData.get('nome');
    const serieId = formData.get('serieId');
    const anoLetivoId = formData.get('anoLetivoId');

    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
        return { isValid: false, message: "O nome da turma é obrigatório." };
    }
    if (!serieId) {
        return { isValid: false, message: "A Série é obrigatória." };
    }
    if (!anoLetivoId) {
        return { isValid: false, message: "O Ano Letivo é obrigatório." };
    }

    return { isValid: true };
}

export async function createClassAction(
    prevState: ActionResponse | undefined,
    formData: FormData
): Promise<ActionResponse> {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;

    const validation = validateClassFields(formData);
    if (!validation.isValid) {
        return { success: false, message: validation.message };
    }

    const escolaId = await getCurrentEscolaId();

    const nome = formData.get('nome') as string;
    const serieId = formData.get('serieId') as string;
    const anoLetivoId = formData.get('anoLetivoId') as string;
    const disciplinasJson = formData.get('disciplinasPayload') as string;
    let disciplinasPayload: DisciplinaPayloadItem[];

    try {
        disciplinasPayload = JSON.parse(disciplinasJson);
    } catch (e) {
        console.error("[PAYLOAD_PARSE_ERROR]", e);
        return Action.error("Erro de dados: Formato da lista de disciplinas inválido.");
    }

    const dataParaTurmaDisciplinas = disciplinasPayload
        .filter(item => item.disciplinaId)
        .map(item => ({
            disciplinaId: item.disciplinaId,
            professorId: (item.professorId === 'nao_alocado' || !item.professorId)
                ? null
                : item.professorId,
        }));

    try {
        const anoLetivo = await prisma.anoLetivo.findUnique({
            where: { id: anoLetivoId, escolaId },
            select: { ano: true },
        });

        if (!anoLetivo) {
            return Action.error("Ano letivo inválido.");
        }

        const serie = await prisma.serie.findUnique({
            where: { id: serieId, escolaId },
            select: { nome: true },
        });

        if (!serie) {
            return Action.error("Série inválida.");
        }

        const siglaSerie = gerarSiglaSerie(serie.nome);

        const totalTurmas = await prisma.turma.count({
            where: {
                escolaId,
                anoLetivoId,
                serieId,
            },
        });

        const sufixo = String.fromCharCode(65 + totalTurmas);

        const codigo = `${anoLetivo.ano}-${siglaSerie}${sufixo}`;

        const newTurma = await prisma.turma.create({
            data: {
                nome,
                codigo,
                serieId,
                anoLetivoId,
                escolaId: escolaId,
                disciplinas: {
                    create: dataParaTurmaDisciplinas,
                },
            },
        });

        revalidatePath("/dashboard/classes");
        return Action.success(`Turma "${newTurma.nome}" criada com sucesso, com ${dataParaTurmaDisciplinas.length} disciplinas alocadas.`);

    } catch (error: any) {
        console.error("[CREATE_CLASS_ERROR]", error);
        if (error.code === 'P2002') {
            return Action.error("Já existe uma turma com a mesma estrutura (Nome, Série e Ano Letivo) neste ano.");
        }

        return Action.error(error.message || "Falha desconhecida ao criar a turma. Tente novamente.");
    }
}

export async function updateClassAction(
    prevState: ActionResponse | undefined,
    formData: FormData
): Promise<ActionResponse> {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;

    const turmaId = formData.get('classId') as string;
    if (!turmaId) {
        return Action.error("ID da Turma não fornecido para atualização.");
    }

    const validation = validateClassFields(formData);
    if (!validation.isValid) {
        return Action.error(validation.message);
    }

    const escolaId = await getCurrentEscolaId();
    const nome = formData.get('nome') as string;
    const serieId = formData.get('serieId') as string;
    const anoLetivoId = formData.get('anoLetivoId') as string;
    const disciplinasJson = formData.get('disciplinasPayload') as string;
    let disciplinasPayload: DisciplinaPayloadItem[];

    try {
        disciplinasPayload = JSON.parse(disciplinasJson);
    } catch (e) {
        console.error("[PAYLOAD_PARSE_ERROR]", e);
        return Action.error("Erro de dados: Formato da lista de disciplinas inválido.");
    }

    const dataParaTurmaDisciplinas = disciplinasPayload
        .filter(item => item.disciplinaId)
        .map(item => ({
            disciplinaId: item.disciplinaId,
            professorId: (item.professorId === 'nao_alocado' || !item.professorId)
                ? null
                : item.professorId,
        }));

    try {
        await prisma.$transaction(async (tx) => {
            const existingTurmaWithSameName = await tx.turma.findFirst({
                where: {
                    id: { not: turmaId },
                    nome: nome,
                    serieId: serieId,
                    anoLetivoId: anoLetivoId,
                    escolaId: escolaId,
                }
            });

            if (existingTurmaWithSameName) {
                throw new Error("P2002_CUSTOM_UNIQUE_VIOLATION");
            }

            await tx.turmaDisciplina.deleteMany({
                where: { turmaId: turmaId, disciplina: { escolaId: escolaId } },
            });

            if (dataParaTurmaDisciplinas.length > 0) {
                const newTurmaDisciplinaRecords = dataParaTurmaDisciplinas.map(item => ({
                    ...item,
                    turmaId: turmaId,
                }));

                await tx.turmaDisciplina.createMany({
                    data: newTurmaDisciplinaRecords,
                });
            }

            await tx.turma.update({
                where: { id: turmaId, escolaId: escolaId },
                data: {
                    nome: nome,
                    serieId: serieId,
                    anoLetivoId: anoLetivoId,
                },
            });
        });

        revalidatePath("/dashboard/classes");
        return Action.success(`Turma "${nome}" atualizada com sucesso, com ${dataParaTurmaDisciplinas.length} disciplinas alocadas.`);

    } catch (error: any) {
        console.error("[UPDATE_CLASS_ERROR]", error);
        if (error.code === 'P2002' || error.message === "P2002_CUSTOM_UNIQUE_VIOLATION") {
            return Action.error("Já existe outra turma com a mesma estrutura (Nome, Série e Ano Letivo) neste ano.");
        }

        return Action.error(error.message || "Falha desconhecida ao atualizar a turma. Tente novamente.");
    }
}

export async function deleteClassAction(formData: FormData): Promise<ActionResponse> {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;
    
    const turmaId = formData.get('classId') as string;

    if (!turmaId) {
        return Action.error("ID da Turma ausente para exclusão.");
    }

    try {
        await ClassService.deleteClass(turmaId);

        revalidatePath("/dashboard/classes");
        return Action.success("Turma excluída com sucesso.");

    } catch (error: any) {
        console.error("[DELETE_CLASS_ERROR]", error);

        if (error.code === 'P2003') {
            return Action.error("Não foi possível excluir. Há alunos matriculados ativos ou dados históricos (notas/frequências) vinculados a esta turma.");
        }

        return Action.error("Falha ao excluir a turma. Verifique as dependências.");
    }
}

function gerarSiglaSerie(nome: string) {
    return nome
        .toUpperCase()
        .replace(/º|ª/g, "")
        .replace("ANO", "")
        .replace(/\s+/g, "")
        .replace("ENSINOMEDIO", "EM")
        .replace("ENSINOFUNDAMENTAL", "EF")
        .replace("GRUPO", "G")
        .trim();
}
