import type { Disciplina, Professor } from '@prisma/client';

export type SerieSimple = { 
    id: string, 
    nome: string 
};

export type AnoLetivoSimple = { 
    id: string, 
    ano: number,
    anoAtual: boolean 
};

export type DisciplinaSimple = { 
    id: string, 
    nome: string 
};

export type ClassDetailed = {
    id: string;
    nome: string;
    codigo: string | null;
    serie: { id: string, nome: string };
    anoLetivo: { id: string, ano: number };
    
    turmaDisciplinas: {
        id: string;
        disciplina: Disciplina;
        professor: Professor & { usuario: { nome: string } } | null;
        alunosCount: number; 
    }[];
    
    alunosCount: number; 
};

export type CreateClassData = {
    nome: string;
    codigo?: string;
    serieId: string;
    anoLetivoId: string;
    disciplinasIds: string[];
};
