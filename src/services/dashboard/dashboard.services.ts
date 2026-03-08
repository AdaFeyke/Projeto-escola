import db from '~/lib/db';
import {
  user, aluno, turma, nota, pagamento, userEscola,
  matricula, professor, turmaDisciplina, atividadeTurma, alerta,
  disciplina
} from '~/lib/schema';
import { eq, and, or, gte, lte, sql, inArray, isNull, desc, asc, ne } from 'drizzle-orm';
import { getCurrentEscolaId } from '~/config/permission-manager';

// --- ADMIN DATA ---
export async function getAdminData() {
  const escolaId = await getCurrentEscolaId();

  const [
    totalAlunosRes,
    totalTurmasRes,
    avgGradeRes,
    totalRevenueRes,
    upcomingBirthdays,
    recentActivityRaw
  ] = await Promise.all([
    // Total Alunos
    db.select({ count: sql<number>`count(*)` })
      .from(aluno)
      .innerJoin(user, eq(aluno.usuarioId, user.id))
      .innerJoin(userEscola, eq(user.id, userEscola.userId))
      .where(and(eq(userEscola.escolaId, escolaId), eq(user.status, 'ATIVO'))),

    // Total Turmas
    db.select({ count: sql<number>`count(*)` })
      .from(turma)
      .where(eq(turma.escolaId, escolaId)),

    // Média de Notas
    db.select({ avg: sql<number>`avg(${nota.valor})` })
      .from(nota)
      .innerJoin(aluno, eq(nota.alunoId, aluno.id))
      .innerJoin(userEscola, eq(aluno.usuarioId, userEscola.userId))
      .where(eq(userEscola.escolaId, escolaId)),

    // Receita Total
    db.select({ sum: sql<number>`sum(${pagamento.valorPago})` })
      .from(pagamento)
      .where(eq(pagamento.escolaId, escolaId)),

    // Aniversariantes (Busca inicial para filtrar no JS como no Prisma)
    db.select({ nome: user.nome, dataNascimento: user.dataNascimento, imagem: user.imagem })
      .from(user)
      .innerJoin(userEscola, eq(user.id, userEscola.userId))
      .where(and(eq(userEscola.escolaId, escolaId), sql`${user.dataNascimento} IS NOT NULL`))
      .limit(5),

    // Atividade Recente
    db.select({
      nome: user.nome,
      imagem: user.imagem,
      papel: userEscola.papel,
      criadoEm: userEscola.criadoEm
    })
      .from(userEscola)
      .innerJoin(user, eq(userEscola.userId, user.id))
      .where(eq(userEscola.escolaId, escolaId))
      .orderBy(desc(userEscola.criadoEm))
      .limit(5)
  ]);

  // Lógica de filtro de aniversários (mantida conforme original)
  const now = new Date();
  const filteredBirthdays = upcomingBirthdays.filter(u => {
    if (!u.dataNascimento) return false;
    const bday = new Date(u.dataNascimento);
    bday.setFullYear(now.getFullYear());
    const diff = bday.getTime() - now.getTime();
    return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  });

  return {
    totalAlunos: Number(totalAlunosRes[0]?.count ?? 0),
    totalTurmas: Number(totalTurmasRes[0]?.count ?? 0),
    avgGrade: Number(avgGradeRes[0]?.avg ?? 0),
    totalRevenue: Number(totalRevenueRes[0]?.sum ?? 0),
    upcomingBirthdays: filteredBirthdays,
    recentActivity: recentActivityRaw.map(ra => ({
      user: ra.nome,
      role: ra.papel,
      date: ra.criadoEm,
      image: ra.imagem
    })),
  };
}

// --- PROFESSOR DATA ---
export async function getProfessorData(userId: string) {
  const escolaId = await getCurrentEscolaId();

  const professorData = await db.query.professor.findFirst({
    where: eq(professor.usuarioId, userId),
    with: {
      turmaDisciplinas: {
        with: {
          turma: true,
          disciplina: true
        }
      }
    }
  });

  if (!professorData) return null;

  const turmasIds = professorData.turmaDisciplinas.map(td => td.turmaId);
  if (turmasIds.length === 0) return { totalTurmas: 0, totalStudents: 0, upcomingActivities: [] };

  const [totalStudentsRes, upcomingActivities] = await Promise.all([
    db.select({ count: sql<number>`count(*)` })
      .from(matricula)
      .where(and(inArray(matricula.turmaId, turmasIds), eq(matricula.status, 'ATIVA'))),

    db.query.atividadeTurma.findMany({
      where: and(
        inArray(atividadeTurma.turmaId, turmasIds),
        gte(atividadeTurma.data, new Date().toISOString())
      ),
      with: { turma: true, disciplina: true },
      orderBy: [asc(atividadeTurma.data)],
      limit: 5
    })
  ]);

  return {
    totalTurmas: professorData.turmaDisciplinas.length,
    totalStudents: Number(totalStudentsRes[0]?.count ?? 0),
    upcomingActivities
  };
}

// --- STUDENT DATA ---
export async function getStudentData(userId: string) {
  const student = await db.query.aluno.findFirst({
    where: eq(aluno.usuarioId, userId),
    with: {
      matriculas: {
        where: eq(matricula.status, 'ATIVA'),
        with: { turma: true }
      }
    }
  });

  if (!student) return null;

  const firstTurmaId = student.matriculas[0]?.turmaId;

  const [avgGradeRes, upcomingExams] = await Promise.all([
    db.select({ avg: sql<number>`avg(${nota.valor})` })
      .from(nota)
      .where(eq(nota.alunoId, student.id)),

    firstTurmaId ? db.query.atividadeTurma.findMany({
      where: and(
        eq(atividadeTurma.turmaId, firstTurmaId),
        eq(atividadeTurma.tipo, 'PROVA'),
        gte(atividadeTurma.data, new Date().toISOString())
      ),
      with: { disciplina: true },
      orderBy: [asc(atividadeTurma.data)],
      limit: 3
    }) : Promise.resolve([])
  ]);

  return {
    avgGrade: Number(avgGradeRes[0]?.avg ?? 0),
    upcomingExams,
    turma: student.matriculas[0]?.turma?.nome || 'Não matriculado'
  };
}

// --- ALERTS ---
export async function getAlerts(userRole: any) {
  return await db.select()
    .from(alerta)
    .where(
      and(
        eq(alerta.ativo, true),
        or(
          eq(alerta.papel, userRole),
          isNull(alerta.papel)
        ),
        or(
          isNull(alerta.expiresAt),
          gte(alerta.expiresAt, new Date().toISOString())
        )
      )
    )
    .orderBy(desc(alerta.createdAt));
}