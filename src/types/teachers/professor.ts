export type ProfessorDTO = {
    id?: string;
    usuarioId: string;
    salarioBase: string;
    tipoContrato: string;
    dataInicioContrato: string;
    dataFimContrato?: string | null;
    cpf: string;
    usuario?: { id: string; nome?: string; email?: string };
};