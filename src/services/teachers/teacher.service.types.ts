import { Prisma } from "@prisma/client";

const TeacherWithUserArgs = Prisma.validator<Prisma.ProfessorDefaultArgs>()({
  include: {
    usuario: true,
  },
});


type ProfessorBase = Prisma.ProfessorGetPayload<typeof TeacherWithUserArgs>;
export type TeacherDetailed = Omit<ProfessorBase, 'salarioBase'> & {
    salarioBase: string; 
};

export interface CreateTeacherData {
    nome: string;
    email: string;
    senhaHash: string; 
    cpf: string;
    salarioBase: string; 
    tipoContrato: string;
    dataInicioContrato: string; 
    dataFimContrato: string | null | undefined; 
}

export interface UpdateTeacherData {
    professorId: string;
    nome?: string;
    email?: string;
    senhaHash?: string; 
    cpf?: string;
    salarioBase?: string;
    tipoContrato?: string;
    dataInicioContrato?: string;
    dataFimContrato?: string | null;
}