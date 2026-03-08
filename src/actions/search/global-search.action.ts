"use server";

import prisma from "~/lib/prisma";
import { getCurrentEscolaId } from "~/config/permission-manager";

export type SearchResult = {
    category: "students" | "teachers" | "classes" | "actions";
    id: string;
    title: string;
    description: string;
    href: string;
    image?: string | null;
    shortcut?: string;
};

export async function searchGlobal(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    const escolaId = await getCurrentEscolaId();
    const cleanQuery = query.toLowerCase().trim();

    // Execução paralela otimizada
    const [alunos, professores, turmas] = await Promise.all([
        prisma.aluno.findMany({
            where: {
                usuario: {
                    escolas: { some: { escolaId } },
                    nome: { contains: cleanQuery, mode: 'insensitive' }
                }
            },
            take: 5,
            select: {
                id: true,
                usuario: { select: { id: true, nome: true, imagem: true, email: true } },
                matriculas: {
                    where: { status: 'ATIVA' },
                    take: 1,
                    select: { turma: { select: { nome: true } } }
                }
            }
        }),
        prisma.professor.findMany({
            where: {
                usuario: {
                    escolas: { some: { escolaId } },
                    nome: { contains: cleanQuery, mode: 'insensitive' }
                }
            },
            take: 3,
            select: {
                id: true,
                usuario: { select: { id: true, nome: true, imagem: true } }
            }
        }),
        prisma.turma.findMany({
            where: {
                escolaId,
                nome: { contains: cleanQuery, mode: 'insensitive' }
            },
            take: 3,
            select: { 
                id: true, 
                nome: true, 
                anoLetivo: { select: { ano: true } } 
            }
        })
    ]);

    const results: SearchResult[] = [];

    // Mapeamento transformado para manter a UI limpa
    results.push(...alunos.map(a => ({
        category: "students" as const,
        id: a.id,
        title: a.usuario.nome || "Aluno sem nome",
        description: a.matriculas[0]?.turma?.nome || a.usuario.email || "Estudante",
        href: `/dashboard/students/${a.usuario.id}`,
        image: a.usuario.imagem
    })));

    results.push(...professores.map(p => ({
        category: "teachers" as const,
        id: p.id,
        title: p.usuario.nome || "Professor",
        description: "Corpo Docente",
        href: `/dashboard/teachers/${p.id}`,
        image: p.usuario.imagem
    })));

    results.push(...turmas.map(t => ({
        category: "classes" as const,
        id: t.id,
        title: t.nome,
        description: `Ano Letivo: ${t.anoLetivo.ano}`,
        href: `/dashboard/classes/${t.id}`
    })));

    return results;
}