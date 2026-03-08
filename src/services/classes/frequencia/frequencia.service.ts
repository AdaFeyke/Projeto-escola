import prisma from '~/lib/prisma';

export async function getAlunosEStatusFrequencia(turmaDisciplinaId: string) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    const vinculacao = await prisma.turmaDisciplina.findUnique({
        where: { id: turmaDisciplinaId },
        select: { turmaId: true }
    });

    if (!vinculacao) return [];

    const matriculas = await prisma.matricula.findMany({
        where: {
            turmaId: vinculacao.turmaId,
            status: "ATIVA",
        },
        include: {
            aluno: {
                include: {
                    usuario: true,
                    frequencias: {
                        where: {
                            turmaDisciplinaId: turmaDisciplinaId,
                            data: {
                                gte: hoje,
                                lt: amanha
                            }
                        },
                        take: 1 
                    }
                }
            }
        },
        orderBy: {
            aluno: { usuario: { nome: 'asc' } }
        }
    });

    return matriculas.map(m => {
        const registroFrequencia = m.aluno.frequencias[0];
        
        return {
            id: m.aluno.id,
            matricula: m.numero,
            nome: m.aluno.usuario.nome || "Estudante sem nome",
            imagem: m.aluno.usuario.imagem || '',
            statusInicial: registroFrequencia ? registroFrequencia.status : null 
        };
    });
}