import { pgTable, uniqueIndex, text, timestamp, foreignKey, integer, numeric, doublePrecision, boolean, index, varchar, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const metodoPagamento = pgEnum("MetodoPagamento", ['PIX', 'BOLETO', 'CARTAO', 'DINHEIRO', 'TRANSFERENCIA'])
export const papelUsuario = pgEnum("PapelUsuario", ['ADMINISTRADOR', 'PROFESSOR', 'ALUNO', 'RESPONSAVEL'])
export const status = pgEnum("Status", ['ATIVO', 'SUSPENSO', 'INATIVO'])
export const statusFinanceiro = pgEnum("StatusFinanceiro", ['PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO'])
export const statusFrequencia = pgEnum("StatusFrequencia", ['PRESENTE', 'AUSENTE', 'ATRASO'])
export const statusMatricula = pgEnum("StatusMatricula", ['ATIVA', 'TRANCADA', 'TRANSFERIDA', 'CONCLUIDA', 'CANCELADA'])
export const statusPlanejamento = pgEnum("StatusPlanejamento", ['RASCUNHO', 'PENDENTE', 'APROVADO', 'REJEITADO'])
export const tipoAlerta = pgEnum("TipoAlerta", ['INFO', 'AVISO', 'URGENTE'])
export const tipoAtividade = pgEnum("TipoAtividade", ['PROVA', 'TRABALHO', 'SEMINARIO', 'OUTRO', 'AULA'])
export const tipoDia = pgEnum("TipoDia", ['LETIVO_EXTRA', 'NAO_LETIVO_FERIADO', 'NAO_LETIVO_RECESSO', 'REUNIAO_PEDAGOGICA', 'EVENTO_ESCOLAR'])
export const tipoPendencia = pgEnum("TipoPendencia", ['MENSALIDADE', 'EVENTO', 'PRODUTO', 'EXTRA', 'OUTROS'])


export const verificationToken = pgTable("VerificationToken", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("VerificationToken_identifier_token_key").using("btree", table.identifier.asc().nullsLast().op("text_ops"), table.token.asc().nullsLast().op("text_ops")),
	uniqueIndex("VerificationToken_token_key").using("btree", table.token.asc().nullsLast().op("text_ops")),
]);

export const conta = pgTable("Conta", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text().notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
}, (table) => [
	uniqueIndex("Conta_provider_providerAccountId_key").using("btree", table.provider.asc().nullsLast().op("text_ops"), table.providerAccountId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Conta_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const sessao = pgTable("Sessao", {
	id: text().primaryKey().notNull(),
	sessionToken: text().notNull(),
	userId: text().notNull(),
	expires: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("Sessao_sessionToken_key").using("btree", table.sessionToken.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Sessao_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const userEscola = pgTable("UserEscola", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	escolaId: text().notNull(),
	papel: papelUsuario().default('ALUNO').notNull(),
	criadoEm: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("UserEscola_userId_escolaId_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.escolaId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "UserEscola_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.escolaId],
			foreignColumns: [escola.id],
			name: "UserEscola_escolaId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const escola = pgTable("Escola", {
	id: text().primaryKey().notNull(),
	nome: text().notNull(),
	cnpj: text(),
	endereco: text(),
	telefone: text(),
	email: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("Escola_cnpj_key").using("btree", table.cnpj.asc().nullsLast().op("text_ops")),
]);

export const serie = pgTable("Serie", {
	id: text().primaryKey().notNull(),
	nome: text().notNull(),
	escolaId: text().notNull(),
}, (table) => [
	uniqueIndex("Serie_nome_escolaId_key").using("btree", table.nome.asc().nullsLast().op("text_ops"), table.escolaId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.escolaId],
			foreignColumns: [escola.id],
			name: "Serie_escolaId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const turma = pgTable("Turma", {
	id: text().primaryKey().notNull(),
	nome: text().notNull(),
	codigo: text().notNull(),
	serieId: text().notNull(),
	anoLetivoId: text().notNull(),
	escolaId: text().notNull(),
}, (table) => [
	uniqueIndex("Turma_codigo_escolaId_key").using("btree", table.codigo.asc().nullsLast().op("text_ops"), table.escolaId.asc().nullsLast().op("text_ops")),
	uniqueIndex("Turma_codigo_key").using("btree", table.codigo.asc().nullsLast().op("text_ops")),
	uniqueIndex("Turma_nome_serieId_anoLetivoId_escolaId_key").using("btree", table.nome.asc().nullsLast().op("text_ops"), table.serieId.asc().nullsLast().op("text_ops"), table.anoLetivoId.asc().nullsLast().op("text_ops"), table.escolaId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.serieId],
			foreignColumns: [serie.id],
			name: "Turma_serieId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.anoLetivoId],
			foreignColumns: [anoLetivo.id],
			name: "Turma_anoLetivoId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.escolaId],
			foreignColumns: [escola.id],
			name: "Turma_escolaId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const frequencia = pgTable("Frequencia", {
	id: text().primaryKey().notNull(),
	data: timestamp({ precision: 3, mode: 'string' }).notNull(),
	observacao: text(),
	alunoId: text().notNull(),
	turmaDisciplinaId: text().notNull(),
	status: statusFrequencia().default('PRESENTE').notNull(),
}, (table) => [
	uniqueIndex("Frequencia_alunoId_turmaDisciplinaId_data_key").using("btree", table.alunoId.asc().nullsLast().op("timestamp_ops"), table.turmaDisciplinaId.asc().nullsLast().op("text_ops"), table.data.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.alunoId],
			foreignColumns: [aluno.id],
			name: "Frequencia_alunoId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.turmaDisciplinaId],
			foreignColumns: [turmaDisciplina.id],
			name: "Frequencia_turmaDisciplinaId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const user = pgTable("User", {
	id: text().primaryKey().notNull(),
	nome: text(),
	email: text().notNull(),
	emailVerificado: timestamp({ precision: 3, mode: 'string' }),
	imagem: text(),
	senhaHash: text().notNull(),
	dataHoraCadastro: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp({ precision: 3, mode: 'string' }),
	status: status().default('ATIVO').notNull(),
	dataNascimento: timestamp({ precision: 3, mode: 'string' }),
}, (table) => [
	uniqueIndex("User_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
]);

export const professor = pgTable("Professor", {
	id: text().primaryKey().notNull(),
	usuarioId: text().notNull(),
	cpf: text().notNull(),
	dataFimContrato: timestamp({ precision: 3, mode: 'string' }),
	dataInicioContrato: timestamp({ precision: 3, mode: 'string' }).notNull(),
	salarioBase: numeric({ precision: 65, scale:  30 }).notNull(),
	tipoContrato: text().notNull(),
}, (table) => [
	uniqueIndex("Professor_cpf_key").using("btree", table.cpf.asc().nullsLast().op("text_ops")),
	uniqueIndex("Professor_usuarioId_key").using("btree", table.usuarioId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.usuarioId],
			foreignColumns: [user.id],
			name: "Professor_usuarioId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const turmaDisciplina = pgTable("TurmaDisciplina", {
	id: text().primaryKey().notNull(),
	turmaId: text().notNull(),
	disciplinaId: text().notNull(),
	professorId: text(),
	alunoId: text(),
}, (table) => [
	uniqueIndex("TurmaDisciplina_turmaId_disciplinaId_key").using("btree", table.turmaId.asc().nullsLast().op("text_ops"), table.disciplinaId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.turmaId],
			foreignColumns: [turma.id],
			name: "TurmaDisciplina_turmaId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.disciplinaId],
			foreignColumns: [disciplina.id],
			name: "TurmaDisciplina_disciplinaId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.professorId],
			foreignColumns: [professor.id],
			name: "TurmaDisciplina_professorId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.alunoId],
			foreignColumns: [aluno.id],
			name: "TurmaDisciplina_alunoId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const disciplina = pgTable("Disciplina", {
	id: text().primaryKey().notNull(),
	nome: text().notNull(),
	escolaId: text().notNull(),
	sigla: text().notNull(),
}, (table) => [
	uniqueIndex("Disciplina_nome_escolaId_key").using("btree", table.nome.asc().nullsLast().op("text_ops"), table.escolaId.asc().nullsLast().op("text_ops")),
	uniqueIndex("Disciplina_sigla_escolaId_key").using("btree", table.sigla.asc().nullsLast().op("text_ops"), table.escolaId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.escolaId],
			foreignColumns: [escola.id],
			name: "Disciplina_escolaId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const nota = pgTable("Nota", {
	id: text().primaryKey().notNull(),
	valor: doublePrecision().notNull(),
	descricao: text(),
	dataLancamento: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	alunoId: text().notNull(),
	professorId: text().notNull(),
	turmaDisciplinaId: text(),
	atividadeTurmaId: text(),
}, (table) => [
	foreignKey({
			columns: [table.alunoId],
			foreignColumns: [aluno.id],
			name: "Nota_alunoId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.professorId],
			foreignColumns: [professor.id],
			name: "Nota_professorId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.turmaDisciplinaId],
			foreignColumns: [turmaDisciplina.id],
			name: "Nota_turmaDisciplinaId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.atividadeTurmaId],
			foreignColumns: [atividadeTurma.id],
			name: "Nota_atividadeTurmaId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const aluno = pgTable("Aluno", {
	id: text().primaryKey().notNull(),
	usuarioId: text().notNull(),
	anoTransferido: integer(),
	escolaTransferida: text(),
	nacionalidade: text(),
	naturalidade: text(),
	bairroEndereco: text(),
	cep: text(),
	cidadeEndereco: text(),
	estadoEndereco: text(),
	numeroEndereco: text(),
	ruaEndereco: text(),
}, (table) => [
	uniqueIndex("Aluno_usuarioId_key").using("btree", table.usuarioId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.usuarioId],
			foreignColumns: [user.id],
			name: "Aluno_usuarioId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const anoLetivo = pgTable("AnoLetivo", {
	id: text().primaryKey().notNull(),
	ano: integer().notNull(),
	escolaId: text().notNull(),
	anoAtual: boolean().default(false).notNull(),
}, (table) => [
	uniqueIndex("AnoLetivo_ano_escolaId_key").using("btree", table.ano.asc().nullsLast().op("int4_ops"), table.escolaId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.escolaId],
			foreignColumns: [escola.id],
			name: "AnoLetivo_escolaId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const questionarioPergunta = pgTable("QuestionarioPergunta", {
	id: text().primaryKey().notNull(),
	escolaId: text().notNull(),
	pergunta: text().notNull(),
	tipo: text(),
	ativa: boolean().default(true).notNull(),
	criadoEm: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	alunoId: text(),
}, (table) => [
	foreignKey({
			columns: [table.escolaId],
			foreignColumns: [escola.id],
			name: "QuestionarioPergunta_escolaId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.alunoId],
			foreignColumns: [aluno.id],
			name: "QuestionarioPergunta_alunoId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const questionarioResposta = pgTable("QuestionarioResposta", {
	id: text().primaryKey().notNull(),
	alunoId: text().notNull(),
	perguntaId: text().notNull(),
	resposta: text(),
	dataRegistro: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("QuestionarioResposta_alunoId_perguntaId_key").using("btree", table.alunoId.asc().nullsLast().op("text_ops"), table.perguntaId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.alunoId],
			foreignColumns: [aluno.id],
			name: "QuestionarioResposta_alunoId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.perguntaId],
			foreignColumns: [questionarioPergunta.id],
			name: "QuestionarioResposta_perguntaId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const responsavelAluno = pgTable("ResponsavelAluno", {
	id: text().primaryKey().notNull(),
	alunoId: text().notNull(),
	parentesco: text(),
	nome: text().notNull(),
	telefone: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.alunoId],
			foreignColumns: [aluno.id],
			name: "ResponsavelAluno_alunoId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const matricula = pgTable("Matricula", {
	id: text().primaryKey().notNull(),
	alunoId: text().notNull(),
	turmaId: text(),
	status: statusMatricula().default('ATIVA').notNull(),
	dataMatricula: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	dataFim: timestamp({ precision: 3, mode: 'string' }),
	numero: text().notNull(),
	sequencial: integer().notNull(),
}, (table) => [
	uniqueIndex("Matricula_numero_key").using("btree", table.numero.asc().nullsLast().op("text_ops")),
	uniqueIndex("Matricula_turmaId_sequencial_key").using("btree", table.turmaId.asc().nullsLast().op("int4_ops"), table.sequencial.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.alunoId],
			foreignColumns: [aluno.id],
			name: "Matricula_alunoId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.turmaId],
			foreignColumns: [turma.id],
			name: "Matricula_turmaId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const pendencia = pgTable("Pendencia", {
	id: text().primaryKey().notNull(),
	escolaId: text().notNull(),
	alunoId: text().notNull(),
	valor: numeric({ precision: 10, scale:  2 }).notNull(),
	descricao: text().notNull(),
	dataVencimento: timestamp({ precision: 3, mode: 'string' }).notNull(),
	status: statusFinanceiro().default('PENDENTE').notNull(),
	tipo: tipoPendencia().default('EVENTO').notNull(),
	mesReferencia: integer(),
	anoReferencia: integer(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("Pendencia_alunoId_idx").using("btree", table.alunoId.asc().nullsLast().op("text_ops")),
	uniqueIndex("Pendencia_alunoId_mesReferencia_anoReferencia_tipo_key").using("btree", table.alunoId.asc().nullsLast().op("int4_ops"), table.mesReferencia.asc().nullsLast().op("int4_ops"), table.anoReferencia.asc().nullsLast().op("int4_ops"), table.tipo.asc().nullsLast().op("enum_ops")),
	index("Pendencia_escolaId_idx").using("btree", table.escolaId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.alunoId],
			foreignColumns: [aluno.id],
			name: "Pendencia_alunoId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.escolaId],
			foreignColumns: [escola.id],
			name: "Pendencia_escolaId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const evento = pgTable("Evento", {
	id: text().primaryKey().notNull(),
	escolaId: text().notNull(),
	nome: text().notNull(),
	descricao: text(),
	dataEvento: timestamp({ precision: 3, mode: 'string' }).notNull(),
	local: text(),
	valor: numeric({ precision: 10, scale:  2 }).default('0').notNull(),
	vagas: integer(),
	dataLimite: timestamp({ precision: 3, mode: 'string' }),
	criadoEm: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("Evento_escolaId_idx").using("btree", table.escolaId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.escolaId],
			foreignColumns: [escola.id],
			name: "Evento_escolaId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const participanteEvento = pgTable("ParticipanteEvento", {
	id: text().primaryKey().notNull(),
	eventoId: text().notNull(),
	alunoId: text().notNull(),
	confirmado: boolean().default(false).notNull(),
	dataConfirmacao: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	pendenciaId: text(),
}, (table) => [
	uniqueIndex("ParticipanteEvento_eventoId_alunoId_key").using("btree", table.eventoId.asc().nullsLast().op("text_ops"), table.alunoId.asc().nullsLast().op("text_ops")),
	uniqueIndex("ParticipanteEvento_pendenciaId_key").using("btree", table.pendenciaId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.eventoId],
			foreignColumns: [evento.id],
			name: "ParticipanteEvento_eventoId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.alunoId],
			foreignColumns: [aluno.id],
			name: "ParticipanteEvento_alunoId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.pendenciaId],
			foreignColumns: [pendencia.id],
			name: "ParticipanteEvento_pendenciaId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const calendarioEscolar = pgTable("CalendarioEscolar", {
	id: text().primaryKey().notNull(),
	escolaId: text().notNull(),
	anoLetivoId: text().notNull(),
	titulo: text().notNull(),
	dataInicio: timestamp({ precision: 3, mode: 'string' }).notNull(),
	dataFim: timestamp({ precision: 3, mode: 'string' }).notNull(),
	tipo: tipoDia().default('LETIVO_EXTRA').notNull(),
	bloqueiaAula: boolean().default(false).notNull(),
}, (table) => [
	index("CalendarioEscolar_escolaId_anoLetivoId_idx").using("btree", table.escolaId.asc().nullsLast().op("text_ops"), table.anoLetivoId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.escolaId],
			foreignColumns: [escola.id],
			name: "CalendarioEscolar_escolaId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.anoLetivoId],
			foreignColumns: [anoLetivo.id],
			name: "CalendarioEscolar_anoLetivoId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const pagamento = pgTable("Pagamento", {
	id: text().primaryKey().notNull(),
	pendenciaId: text().notNull(),
	metodo: metodoPagamento().notNull(),
	valorPago: numeric({ precision: 10, scale:  2 }).notNull(),
	dataPagamento: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	comprovanteUrl: text(),
	transacaoId: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	escolaId: text().notNull(),
	adminId: text(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("Pagamento_dataPagamento_idx").using("btree", table.dataPagamento.asc().nullsLast().op("timestamp_ops")),
	index("Pagamento_escolaId_idx").using("btree", table.escolaId.asc().nullsLast().op("text_ops")),
	uniqueIndex("Pagamento_pendenciaId_key").using("btree", table.pendenciaId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.pendenciaId],
			foreignColumns: [pendencia.id],
			name: "Pagamento_pendenciaId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.escolaId],
			foreignColumns: [escola.id],
			name: "Pagamento_escolaId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const alerta = pgTable("Alerta", {
	id: text().primaryKey().notNull(),
	titulo: text().notNull(),
	mensagem: text().notNull(),
	tipo: tipoAlerta().default('INFO').notNull(),
	papel: papelUsuario(),
	ativo: boolean().default(true).notNull(),
	expiresAt: timestamp({ precision: 3, mode: 'string' }),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("Alerta_ativo_papel_idx").using("btree", table.ativo.asc().nullsLast().op("bool_ops"), table.papel.asc().nullsLast().op("bool_ops")),
	index("Alerta_expiresAt_idx").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
]);

export const atividadeTurma = pgTable("AtividadeTurma", {
	id: text().primaryKey().notNull(),
	titulo: text().notNull(),
	descricao: text(),
	data: timestamp({ precision: 3, mode: 'string' }).notNull(),
	tipo: tipoAtividade().notNull(),
	turmaId: text().notNull(),
	cicloId: text(),
	disciplinaId: text(),
	valorMaximo: doublePrecision().default(10).notNull(),
}, (table) => [
	index("AtividadeTurma_turmaId_data_idx").using("btree", table.turmaId.asc().nullsLast().op("text_ops"), table.data.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.turmaId],
			foreignColumns: [turma.id],
			name: "AtividadeTurma_turmaId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.cicloId],
			foreignColumns: [cicloLetivo.id],
			name: "AtividadeTurma_cicloId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.disciplinaId],
			foreignColumns: [disciplina.id],
			name: "AtividadeTurma_disciplinaId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const cicloLetivo = pgTable("CicloLetivo", {
	id: text().primaryKey().notNull(),
	nome: text().notNull(),
	dataInicio: timestamp({ precision: 3, mode: 'string' }).notNull(),
	dataFim: timestamp({ precision: 3, mode: 'string' }).notNull(),
	escolaId: text().notNull(),
	anoLetivoId: text().notNull(),
	pontuacaoMaxima: doublePrecision().default(10).notNull(),
}, (table) => [
	index("CicloLetivo_escolaId_anoLetivoId_idx").using("btree", table.escolaId.asc().nullsLast().op("text_ops"), table.anoLetivoId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.escolaId],
			foreignColumns: [escola.id],
			name: "CicloLetivo_escolaId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.anoLetivoId],
			foreignColumns: [anoLetivo.id],
			name: "CicloLetivo_anoLetivoId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const prismaMigrations = pgTable("_prisma_migrations", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	checksum: varchar({ length: 64 }).notNull(),
	finishedAt: timestamp("finished_at", { withTimezone: true, mode: 'string' }),
	migrationName: varchar("migration_name", { length: 255 }).notNull(),
	logs: text(),
	rolledBackAt: timestamp("rolled_back_at", { withTimezone: true, mode: 'string' }),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const planejamento = pgTable("Planejamento", {
	id: text().primaryKey().notNull(),
	titulo: text().notNull(),
	objetivos: text(),
	data: timestamp({ precision: 3, mode: 'string' }).notNull(),
	turmaId: text().notNull(),
	professorId: text(),
	escolaId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	atividade: text(),
	conteudo: text(),
	diario: text(),
	metodologia: text(),
	observacoes: text(),
	status: statusPlanejamento().default('PENDENTE').notNull(),
}, (table) => [
	index("Planejamento_escolaId_idx").using("btree", table.escolaId.asc().nullsLast().op("text_ops")),
	index("Planejamento_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("Planejamento_turmaId_idx").using("btree", table.turmaId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.turmaId],
			foreignColumns: [turma.id],
			name: "Planejamento_turmaId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.professorId],
			foreignColumns: [professor.id],
			name: "Planejamento_professorId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.escolaId],
			foreignColumns: [escola.id],
			name: "Planejamento_escolaId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const despesaEscola = pgTable("DespesaEscola", {
	id: text().primaryKey().notNull(),
	escolaId: text().notNull(),
	descricao: text().notNull(),
	valor: numeric({ precision: 10, scale:  2 }).notNull(),
	data: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	categoria: text().notNull(),
	status: text().default('PAGO').notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("DespesaEscola_escolaId_idx").using("btree", table.escolaId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.escolaId],
			foreignColumns: [escola.id],
			name: "DespesaEscola_escolaId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const disciplinaToPlanejamento = pgTable("_DisciplinaToPlanejamento", {
	a: text("A").notNull(),
	b: text("B").notNull(),
}, (table) => [
	index().using("btree", table.b.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.a],
			foreignColumns: [disciplina.id],
			name: "_DisciplinaToPlanejamento_A_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.b],
			foreignColumns: [planejamento.id],
			name: "_DisciplinaToPlanejamento_B_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	primaryKey({ columns: [table.a, table.b], name: "_DisciplinaToPlanejamento_AB_pkey"}),
]);
