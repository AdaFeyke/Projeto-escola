"use server";

import { revalidatePath } from "next/cache";
import { checkAdminPermissionReturnAction } from "~/config/permission-manager";
import { TeacherService } from "~/services/teachers/teacher.service";
import type { CreateTeacherData, UpdateTeacherData } from "~/services/teachers/teacher.service.types";
import { Action } from "~/services/form/ActionResponse.types";

interface FormCreateProfessorData {
    nome: string;
    email: string;
    senhaHash: string;
    salarioBase: string;
    tipoContrato: string;
    dataInicioContrato: string;
    dataFimContrato: string | null;
    cpf: string;
}

interface FormUpdateProfessorData {
    teacherId: string;
    nome?: string;
    email?: string;
    senhaHash?: string;
    salarioBase?: string;
    tipoContrato?: string;
    dataInicioContrato?: string;
    dataFimContrato?: string | null;
    cpf?: string;
}

export async function createTeacherAction(formData: FormData) {
    try {
        const authError = await checkAdminPermissionReturnAction();
        if (authError) return authError;

        const data: FormCreateProfessorData = {
            nome: String(formData.get("nome") ?? ""),
            email: String(formData.get("email") ?? ""),
            senhaHash: String(formData.get("senhaHash") ?? ""),
            salarioBase: String(formData.get("salarioBase") ?? "0"),
            tipoContrato: String(formData.get("tipoContrato") ?? ""),
            dataInicioContrato: String(formData.get("dataInicioContrato") ?? ""),
            dataFimContrato: formData.get("dataFimContrato") as string | null,
            cpf: String(formData.get("cpf") ?? ""),
        };

        const createData: CreateTeacherData = {
            ...data,
            salarioBase: data.salarioBase,
            tipoContrato: data.tipoContrato,
            dataInicioContrato: data.dataInicioContrato
        };

        if (!data.nome || !data.email || !data.senhaHash || !data.tipoContrato || !data.dataInicioContrato || !data.cpf) {
            throw new Error("Dados de criação incompletos. Nome, email, senha, CPF e contrato são obrigatórios.");
        }

        await TeacherService.createProfessor(createData);

        revalidatePath("/dashboard/teachers");
    } catch (error) {
        console.error("ERRO_CREATE_PROFESSOR:", error);
        return Action.error("Erro ao criar o professor.");
    }
}

export async function updateTeacherAction(formData: FormData) {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;

    const data: FormUpdateProfessorData = {
        teacherId: String(formData.get("teacherId") ?? ""),
        nome: formData.get("nome") as string | undefined,
        email: formData.get("email") as string | undefined,
        senhaHash: formData.get("senhaHash") as string | undefined,
        salarioBase: formData.get("salarioBase") as string | undefined,
        tipoContrato: formData.get("tipoContrato") as string | undefined,
        dataInicioContrato: formData.get("dataInicioContrato") as string | undefined,
        dataFimContrato: formData.get("dataFimContrato") as string | null | undefined,
        cpf: formData.get("cpf") as string | undefined,
    };

    const updateData: UpdateTeacherData = {
        professorId: data.teacherId,
        nome: data.nome || undefined,
        email: data.email || undefined,
        senhaHash: data.senhaHash || undefined,
        salarioBase: data.salarioBase || undefined,
        tipoContrato: data.tipoContrato || undefined,
        dataInicioContrato: data.dataInicioContrato || undefined,
        dataFimContrato: data.dataFimContrato === '' ? null : data.dataFimContrato,
        cpf: data.cpf || undefined,
    };

    if (!updateData.professorId) {
        throw new Error("ID do professor ausente para a atualização.");
    }

    await TeacherService.updateProfessor(updateData);

    revalidatePath("/dashboard/teachers");
}

export async function deleteTeacherAction(formData: FormData) {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;

    const teacherId = String(formData.get("teacherId") ?? "");

    if (!teacherId) {
        throw new Error("ID do professor ausente para a exclusão.");
    }

    await TeacherService.deleteProfessor(teacherId);

    revalidatePath("/dashboard/teachers");
}