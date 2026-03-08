'use server';

import { z } from "zod";
import db from '~/lib/db';
import {
  user as userTable, aluno as alunoTable, matricula as matriculaTable,
  userEscola as userEscolaTable, responsavelAluno as responsavelTable,
  questionarioResposta as respostaTable, questionarioPergunta as perguntaTable,
  nota as notaTable, frequencia as frequenciaTable,
  turma as turmaTable, anoLetivo as anoLetivoTable,
  turmaDisciplina as tdTable, disciplina as discTable,
  atividadeTurma as atividadeTable, cicloLetivo as cicloTable,
  pagamento as pagamentoTable, pendencia as pendenciaTable
} from '~/lib/schema';
import { eq, and, sql, desc, asc, getTableColumns } from 'drizzle-orm';
import { StudentFormSchema } from '~/schemas/student-form-schema';
import * as bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import type { StudentsStats } from "./aluno.service.types";
import { getCurrentEscolaId } from '~/config/permission-manager';
import { v4 as uuidv4 } from 'uuid';

type ActionResponse = { success: boolean, message: string, errors?: any };

export async function createAluno(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  try {
    const data = StudentFormSchema.parse(Object.fromEntries(formData));
    const escolaId = await getCurrentEscolaId();

    const { nome, email, matricula: numMatricula, dataNascimento, senha } = data;

    // Check if matricula exists
    const existingMatricula = await db.select()
      .from(matriculaTable)
      .where(eq(matriculaTable.numero, numMatricula))
      .limit(1);

    if (existingMatricula.length > 0) {
      return { success: false, message: "Matrícula já cadastrada." };
    }

    // Check if email exists
    if (email) {
      const existingUser = await db.select()
        .from(userTable)
        .where(eq(userTable.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return { success: false, message: "E-mail já cadastrado." };
      }
    }

    let senhaHash = 'default_hashed_password';
    if (email && senha) {
      senhaHash = await bcrypt.hash(senha, 10);
    } else if (email) {
      return { success: false, message: "É necessário fornecer a senha se o e-mail for preenchido." };
    }

    const userId = uuidv4();
    const alunoId = uuidv4();
    const emailToUse = email || `temp-${numMatricula}@escola.com`;

    await db.transaction(async (tx) => {
      // Create User
      await tx.insert(userTable).values({
        id: userId,
        nome,
        email: emailToUse,
        senhaHash,
        status: 'ATIVO',
        dataNascimento: dataNascimento instanceof Date ? dataNascimento.toISOString() :
          typeof dataNascimento === 'string' ? dataNascimento : null,
      });

      // Create UserEscola
      await tx.insert(userEscolaTable).values({
        id: uuidv4(),
        userId,
        escolaId,
        papel: 'ALUNO',
      });

      // Create Aluno record
      await tx.insert(alunoTable).values({
        id: alunoId,
        usuarioId: userId,
      });
    });

    revalidatePath('/dashboard/students');
    return { success: true, message: `Aluno ${nome} cadastrado com sucesso!` };

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Erro de validação.", errors: error.flatten().fieldErrors };
    }
    console.error("Erro ao criar aluno:", error);
    return { success: false, message: "Erro interno do servidor ao tentar cadastrar o aluno." };
  }
}

export const getStudentsStats = async (): Promise<StudentsStats> => {
  const escolaId = await getCurrentEscolaId();

  const [totalRes, ativosRes, inativosRes, transferenciaRes] = await Promise.all([
    db.select({ count: sql<number>`count(distinct ${alunoTable.id})` }).from(alunoTable).innerJoin(userTable, eq(alunoTable.usuarioId, userTable.id)).innerJoin(userEscolaTable, eq(userTable.id, userEscolaTable.userId)).where(and(eq(userEscolaTable.escolaId, escolaId), eq(userTable.status, 'ATIVO'))),
    db.select({ count: sql<number>`count(distinct ${alunoTable.id})` }).from(alunoTable).innerJoin(userTable, eq(alunoTable.usuarioId, userTable.id)).innerJoin(userEscolaTable, eq(userTable.id, userEscolaTable.userId)).innerJoin(matriculaTable, eq(alunoTable.id, matriculaTable.alunoId)).innerJoin(turmaTable, eq(matriculaTable.turmaId, turmaTable.id)).innerJoin(anoLetivoTable, eq(turmaTable.anoLetivoId, anoLetivoTable.id)).where(and(eq(userEscolaTable.escolaId, escolaId), eq(userTable.status, 'ATIVO'), eq(matriculaTable.status, 'ATIVA'), eq(anoLetivoTable.anoAtual, true))),
    db.select({ count: sql<number>`count(distinct ${alunoTable.id})` }).from(alunoTable).innerJoin(userTable, eq(alunoTable.usuarioId, userTable.id)).innerJoin(userEscolaTable, eq(userTable.id, userEscolaTable.userId)).where(and(eq(userEscolaTable.escolaId, escolaId), eq(userTable.status, 'INATIVO'))),
    db.select({ count: sql<number>`count(distinct ${alunoTable.id})` }).from(alunoTable).innerJoin(userTable, eq(alunoTable.usuarioId, userTable.id)).innerJoin(userEscolaTable, eq(userTable.id, userEscolaTable.userId)).innerJoin(matriculaTable, eq(alunoTable.id, matriculaTable.alunoId)).innerJoin(turmaTable, eq(matriculaTable.turmaId, turmaTable.id)).innerJoin(anoLetivoTable, eq(turmaTable.anoLetivoId, anoLetivoTable.id)).where(and(eq(userEscolaTable.escolaId, escolaId), eq(matriculaTable.status, 'TRANSFERIDA'), eq(anoLetivoTable.anoAtual, true))),
  ]);

  return {
    totalAlunos: Number(totalRes[0]?.count ?? 0),
    alunosAtivos: Number(ativosRes[0]?.count ?? 0),
    alunosInativos: Number(inativosRes[0]?.count ?? 0),
    alunosEmTransferencia: Number(transferenciaRes[0]?.count ?? 0),
  };
}

export const getAlunosNaoMatriculados = async (): Promise<{ id: string, nome: string }[]> => {
  const escolaId = await getCurrentEscolaId();

  const students = await db.select({
    id: alunoTable.id,
    nome: userTable.nome,
  })
    .from(alunoTable)
    .innerJoin(userTable, eq(alunoTable.usuarioId, userTable.id))
    .innerJoin(userEscolaTable, eq(userTable.id, userEscolaTable.userId))
    .where(and(
      eq(userEscolaTable.escolaId, escolaId),
      eq(userEscolaTable.papel, 'ALUNO'),
      sql`NOT EXISTS (SELECT 1 FROM "Matricula" WHERE "Matricula"."alunoId" = ${alunoTable.id})`
    ))
    .orderBy(asc(userTable.nome));

  return students.map(s => ({
    id: s.id,
    nome: s.nome ?? 'Aluno sem nome'
  }));
};

export async function getAlunosByEscola() {
  const escolaId = await getCurrentEscolaId();

  const rawResults = await db.select({
    user: getTableColumns(userTable),
    aluno: getTableColumns(alunoTable),
  })
    .from(userTable)
    .innerJoin(userEscolaTable, eq(userTable.id, userEscolaTable.userId))
    .innerJoin(alunoTable, eq(userTable.id, alunoTable.usuarioId))
    .where(and(
      eq(userEscolaTable.escolaId, escolaId),
      eq(userEscolaTable.papel, "ALUNO")
    ))
    .orderBy(asc(userTable.nome));

  const results = await Promise.all(rawResults.map(async (r) => {
    const responsaveis = await db.select().from(responsavelTable).where(eq(responsavelTable.alunoId, r.aluno.id));
    const respostas = await db.select({
      id: respostaTable.id,
      alunoId: respostaTable.alunoId,
      perguntaId: respostaTable.perguntaId,
      resposta: respostaTable.resposta,
      dataRegistro: respostaTable.dataRegistro,
      pergunta: getTableColumns(perguntaTable)
    })
      .from(respostaTable)
      .innerJoin(perguntaTable, eq(respostaTable.perguntaId, perguntaTable.id))
      .where(eq(respostaTable.alunoId, r.aluno.id));

    return {
      ...r.user,
      aluno: {
        ...r.aluno,
        responsaveisAluno: responsaveis,
        questionarioResposta: respostas,
      }
    };
  }));

  return results;
}

export async function getAlunoDetails(id: string) {
  const userResults = await db.select().from(userTable).where(eq(userTable.id, id)).limit(1);
  const userData = userResults[0];
  if (!userData) return null;

  const alunoResults = await db.select().from(alunoTable).where(eq(alunoTable.usuarioId, userData.id)).limit(1);
  const studentData = alunoResults[0];

  if (!studentData) return { ...userData, aluno: null };

  const [
    matriculasRes,
    notasRes,
    frequenciasRes,
    responsaveisRes,
    questionarioRes,
    pendenciasRes
  ] = await Promise.all([
    db.select({
      matricula: getTableColumns(matriculaTable),
      turma: getTableColumns(turmaTable),
      anoLetivo: getTableColumns(anoLetivoTable),
    })
      .from(matriculaTable)
      .innerJoin(turmaTable, eq(matriculaTable.turmaId, turmaTable.id))
      .innerJoin(anoLetivoTable, eq(turmaTable.anoLetivoId, anoLetivoTable.id))
      .where(and(eq(matriculaTable.alunoId, studentData.id), eq(anoLetivoTable.anoAtual, true))),

    db.select({
      nota: getTableColumns(notaTable),
      td: getTableColumns(tdTable),
      disc: getTableColumns(discTable),
      atividade: { titulo: atividadeTable.titulo },
    })
      .from(notaTable)
      .innerJoin(tdTable, eq(notaTable.turmaDisciplinaId, tdTable.id))
      .innerJoin(discTable, eq(tdTable.disciplinaId, discTable.id))
      .innerJoin(turmaTable, eq(tdTable.turmaId, turmaTable.id))
      .innerJoin(anoLetivoTable, eq(turmaTable.anoLetivoId, anoLetivoTable.id))
      .leftJoin(atividadeTable, eq(notaTable.atividadeTurmaId, atividadeTable.id))
      .where(and(eq(notaTable.alunoId, studentData.id), eq(anoLetivoTable.anoAtual, true))),

    db.select({
      frequencia: getTableColumns(frequenciaTable),
      td: getTableColumns(tdTable),
      disc: getTableColumns(discTable),
    })
      .from(frequenciaTable)
      .innerJoin(tdTable, eq(frequenciaTable.turmaDisciplinaId, tdTable.id))
      .innerJoin(discTable, eq(tdTable.disciplinaId, discTable.id))
      .innerJoin(turmaTable, eq(tdTable.turmaId, turmaTable.id))
      .innerJoin(anoLetivoTable, eq(turmaTable.anoLetivoId, anoLetivoTable.id))
      .where(and(eq(frequenciaTable.alunoId, studentData.id), eq(anoLetivoTable.anoAtual, true))),

    db.select().from(responsavelTable).where(eq(responsavelTable.alunoId, studentData.id)),

    db.select({
      resposta: getTableColumns(respostaTable),
      pergunta: getTableColumns(perguntaTable),
    })
      .from(respostaTable)
      .innerJoin(perguntaTable, eq(respostaTable.perguntaId, perguntaTable.id))
      .where(eq(respostaTable.alunoId, studentData.id)),

    db.select().from(pendenciaTable).where(eq(pendenciaTable.alunoId, studentData.id)).orderBy(desc(pendenciaTable.dataVencimento))
  ]);

  const formattedUser = {
    ...userData,
    aluno: {
      ...studentData,
      matriculas: matriculasRes.map(m => ({ ...m.matricula, turma: { ...m.turma, anoLetivo: m.anoLetivo } })),
      notas: notasRes.map(n => ({ ...n.nota, turmaDisciplina: { ...n.td, disciplina: n.disc }, atividadeTurma: n.atividade })),
      frequencias: frequenciasRes.map(f => ({ ...f.frequencia, turmaDisciplina: { ...f.td, disciplina: f.disc } })),
      responsaveisAluno: responsaveisRes,
      questionarioResposta: questionarioRes.map(q => ({ ...q.resposta, pergunta: q.pergunta })),
      pendencias: await Promise.all(pendenciasRes.map(async (p) => {
        const pag = await db.select().from(pagamentoTable).where(eq(pagamentoTable.pendenciaId, p.id)).limit(1);
        return {
          ...p,
          pagamento: pag[0] || null,
          aluno: {
            id: studentData.id,
            usuario: { nome: userData.nome },
            matriculas: matriculasRes.slice(0, 1).map(m => ({ ...m.matricula, turma: { nome: m.turma.nome } }))
          }
        };
      }))
    }
  };

  const boletim = await getBoletimData(studentData.id);

  return {
    ...formattedUser,
    aluno: {
      ...formattedUser.aluno,
      boletim
    }
  } as any;
}

export async function getBoletimData(alunoId: string) {
  try {
    const escolaId = await getCurrentEscolaId();

    const matriculaResults = await db.select({
      matricula: getTableColumns(matriculaTable),
      turma: getTableColumns(turmaTable),
      anoLetivo: getTableColumns(anoLetivoTable),
    })
      .from(matriculaTable)
      .innerJoin(turmaTable, eq(matriculaTable.turmaId, turmaTable.id))
      .innerJoin(anoLetivoTable, eq(turmaTable.anoLetivoId, anoLetivoTable.id))
      .where(and(
        eq(matriculaTable.alunoId, alunoId),
        eq(matriculaTable.status, 'ATIVA'),
        eq(anoLetivoTable.anoAtual, true)
      ))
      .limit(1);

    const activeMatricula = matriculaResults[0];
    if (!activeMatricula) return null;

    const turmaId = activeMatricula.turma.id;
    const anoLetivoId = activeMatricula.anoLetivo.id;

    const ciclos = await db.select()
      .from(cicloTable)
      .where(and(eq(cicloTable.anoLetivoId, anoLetivoId), eq(cicloTable.escolaId, escolaId)))
      .orderBy(asc(cicloTable.dataInicio));

    const todasNotasTurma = await db.select({
      nota: getTableColumns(notaTable),
      atividade: getTableColumns(atividadeTable),
      td: getTableColumns(tdTable),
    })
      .from(notaTable)
      .innerJoin(tdTable, eq(notaTable.turmaDisciplinaId, tdTable.id))
      .innerJoin(atividadeTable, eq(notaTable.atividadeTurmaId, atividadeTable.id))
      .where(and(
        eq(tdTable.turmaId, turmaId),
        sql`${atividadeTable.cicloId} IS NOT NULL`
      ));

    const tdsInTurma = await db.select({
      td: getTableColumns(tdTable),
      disc: getTableColumns(discTable),
    })
      .from(tdTable)
      .innerJoin(discTable, eq(tdTable.disciplinaId, discTable.id))
      .where(eq(tdTable.turmaId, turmaId));

    const disciplinas = tdsInTurma.map(td => {
      const notasPorCiclo = ciclos.map(ciclo => {
        const notasDisciplinaCiclo = todasNotasTurma.filter(n =>
          n.td.id === td.td.id &&
          n.atividade.cicloId === ciclo.id
        );

        const notasAluno = notasDisciplinaCiclo.filter(n => n.nota.alunoId === alunoId);

        const mediaAluno = notasAluno.length > 0
          ? notasAluno.reduce((acc, n) => acc + n.nota.valor, 0) / notasAluno.length
          : null;

        const mediaTurma = notasDisciplinaCiclo.length > 0
          ? notasDisciplinaCiclo.reduce((acc, n) => acc + n.nota.valor, 0) / notasDisciplinaCiclo.length
          : null;

        return {
          cicloId: ciclo.id,
          mediaAluno,
          mediaTurma
        };
      });

      return {
        id: td.td.id,
        nome: td.disc.nome,
        notasPorCiclo
      };
    });

    return {
      ciclos: ciclos.map(c => ({ id: c.id, nome: c.nome })),
      disciplinas
    };
  } catch (error) {
    console.error("Erro ao carregar dados do boletim:", error);
    return null;
  }
}

export async function getDadosCompletosAtividades(turmaDisciplinaId: string) {
  const vinculoRaw = await db.select({ turmaId: tdTable.turmaId })
    .from(tdTable)
    .where(eq(tdTable.id, turmaDisciplinaId))
    .limit(1);

  const vinculo = vinculoRaw[0];
  if (!vinculo) return [];
  const { turmaId } = vinculo;

  const students = await db.select({
    id: alunoTable.id,
    nome: userTable.nome,
    imagem: userTable.imagem,
  })
    .from(alunoTable)
    .innerJoin(userTable, eq(alunoTable.usuarioId, userTable.id))
    .innerJoin(matriculaTable, eq(alunoTable.id, matriculaTable.alunoId))
    .where(and(
      eq(matriculaTable.turmaId, turmaId),
      eq(matriculaTable.status, "ATIVA")
    ))
    .orderBy(asc(userTable.nome));

  return await Promise.all(students.map(async (s) => {
    const notas = await db.select({
      valor: notaTable.valor,
      atividadeTurmaId: notaTable.atividadeTurmaId
    })
      .from(notaTable)
      .where(and(
        eq(notaTable.alunoId, s.id),
        eq(notaTable.turmaDisciplinaId, turmaDisciplinaId)
      ));

    return {
      id: s.id,
      usuario: { nome: s.nome, imagem: s.imagem },
      notas
    };
  }));
}

export async function getAlunosDaTurma(turmaDisciplinaId: string) {
  const vinculacaoRaw = await db.select({ turmaId: tdTable.turmaId })
    .from(tdTable)
    .where(eq(tdTable.id, turmaDisciplinaId))
    .limit(1);

  const vinculacao = vinculacaoRaw[0];
  if (!vinculacao) return [];
  const { turmaId } = vinculacao;

  const results = await db.select({
    matricula: getTableColumns(matriculaTable),
    aluno: getTableColumns(alunoTable),
    user: getTableColumns(userTable),
  })
    .from(matriculaTable)
    .innerJoin(alunoTable, eq(matriculaTable.alunoId, alunoTable.id))
    .innerJoin(userTable, eq(alunoTable.usuarioId, userTable.id))
    .where(and(
      eq(matriculaTable.turmaId, turmaId),
      eq(matriculaTable.status, "ATIVA")
    ))
    .orderBy(asc(userTable.nome));

  return results.map(r => ({
    id: r.aluno.id,
    matricula: r.matricula.numero,
    nome: r.user.nome || "Estudante sem nome",
    email: r.user.email,
    imagem: r.user.imagem,
    dataNascimento: r.user.dataNascimento,
  }));
}