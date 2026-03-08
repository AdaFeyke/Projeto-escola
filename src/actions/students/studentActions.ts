"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import prisma from '~/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

import { getCurrentEscolaId, getUserSession } from '~/config/permission-manager'
import { uploadFile } from "~/services/storage/storage.service";

const PHONE_REGEX = /^\(\d{2}\) \d \d{4}-\d{4}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const CreateStudentSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres").trim(),
  email: z.string().email("E-mail inválido").trim().toLowerCase(),
  dataNascimento: z
    .string()
    .min(1, "Data de nascimento é obrigatória")
    .regex(DATE_REGEX, "Data de nascimento inválida (use AAAA-MM-DD)"),

  cep: z.string().optional().or(z.literal('')),
  ruaEndereco: z.string().optional(),
  numeroEndereco: z.string().optional(),
  bairroEndereco: z.string().optional(),
  cidadeEndereco: z.string().optional(),
  estadoEndereco: z.string().optional(),

  naturalidade: z.string().optional(),
  nacionalidade: z.string().optional(),

  escolaTransferida: z.string().optional(),
  anoTransferido: z.string().optional(),
});

interface FormState {
  success: boolean;
  message: string;
  timestamp: number | string;
  data?: any;
  values?: Record<string, string | undefined>;
  fieldErrors?: Record<string, string[] | undefined>;
}

interface ResponsavelParsed {
  nome: string;
  telefone: string;
  parentesco?: string;
}

function validateResponsaveis(formData: FormData): {
  responsaveis: ResponsavelParsed[];
  fieldErrors: Record<string, string[]>;
} {
  const total = Number(formData.get("total_responsaveis")?.toString() || "0");
  const fieldErrors: Record<string, string[]> = {};
  const responsaveis: ResponsavelParsed[] = [];

  if (!Number.isFinite(total) || total <= 0) {
    fieldErrors["resp_nome_0"] = ["Informe pelo menos um responsável."];
    fieldErrors["resp_telefone_0"] = ["Informe o telefone do responsável."];
    fieldErrors["resp_parentesco_0"] = ["Informe o parentesco do responsável."];
    return { responsaveis, fieldErrors };
  }

  for (let i = 0; i < total; i++) {
    const nome = (formData.get(`resp_nome_${i}`)?.toString() || "").trim();
    const telefone = (formData.get(`resp_telefone_${i}`)?.toString() || "").trim();
    const parentesco = (formData.get(`resp_parentesco_${i}`)?.toString() || "").trim();

    if (!nome) fieldErrors[`resp_nome_${i}`] = ["Nome do responsável é obrigatório."];
    else if (nome.length < 3) fieldErrors[`resp_nome_${i}`] = ["O nome deve ter pelo menos 3 caracteres."];

    if (!telefone) fieldErrors[`resp_telefone_${i}`] = ["Telefone do responsável é obrigatório."];
    else if (!PHONE_REGEX.test(telefone)) {
      fieldErrors[`resp_telefone_${i}`] = ["Telefone inválido. Use o formato (99) 9 9999-9999."];
    }

    if (!parentesco) fieldErrors[`resp_parentesco_${i}`] = ["Parentesco é obrigatório."];

    const hasErrorsForIndex =
      fieldErrors[`resp_nome_${i}`] || fieldErrors[`resp_telefone_${i}`] || fieldErrors[`resp_parentesco_${i}`];

    if (!hasErrorsForIndex) {
      responsaveis.push({ nome, telefone, parentesco });
    }
  }

  if (responsaveis.length === 0) {
    fieldErrors["resp_nome_0"] = fieldErrors["resp_nome_0"] ?? ["Informe pelo menos um responsável válido."];
  }

  return { responsaveis, fieldErrors };
}

function gerarSenhaPorDataNascimento(dataNascimento?: string | null) {
  if (!dataNascimento) return null;
  const date = new Date(dataNascimento);
  if (isNaN(date.getTime())) return "123456";

  const dia = String(date.getUTCDate()).padStart(2, "0");
  const mes = String(date.getUTCMonth() + 1).padStart(2, "0");
  const ano = date.getUTCFullYear();
  return `${dia}${mes}${ano}`;
}

function parseFormData(formData: FormData) {
  const rawValues = Object.fromEntries(formData.entries());
  const cleanValues: Record<string, any> = {};

  for (const key in rawValues) {
    const val = rawValues[key];
    if (typeof val === 'string') {
      cleanValues[key] = val.trim() === "" ? undefined : val.trim();
    } else {
      cleanValues[key] = val;
    }
  }

  return cleanValues;
}

export async function createStudent(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const { role } = await getUserSession();

  if (role !== "ADMINISTRADOR") return {
    success: false,
    message: "Acesso negado: Você não tem permissão de administrador.",
    timestamp: Date.now(),
  };

  const values = parseFormData(formData);
  const file = formData.get("file") as File;
  const newUserId = uuidv4();
  let imageUrl: string | null = null;

  const validated = CreateStudentSchema.safeParse(values);

  if (!validated.success) {
    return {
      success: false,
      message: "Verifique os dados informados.",
      timestamp: Date.now(),
      values: values as Record<string, string>,
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const responsavelValidation = validateResponsaveis(formData);
    if (Object.keys(responsavelValidation.fieldErrors).length > 0) {
      return {
        success: false,
        message: "Verifique os dados informados.",
        timestamp: Date.now(),
        values: values as Record<string, string>,
        fieldErrors: responsavelValidation.fieldErrors,
      };
    }

    const isFileValid = file && typeof file === 'object' && 'size' in file && (file as any).size > 0;

    if (isFileValid) {
      try {
        const uploadedUrl = await uploadFile(file, newUserId);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          return { success: false, message: "Erro ao processar imagem de perfil.", timestamp: Date.now() };
        }
      } catch (uploadError) {
        console.error("Falha no upload de imagem:", uploadError);
        return { success: false, message: "Erro ao salvar foto do aluno.", timestamp: Date.now() };
      }
    }

    const escolaId = await getCurrentEscolaId();

    let dataNascimentoDate: Date;
    if (DATE_REGEX.test(validated.data.dataNascimento)) {
      const parts = validated.data.dataNascimento.split('-');
      const ano = Number(parts[0]);
      const mes = Number(parts[1]);
      const dia = Number(parts[2]);
      dataNascimentoDate = new Date(Date.UTC(ano, mes - 1, dia));
    } else {
      dataNascimentoDate = new Date(validated.data.dataNascimento);
    }

    if (isNaN(dataNascimentoDate.getTime())) {
      return {
        success: false,
        message: "Data de nascimento inválida.",
        timestamp: Date.now(),
        values: values as Record<string, string>,
        fieldErrors: { dataNascimento: ["Data inválida"] }
      };
    }

    const senhaPlana = gerarSenhaPorDataNascimento(validated.data.dataNascimento);
    const senhaHash = await bcrypt.hash(senhaPlana!, 10);

    const createdUser = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({ where: { email: validated.data.email } });
      if (existingUser) {
        throw new Error("Este e-mail já está cadastrado.");
      }

      const user = await tx.user.create({
        data: {
          id: newUserId,
          nome: validated.data.nome,
          email: validated.data.email,
          senhaHash,
          imagem: imageUrl,
          dataNascimento: dataNascimentoDate,
          status: 'ATIVO',
        },
      });

      const aluno = await tx.aluno.create({
        data: {
          usuarioId: user.id,
          cep: validated.data.cep,
          ruaEndereco: validated.data.ruaEndereco,
          numeroEndereco: validated.data.numeroEndereco,
          bairroEndereco: validated.data.bairroEndereco,
          cidadeEndereco: validated.data.cidadeEndereco,
          estadoEndereco: validated.data.estadoEndereco,
          naturalidade: validated.data.naturalidade,
          nacionalidade: validated.data.nacionalidade,
          escolaTransferida: validated.data.escolaTransferida,
          anoTransferido: validated.data.anoTransferido ? Number(validated.data.anoTransferido) : undefined,
        },
      });

      await tx.responsavelAluno.createMany({
        data: responsavelValidation.responsaveis.map((r) => ({ ...r, alunoId: aluno.id })),
      });

      await tx.userEscola.create({
        data: { userId: user.id, escolaId, papel: 'ALUNO' },
      });

      const respostas = Array.from(formData.entries())
        .filter(([key, value]) => key.startsWith("resposta_") && value && value.toString().trim() !== "")
        .map(([key, value]) => ({
          alunoId: aluno.id,
          perguntaId: key.replace("resposta_", ""),
          resposta: value.toString(),
        }));

      if (respostas.length > 0) {
        await tx.questionarioResposta.createMany({ data: respostas });
      }

      return user;
    });

    revalidatePath("/dashboard/students");
    return {
      success: true,
      message: "Aluno cadastrado com sucesso!",
      timestamp: Date.now(),
      data: createdUser,
    };

  } catch (err: any) {
    console.error("Erro no createStudent:", err);
    return {
      success: false,
      message: err.message || "Erro interno ao cadastrar aluno.",
      timestamp: Date.now(),
      values: values as Record<string, string>,
    };
  }
}


export async function updateStudent(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const { role } = await getUserSession();
  if (role !== "ADMINISTRADOR") return {
    success: false,
    message: "Acesso negado: Você não tem permissão de administrador.",
    timestamp: Date.now(),
  };


  const values = parseFormData(formData);
  const validated = CreateStudentSchema.safeParse(values);

  const studentId = formData.get("studentId")?.toString();
  const file = formData.get("file") as File | undefined;

  if (!studentId) {
    return { success: false, message: "ID do aluno inválido.", timestamp: Date.now() };
  }

  if (!validated.success) {
    return {
      success: false,
      message: "Dados inválidos. Verifique os campos em vermelho.",
      timestamp: Date.now(),
      values: values as Record<string, string>,
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const responsavelValidation = validateResponsaveis(formData);
    if (Object.keys(responsavelValidation.fieldErrors).length > 0) {
      return {
        success: false,
        message: "Dados inválidos. Verifique os campos em vermelho.",
        timestamp: Date.now(),
        values: values as Record<string, string>,
        fieldErrors: responsavelValidation.fieldErrors,
      };
    }

    let imageToUpdate: string | null | undefined = undefined;
    const file = formData.get("file");
    const removeImageFlag = formData.get("remove_image") === "true";

    const hasNewFile = file && typeof file === "object" && "size" in file && (file as any).size > 0;

    if (hasNewFile) {
      try {
        const uploadedUrl = await uploadFile(file as any, studentId);
        if (uploadedUrl) {
          imageToUpdate = uploadedUrl;
        } else {
          return { success: false, message: "Erro ao processar upload da foto.", timestamp: Date.now() };
        }
      } catch (err) {
        console.error("Upload Error:", err);
        return { success: false, message: "Erro de conexão ao salvar foto.", timestamp: Date.now() };
      }
    } else if (removeImageFlag) {
      imageToUpdate = null;
    }

    let dataNascimentoDate: Date;
    if (DATE_REGEX.test(validated.data.dataNascimento)) {
      const parts = validated.data.dataNascimento.split('-');
      const ano = Number(parts[0]);
      const mes = Number(parts[1]);
      const dia = Number(parts[2]);
      dataNascimentoDate = new Date(Date.UTC(ano, mes - 1, dia));
    } else {
      dataNascimentoDate = new Date(validated.data.dataNascimento);
    }

    if (isNaN(dataNascimentoDate.getTime())) {
      return {
        success: false,
        message: "Data de nascimento inválida.",
        timestamp: Date.now(),
        values: values as Record<string, string>,
        fieldErrors: { dataNascimento: ["Data inválida"] }
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: studentId },
        data: {
          nome: validated.data.nome,
          email: validated.data.email,
          ...(imageToUpdate !== undefined ? { imagem: imageToUpdate } : {}),
          dataNascimento: dataNascimentoDate,
        },
      });

      const alunoExistente = await tx.aluno.findUnique({ where: { usuarioId: studentId } });
      if (!alunoExistente) throw new Error("Registro de aluno não encontrado.");

      const alunoId = alunoExistente.id;

      await tx.aluno.update({
        where: { id: alunoId },
        data: {
          cep: validated.data.cep,
          ruaEndereco: validated.data.ruaEndereco,
          numeroEndereco: validated.data.numeroEndereco,
          bairroEndereco: validated.data.bairroEndereco,
          cidadeEndereco: validated.data.cidadeEndereco,
          estadoEndereco: validated.data.estadoEndereco,
          naturalidade: validated.data.naturalidade,
          nacionalidade: validated.data.nacionalidade,
          escolaTransferida: validated.data.escolaTransferida,
          anoTransferido: validated.data.anoTransferido ? Number(validated.data.anoTransferido) : undefined,
        },
      });

      await tx.responsavelAluno.deleteMany({ where: { alunoId } });

      await tx.responsavelAluno.createMany({
        data: responsavelValidation.responsaveis.map((resp) => ({
          alunoId,
          nome: resp.nome,
          telefone: resp.telefone,
          parentesco: resp.parentesco,
        })),
      });

      const respostasRaw = Array.from(formData.entries())
        .filter(([key, value]) => key.startsWith("resposta_") && value !== null && value !== undefined)
        .map(([key, value]) => ({
          alunoId,
          perguntaId: key.replace("resposta_", ""),
          resposta: value.toString(),
        }));

      if (respostasRaw.length > 0) {
        const perguntasIds = respostasRaw.map(r => r.perguntaId);
        await tx.questionarioResposta.deleteMany({
          where: {
            alunoId,
            perguntaId: { in: perguntasIds }
          },
        });

        const respostasParaSalvar = respostasRaw.filter(r => r.resposta.trim() !== "");
        if (respostasParaSalvar.length > 0) {
          await tx.questionarioResposta.createMany({
            data: respostasParaSalvar,
          });
        }
      }
    });

    revalidatePath("/dashboard/students");
    return {
      success: true,
      message: "Aluno atualizado com sucesso!",
      timestamp: Date.now(),
    };
  } catch (err: unknown) {
    console.error("Update Error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Erro ao atualizar aluno.",
      timestamp: Date.now(),
      values: values as Record<string, string>,
    };
  }
}

export async function deleteStudentAction() {
  const { role } = await getUserSession();
  if (role !== "ADMINISTRADOR") return {
    success: false,
    message: "Acesso negado: Você não tem permissão de administrador.",
    timestamp: Date.now(),
  };

  return { success: true, message: "Funcionalidade de exclusão não implementada totalmente nesta demo." };
}

export async function searchStudentsAction(query: string) {
  const escolaId = await getCurrentEscolaId();
  if (!query || query.length < 2) return [];

  return await prisma.user.findMany({
    where: {
      escolas: { some: { escolaId } },
      aluno: {
        is: {
          matriculas: {
            none: {}
          }
        }
      },
      AND: [
        {
          OR: [
            { nome: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
      ],
    },
    take: 6,
    include: {
      aluno: {
        include: {
          responsaveisAluno: true,
          questionarioResposta: true,
        }
      }
    }
  });
}