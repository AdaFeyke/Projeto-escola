"use server";

import prisma from "~/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type ActionResponse, Action } from "~/services/form/ActionResponse.types";
import { getUserSession } from "~/config/permission-manager";

const AtividadeSchema = z.object({
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  valorMaximo: z.coerce.number().min(0, "O valor não pode ser negativo").default(10),
  data: z.string(),
  turmaId: z.string().min(1, "A turma é obrigatória"),
  cicloId: z.string().nullable().optional(),
  disciplinaId: z.string().nullable().optional(),
  tipo: z.enum(["PROVA", "TRABALHO", "SEMINARIO", "OUTRO"]),
});

export async function createAtividadeAction(prevState: ActionResponse, formData: FormData) {
  const { role } = await getUserSession();

  if (role !== 'ADMINISTRADOR' && role !== 'PROFESSOR') {
    return Action.error("Acesso negado: Você não tem permissão de administrador ou professor.");
  }

  const rawData = {
    titulo: formData.get("titulo") as string,
    descricao: formData.get("descricao") as string,
    tipo: (formData.get("tipo") as string) || "PROVA",
    cicloId: formData.get("cicloId") as string,
    valorMaximo: formData.get("valorMaximo") as string,
    data: formData.get("data") as string,
    turmaId: formData.get("turmaId") as string,
    disciplinaId: formData.get("disciplinaId") as string,
  };

  const validatedFields = AtividadeSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return Action.error("Erro de validação: " + validatedFields.error.errors[0]?.message);
  }

  const { titulo, descricao, valorMaximo, data, turmaId, cicloId, disciplinaId, tipo } = validatedFields.data;

  try {
    await prisma.atividadeTurma.create({
      data: {
        titulo,
        descricao,
        valorMaximo,
        data: data.includes('T') ? new Date(data) : new Date(`${data}T12:00:00Z`),
        tipo: tipo,
        turmaId,
        cicloId: cicloId || null,
        disciplinaId: disciplinaId,
      },
    });

    revalidatePath("/dashboard/calendario");
    revalidatePath("/dashboard/classes/class/[disciplinaId]");

    return Action.success("Atividade agendada com sucesso!");
  } catch (error) {
    console.error("ERRO_AO_CRIAR_ATIVIDADE:", error);
    return Action.error("Não foi possível salvar a atividade no banco de dados.");
  }
}

export async function updateAtividadeAction(prevState: ActionResponse, formData: FormData) {
  const { role } = await getUserSession();

  if (role !== 'ADMINISTRADOR' && role !== 'PROFESSOR') {
    return Action.error("Acesso negado: Você não tem permissão de administrador ou professor.");
  }

  const id = formData.get("id") as string;

  if (!id) {
    return Action.error("ID da atividade não fornecido.");
  }

  const rawData = {
    titulo: formData.get("titulo") as string,
    descricao: formData.get("descricao") as string,
    tipo: (formData.get("tipo") as string) || "PROVA",
    cicloId: formData.get("cicloId") as string,
    valorMaximo: formData.get("valorMaximo") as string,
    data: formData.get("data") as string,
    turmaId: formData.get("turmaId") as string,
    disciplinaId: formData.get("disciplinaId") as string,
  };

  const validatedFields = AtividadeSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return Action.error("Erro de validação: " + validatedFields.error.errors[0]?.message);
  }

  const { titulo, descricao, valorMaximo, data, turmaId, cicloId, disciplinaId, tipo } = validatedFields.data;

  try {
    await prisma.atividadeTurma.update({
      where: { id },
      data: {
        titulo,
        descricao,
        valorMaximo,
        data: data.includes('T') ? new Date(data) : new Date(`${data}T12:00:00Z`),
        tipo: tipo,
        cicloId: cicloId || null,
      },
    });

    revalidatePath("/dashboard/calendario");
    revalidatePath("/dashboard/classes/class/[disciplinaId]");

    return Action.success("Atividade atualizada com sucesso!");
  } catch (error) {
    console.error("ERRO_AO_ATUALIZAR_ATIVIDADE:", error);
    return Action.error("Não foi possível atualizar a atividade.");
  }
}

export async function deleteAtividadeAction(id: string) {
  const { role } = await getUserSession();

  if (role !== 'ADMINISTRADOR' && role !== 'PROFESSOR') {
    return Action.error("Acesso negado: Você não tem permissão de administrador ou professor.");
  }

  if (!id) return Action.error("ID inválido.");

  const notasCount = await prisma.nota.count({
    where: { atividadeTurmaId: id }
  });

  if (notasCount > 0) {
    return Action.error(`Existem ${notasCount} notas lançadas. Exclua as notas primeiro ou limpe os registros.`);
  }
  try {
    await prisma.atividadeTurma.delete({
      where: { id }
    });

    revalidatePath("/dashboard/calendario");
    revalidatePath("/dashboard/classes/class/[disciplinaId]");

    return Action.success("Atividade excluída com sucesso!");
  } catch (error) {
    console.error("ERRO_AO_EXCLUIR_ATIVIDADE:", error);
    return Action.error("Erro ao excluir atividade.");
  }
}