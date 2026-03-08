import prisma from "~/lib/prisma";
import bcrypt from 'bcryptjs';
import type {
    TeacherDetailed,
    CreateTeacherData,
    UpdateTeacherData
} from "./teacher.service.types";
import { Prisma } from "@prisma/client";

import { getCurrentEscolaId, getUserSession } from '~/config/permission-manager'

export const TeacherService = {
    async listProfessoresByEscola(): Promise<TeacherDetailed[]> {
        const escolaId = await getCurrentEscolaId();

        const professores = await prisma.professor.findMany({
            where: {
                usuario: {
                    escolas: {
                        some: {
                            escolaId: escolaId
                        }
                    }
                }
            },
            include: {
                usuario: true,
            },
            orderBy: {
                usuario: { nome: "asc" }
            }
        });

        return professores.map(professor => ({
            ...professor,
            salarioBase: professor.salarioBase.toString(),
            usuario: professor.usuario,
        })) as TeacherDetailed[];
    },

    async createProfessor(data: CreateTeacherData): Promise<TeacherDetailed> {
        const escolaId = await getCurrentEscolaId();

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(data.senhaHash, salt);
        const numericSalario = new Prisma.Decimal(data.salarioBase);
        const startDate = new Date(data.dataInicioContrato);
        const endDate = data.dataFimContrato ? new Date(data.dataFimContrato) : null;

        const professor = await prisma.professor.create({
            data: {
                salarioBase: numericSalario,
                tipoContrato: data.tipoContrato,
                dataInicioContrato: startDate,
                dataFimContrato: endDate,
                cpf: data.cpf,

                usuario: {
                    create: {
                        nome: data.nome,
                        email: data.email,
                        senhaHash,
                        escolas: {
                            create: {
                                escolaId: escolaId,
                                papel: "PROFESSOR",
                            }
                        }
                    }
                }
            },
            include: {
                usuario: true,
            }
        });

        return {
            ...professor,
            salarioBase: professor.salarioBase.toString(),
        } as TeacherDetailed;
    },

    async updateProfessor(data: UpdateTeacherData): Promise<TeacherDetailed> {
        const { professorId, nome, email, senhaHash, ...professorFields } = data;

        const updateProfessorPayload: Prisma.ProfessorUpdateInput = {};
        if (professorFields.salarioBase !== undefined) {
            updateProfessorPayload.salarioBase = new Prisma.Decimal(professorFields.salarioBase);
        }
        if (professorFields.tipoContrato !== undefined) {
            updateProfessorPayload.tipoContrato = professorFields.tipoContrato;
        }
        if (professorFields.dataInicioContrato !== undefined) {
            updateProfessorPayload.dataInicioContrato = new Date(professorFields.dataInicioContrato);
        }
        if (professorFields.dataFimContrato !== undefined) {
            updateProfessorPayload.dataFimContrato = professorFields.dataFimContrato ? new Date(professorFields.dataFimContrato) : null;
        }
        if (professorFields.cpf !== undefined) {
            updateProfessorPayload.cpf = professorFields.cpf;
        }

        const updateUserPayload: Prisma.UserUpdateInput = {};
        if (nome !== undefined) updateUserPayload.nome = nome;
        if (email !== undefined) updateUserPayload.email = email;

        if (senhaHash) {
            const salt = await bcrypt.genSalt(10);
            updateUserPayload.senhaHash = await bcrypt.hash(senhaHash, salt);
        }

        const updatedProfessor = await prisma.professor.update({
            where: { id: professorId },
            data: {
                ...updateProfessorPayload,
                usuario: {
                    update: updateUserPayload,
                },
            },
            include: {
                usuario: true,
            },
        });

        return {
            ...updatedProfessor,
            salarioBase: updatedProfessor.salarioBase.toString(),
        } as TeacherDetailed;
    },

    async deleteProfessor(professorId: string) {
        return prisma.professor.delete({ where: { id: professorId } });
    }
}


export async function getProfessorId(): Promise<string | null> {
    const user = await getUserSession();

    if (!user?.id) return null;

    const professor = await prisma.professor.findFirst({
        where: {
            usuarioId: user.id
        },
        select: {
            id: true
        }
    });

    return professor?.id ?? null;
}


export async function getProfessorDashboardData() {
    const session = await getUserSession();

    if (!session || session.role !== "PROFESSOR") return [];

    const professor = await prisma.professor.findUnique({
        where: { usuarioId: session.id },
        select: { id: true }
    });

    if (!professor) return [];

    const turmas = await prisma.turmaDisciplina.findMany({
        where: {
            professorId: professor.id,
            turma: {
                escolaId: session.escolaId,
                anoLetivo: { anoAtual: true }
            }
        },
        include: {
            disciplina: true,
            turma: {
                include: {
                    serie: true,
                    _count: { select: { matriculas: true } }
                }
            }
        },
        orderBy: { turma: { nome: 'asc' } }
    });

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const turmasComStats = await Promise.all(turmas.map(async (td) => {
        const notasDaTurma = await prisma.nota.findMany({
            where: { turmaDisciplinaId: td.id },
            select: {
                valor: true,
                atividadeTurma: {
                    select: { valorMaximo: true }
                }
            }
        });

        let mediaGeral = 0;

        if (notasDaTurma.length > 0) {
            const totalObtido = notasDaTurma.reduce((acc, nota) => acc + nota.valor, 0);
            const totalPossivel = notasDaTurma.reduce((acc, nota) =>
                acc + (nota.atividadeTurma?.valorMaximo || 10), 0
            );

            mediaGeral = (totalObtido / totalPossivel) * 10;
        }

        const frequenciaHoje = await prisma.frequencia.findFirst({
            where: {
                turmaDisciplinaId: td.id,
                data: { gte: hoje }
            }
        });

        const aulasCount = await prisma.frequencia.groupBy({
            by: ['data'],
            where: { turmaDisciplinaId: td.id },
            orderBy: { data: 'desc' }
        });

        let atividadeAlvo = await prisma.atividadeTurma.findFirst({
            where: {
                turmaId: td.turmaId,
                disciplinaId: td.disciplinaId,
                data: { lt: hoje },
            },
            include: {
                _count: { select: { notas: true } }
            },
            orderBy: { data: 'asc' }
        });

        const totalAlunos = td.turma._count.matriculas;
        let notasLancadasCount = atividadeAlvo?._count.notas || 0;

        if (!atividadeAlvo || notasLancadasCount >= totalAlunos) {
            const proxima = await prisma.atividadeTurma.findFirst({
                where: {
                    turmaId: td.turmaId,
                    disciplinaId: td.disciplinaId,
                    data: { gte: hoje }
                },
                include: {
                    _count: { select: { notas: true } }
                },
                orderBy: { data: 'asc' }
            });

            if (proxima) {
                atividadeAlvo = proxima;
                notasLancadasCount = proxima._count.notas;
            }
        }

        let statusAtividade = "NENHUMA";
        if (atividadeAlvo) {
            const isPassada = new Date(atividadeAlvo.data) < hoje;
            const isCompleta = notasLancadasCount >= totalAlunos;

            if (isPassada && !isCompleta) {
                statusAtividade = "PENDENTE_LANCAMENTO";
            } else if (isPassada && isCompleta) {
                statusAtividade = "CONCLUIDA";  
            } else {
                statusAtividade = "AGENDADA";
            }
        }

        return {
            ...td,
            stats: {
                mediaGeral: mediaGeral,
                ultimaAula: aulasCount[0]?.data || null,
                totalAulas: aulasCount.length,
                frequenciaHoje: !!frequenciaHoje,
                totalAlunos: totalAlunos,
                notasLancadasCount: notasLancadasCount,
                proximaAtividade: atividadeAlvo ? {
                    id: atividadeAlvo.id,
                    titulo: atividadeAlvo.titulo,
                    data: atividadeAlvo.data,
                    tipo: atividadeAlvo.tipo,
                    status: statusAtividade,
                    labelAtividade: statusAtividade === "PENDENTE_LANCAMENTO" ? "Lançamento Pendente" : "Próxima Atividade"
                } : null
            }
        };
    }));
    return turmasComStats;
}