import type { User, Aluno } from '@prisma/client';

export interface StudentsStats {
    totalAlunos: number;
    alunosAtivos: number;
    alunosInativos: number;
    alunosEmTransferencia: number;
}

export type FormState = {
    success: boolean;
    message: string;
    fieldErrors?: {
        nome?: string[];
        matricula?: string[];
        email?: string[];
        senha?: string[];
    };
};

export type StudentDetailed = {
    id: string;
    nome: string;

};

export type AlunoTabela = {
    id: string;
    nome: string | null;
    email: string;
    imagem: string | null;
    dataNascimento: Date | string | null;
    aluno?: any;
}

export type InitialData = (User & { aluno: Aluno | null }) | null;

export type StudentAction = (prevState: FormState, formData: FormData) => Promise<FormState>;