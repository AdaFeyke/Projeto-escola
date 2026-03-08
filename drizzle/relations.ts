import { relations } from "drizzle-orm/relations";
import { user, conta, sessao, userEscola, escola, serie, turma, anoLetivo, aluno, frequencia, turmaDisciplina, professor, disciplina, nota, atividadeTurma, questionarioPergunta, questionarioResposta, responsavelAluno, matricula, pendencia, evento, participanteEvento, calendarioEscolar, pagamento, cicloLetivo, planejamento, despesaEscola, disciplinaToPlanejamento } from "../src/lib/schema";

export const contaRelations = relations(conta, ({ one }) => ({
	user: one(user, {
		fields: [conta.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({ many }) => ({
	contas: many(conta),
	sessaos: many(sessao),
	userEscolas: many(userEscola),
	professors: many(professor),
	alunos: many(aluno),
}));

export const sessaoRelations = relations(sessao, ({ one }) => ({
	user: one(user, {
		fields: [sessao.userId],
		references: [user.id]
	}),
}));

export const userEscolaRelations = relations(userEscola, ({ one }) => ({
	user: one(user, {
		fields: [userEscola.userId],
		references: [user.id]
	}),
	escola: one(escola, {
		fields: [userEscola.escolaId],
		references: [escola.id]
	}),
}));

export const escolaRelations = relations(escola, ({ many }) => ({
	userEscolas: many(userEscola),
	series: many(serie),
	turmas: many(turma),
	disciplinas: many(disciplina),
	anoLetivos: many(anoLetivo),
	questionarioPerguntas: many(questionarioPergunta),
	pendencias: many(pendencia),
	eventos: many(evento),
	calendarioEscolars: many(calendarioEscolar),
	pagamentos: many(pagamento),
	cicloLetivos: many(cicloLetivo),
	planejamentos: many(planejamento),
	despesaEscolas: many(despesaEscola),
}));

export const serieRelations = relations(serie, ({ one, many }) => ({
	escola: one(escola, {
		fields: [serie.escolaId],
		references: [escola.id]
	}),
	turmas: many(turma),
}));

export const turmaRelations = relations(turma, ({ one, many }) => ({
	serie: one(serie, {
		fields: [turma.serieId],
		references: [serie.id]
	}),
	anoLetivo: one(anoLetivo, {
		fields: [turma.anoLetivoId],
		references: [anoLetivo.id]
	}),
	escola: one(escola, {
		fields: [turma.escolaId],
		references: [escola.id]
	}),
	turmaDisciplinas: many(turmaDisciplina),
	matriculas: many(matricula),
	atividadeTurmas: many(atividadeTurma),
	planejamentos: many(planejamento),
}));

export const anoLetivoRelations = relations(anoLetivo, ({ one, many }) => ({
	turmas: many(turma),
	escola: one(escola, {
		fields: [anoLetivo.escolaId],
		references: [escola.id]
	}),
	calendarioEscolars: many(calendarioEscolar),
	cicloLetivos: many(cicloLetivo),
}));

export const frequenciaRelations = relations(frequencia, ({ one }) => ({
	aluno: one(aluno, {
		fields: [frequencia.alunoId],
		references: [aluno.id]
	}),
	turmaDisciplina: one(turmaDisciplina, {
		fields: [frequencia.turmaDisciplinaId],
		references: [turmaDisciplina.id]
	}),
}));

export const alunoRelations = relations(aluno, ({ one, many }) => ({
	frequencias: many(frequencia),
	turmaDisciplinas: many(turmaDisciplina),
	notas: many(nota),
	user: one(user, {
		fields: [aluno.usuarioId],
		references: [user.id]
	}),
	questionarioPerguntas: many(questionarioPergunta),
	questionarioRespostas: many(questionarioResposta),
	responsavelAlunos: many(responsavelAluno),
	matriculas: many(matricula),
	pendencias: many(pendencia),
	participanteEventos: many(participanteEvento),
}));

export const turmaDisciplinaRelations = relations(turmaDisciplina, ({ one, many }) => ({
	frequencias: many(frequencia),
	turma: one(turma, {
		fields: [turmaDisciplina.turmaId],
		references: [turma.id]
	}),
	disciplina: one(disciplina, {
		fields: [turmaDisciplina.disciplinaId],
		references: [disciplina.id]
	}),
	professor: one(professor, {
		fields: [turmaDisciplina.professorId],
		references: [professor.id]
	}),
	aluno: one(aluno, {
		fields: [turmaDisciplina.alunoId],
		references: [aluno.id]
	}),
	notas: many(nota),
}));

export const professorRelations = relations(professor, ({ one, many }) => ({
	user: one(user, {
		fields: [professor.usuarioId],
		references: [user.id]
	}),
	turmaDisciplinas: many(turmaDisciplina),
	notas: many(nota),
	planejamentos: many(planejamento),
}));

export const disciplinaRelations = relations(disciplina, ({ one, many }) => ({
	turmaDisciplinas: many(turmaDisciplina),
	escola: one(escola, {
		fields: [disciplina.escolaId],
		references: [escola.id]
	}),
	atividadeTurmas: many(atividadeTurma),
	disciplinaToPlanejamentos: many(disciplinaToPlanejamento),
}));

export const notaRelations = relations(nota, ({ one }) => ({
	aluno: one(aluno, {
		fields: [nota.alunoId],
		references: [aluno.id]
	}),
	professor: one(professor, {
		fields: [nota.professorId],
		references: [professor.id]
	}),
	turmaDisciplina: one(turmaDisciplina, {
		fields: [nota.turmaDisciplinaId],
		references: [turmaDisciplina.id]
	}),
	atividadeTurma: one(atividadeTurma, {
		fields: [nota.atividadeTurmaId],
		references: [atividadeTurma.id]
	}),
}));

export const atividadeTurmaRelations = relations(atividadeTurma, ({ one, many }) => ({
	notas: many(nota),
	turma: one(turma, {
		fields: [atividadeTurma.turmaId],
		references: [turma.id]
	}),
	cicloLetivo: one(cicloLetivo, {
		fields: [atividadeTurma.cicloId],
		references: [cicloLetivo.id]
	}),
	disciplina: one(disciplina, {
		fields: [atividadeTurma.disciplinaId],
		references: [disciplina.id]
	}),
}));

export const questionarioPerguntaRelations = relations(questionarioPergunta, ({ one, many }) => ({
	escola: one(escola, {
		fields: [questionarioPergunta.escolaId],
		references: [escola.id]
	}),
	aluno: one(aluno, {
		fields: [questionarioPergunta.alunoId],
		references: [aluno.id]
	}),
	questionarioRespostas: many(questionarioResposta),
}));

export const questionarioRespostaRelations = relations(questionarioResposta, ({ one }) => ({
	aluno: one(aluno, {
		fields: [questionarioResposta.alunoId],
		references: [aluno.id]
	}),
	questionarioPergunta: one(questionarioPergunta, {
		fields: [questionarioResposta.perguntaId],
		references: [questionarioPergunta.id]
	}),
}));

export const responsavelAlunoRelations = relations(responsavelAluno, ({ one }) => ({
	aluno: one(aluno, {
		fields: [responsavelAluno.alunoId],
		references: [aluno.id]
	}),
}));

export const matriculaRelations = relations(matricula, ({ one }) => ({
	aluno: one(aluno, {
		fields: [matricula.alunoId],
		references: [aluno.id]
	}),
	turma: one(turma, {
		fields: [matricula.turmaId],
		references: [turma.id]
	}),
}));

export const pendenciaRelations = relations(pendencia, ({ one, many }) => ({
	aluno: one(aluno, {
		fields: [pendencia.alunoId],
		references: [aluno.id]
	}),
	escola: one(escola, {
		fields: [pendencia.escolaId],
		references: [escola.id]
	}),
	participanteEventos: many(participanteEvento),
	pagamentos: many(pagamento),
}));

export const eventoRelations = relations(evento, ({ one, many }) => ({
	escola: one(escola, {
		fields: [evento.escolaId],
		references: [escola.id]
	}),
	participanteEventos: many(participanteEvento),
}));

export const participanteEventoRelations = relations(participanteEvento, ({ one }) => ({
	evento: one(evento, {
		fields: [participanteEvento.eventoId],
		references: [evento.id]
	}),
	aluno: one(aluno, {
		fields: [participanteEvento.alunoId],
		references: [aluno.id]
	}),
	pendencia: one(pendencia, {
		fields: [participanteEvento.pendenciaId],
		references: [pendencia.id]
	}),
}));

export const calendarioEscolarRelations = relations(calendarioEscolar, ({ one }) => ({
	escola: one(escola, {
		fields: [calendarioEscolar.escolaId],
		references: [escola.id]
	}),
	anoLetivo: one(anoLetivo, {
		fields: [calendarioEscolar.anoLetivoId],
		references: [anoLetivo.id]
	}),
}));

export const pagamentoRelations = relations(pagamento, ({ one }) => ({
	pendencia: one(pendencia, {
		fields: [pagamento.pendenciaId],
		references: [pendencia.id]
	}),
	escola: one(escola, {
		fields: [pagamento.escolaId],
		references: [escola.id]
	}),
}));

export const cicloLetivoRelations = relations(cicloLetivo, ({ one, many }) => ({
	atividadeTurmas: many(atividadeTurma),
	escola: one(escola, {
		fields: [cicloLetivo.escolaId],
		references: [escola.id]
	}),
	anoLetivo: one(anoLetivo, {
		fields: [cicloLetivo.anoLetivoId],
		references: [anoLetivo.id]
	}),
}));

export const planejamentoRelations = relations(planejamento, ({ one, many }) => ({
	turma: one(turma, {
		fields: [planejamento.turmaId],
		references: [turma.id]
	}),
	professor: one(professor, {
		fields: [planejamento.professorId],
		references: [professor.id]
	}),
	escola: one(escola, {
		fields: [planejamento.escolaId],
		references: [escola.id]
	}),
	disciplinaToPlanejamentos: many(disciplinaToPlanejamento),
}));

export const despesaEscolaRelations = relations(despesaEscola, ({ one }) => ({
	escola: one(escola, {
		fields: [despesaEscola.escolaId],
		references: [escola.id]
	}),
}));

export const disciplinaToPlanejamentoRelations = relations(disciplinaToPlanejamento, ({ one }) => ({
	disciplina: one(disciplina, {
		fields: [disciplinaToPlanejamento.a],
		references: [disciplina.id]
	}),
	planejamento: one(planejamento, {
		fields: [disciplinaToPlanejamento.b],
		references: [planejamento.id]
	}),
}));