-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."MetodoPagamento" AS ENUM('PIX', 'BOLETO', 'CARTAO', 'DINHEIRO', 'TRANSFERENCIA');--> statement-breakpoint
CREATE TYPE "public"."PapelUsuario" AS ENUM('ADMINISTRADOR', 'PROFESSOR', 'ALUNO', 'RESPONSAVEL');--> statement-breakpoint
CREATE TYPE "public"."Status" AS ENUM('ATIVO', 'SUSPENSO', 'INATIVO');--> statement-breakpoint
CREATE TYPE "public"."StatusFinanceiro" AS ENUM('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO');--> statement-breakpoint
CREATE TYPE "public"."StatusFrequencia" AS ENUM('PRESENTE', 'AUSENTE', 'ATRASO');--> statement-breakpoint
CREATE TYPE "public"."StatusMatricula" AS ENUM('ATIVA', 'TRANCADA', 'TRANSFERIDA', 'CONCLUIDA', 'CANCELADA');--> statement-breakpoint
CREATE TYPE "public"."StatusPlanejamento" AS ENUM('RASCUNHO', 'PENDENTE', 'APROVADO', 'REJEITADO');--> statement-breakpoint
CREATE TYPE "public"."TipoAlerta" AS ENUM('INFO', 'AVISO', 'URGENTE');--> statement-breakpoint
CREATE TYPE "public"."TipoAtividade" AS ENUM('PROVA', 'TRABALHO', 'SEMINARIO', 'OUTRO', 'AULA');--> statement-breakpoint
CREATE TYPE "public"."TipoDia" AS ENUM('LETIVO_EXTRA', 'NAO_LETIVO_FERIADO', 'NAO_LETIVO_RECESSO', 'REUNIAO_PEDAGOGICA', 'EVENTO_ESCOLAR');--> statement-breakpoint
CREATE TYPE "public"."TipoPendencia" AS ENUM('MENSALIDADE', 'EVENTO', 'PRODUTO', 'EXTRA', 'OUTROS');--> statement-breakpoint
CREATE TABLE "VerificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Conta" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "Sessao" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionToken" text NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "UserEscola" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"escolaId" text NOT NULL,
	"papel" "PapelUsuario" DEFAULT 'ALUNO' NOT NULL,
	"criadoEm" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Escola" (
	"id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"cnpj" text,
	"endereco" text,
	"telefone" text,
	"email" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Serie" (
	"id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"escolaId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Turma" (
	"id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"codigo" text NOT NULL,
	"serieId" text NOT NULL,
	"anoLetivoId" text NOT NULL,
	"escolaId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Frequencia" (
	"id" text PRIMARY KEY NOT NULL,
	"data" timestamp(3) NOT NULL,
	"observacao" text,
	"alunoId" text NOT NULL,
	"turmaDisciplinaId" text NOT NULL,
	"status" "StatusFrequencia" DEFAULT 'PRESENTE' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"nome" text,
	"email" text NOT NULL,
	"emailVerificado" timestamp(3),
	"imagem" text,
	"senhaHash" text NOT NULL,
	"dataHoraCadastro" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deletedAt" timestamp(3),
	"status" "Status" DEFAULT 'ATIVO' NOT NULL,
	"dataNascimento" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "Professor" (
	"id" text PRIMARY KEY NOT NULL,
	"usuarioId" text NOT NULL,
	"cpf" text NOT NULL,
	"dataFimContrato" timestamp(3),
	"dataInicioContrato" timestamp(3) NOT NULL,
	"salarioBase" numeric(65, 30) NOT NULL,
	"tipoContrato" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TurmaDisciplina" (
	"id" text PRIMARY KEY NOT NULL,
	"turmaId" text NOT NULL,
	"disciplinaId" text NOT NULL,
	"professorId" text,
	"alunoId" text
);
--> statement-breakpoint
CREATE TABLE "Disciplina" (
	"id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"escolaId" text NOT NULL,
	"sigla" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Nota" (
	"id" text PRIMARY KEY NOT NULL,
	"valor" double precision NOT NULL,
	"descricao" text,
	"dataLancamento" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"alunoId" text NOT NULL,
	"professorId" text NOT NULL,
	"turmaDisciplinaId" text,
	"atividadeTurmaId" text
);
--> statement-breakpoint
CREATE TABLE "Aluno" (
	"id" text PRIMARY KEY NOT NULL,
	"usuarioId" text NOT NULL,
	"anoTransferido" integer,
	"escolaTransferida" text,
	"nacionalidade" text,
	"naturalidade" text,
	"bairroEndereco" text,
	"cep" text,
	"cidadeEndereco" text,
	"estadoEndereco" text,
	"numeroEndereco" text,
	"ruaEndereco" text
);
--> statement-breakpoint
CREATE TABLE "AnoLetivo" (
	"id" text PRIMARY KEY NOT NULL,
	"ano" integer NOT NULL,
	"escolaId" text NOT NULL,
	"anoAtual" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "QuestionarioPergunta" (
	"id" text PRIMARY KEY NOT NULL,
	"escolaId" text NOT NULL,
	"pergunta" text NOT NULL,
	"tipo" text,
	"ativa" boolean DEFAULT true NOT NULL,
	"criadoEm" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"alunoId" text
);
--> statement-breakpoint
CREATE TABLE "QuestionarioResposta" (
	"id" text PRIMARY KEY NOT NULL,
	"alunoId" text NOT NULL,
	"perguntaId" text NOT NULL,
	"resposta" text,
	"dataRegistro" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ResponsavelAluno" (
	"id" text PRIMARY KEY NOT NULL,
	"alunoId" text NOT NULL,
	"parentesco" text,
	"nome" text NOT NULL,
	"telefone" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Matricula" (
	"id" text PRIMARY KEY NOT NULL,
	"alunoId" text NOT NULL,
	"turmaId" text,
	"status" "StatusMatricula" DEFAULT 'ATIVA' NOT NULL,
	"dataMatricula" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"dataFim" timestamp(3),
	"numero" text NOT NULL,
	"sequencial" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Pendencia" (
	"id" text PRIMARY KEY NOT NULL,
	"escolaId" text NOT NULL,
	"alunoId" text NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"descricao" text NOT NULL,
	"dataVencimento" timestamp(3) NOT NULL,
	"status" "StatusFinanceiro" DEFAULT 'PENDENTE' NOT NULL,
	"tipo" "TipoPendencia" DEFAULT 'EVENTO' NOT NULL,
	"mesReferencia" integer,
	"anoReferencia" integer,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Evento" (
	"id" text PRIMARY KEY NOT NULL,
	"escolaId" text NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"dataEvento" timestamp(3) NOT NULL,
	"local" text,
	"valor" numeric(10, 2) DEFAULT '0' NOT NULL,
	"vagas" integer,
	"dataLimite" timestamp(3),
	"criadoEm" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ParticipanteEvento" (
	"id" text PRIMARY KEY NOT NULL,
	"eventoId" text NOT NULL,
	"alunoId" text NOT NULL,
	"confirmado" boolean DEFAULT false NOT NULL,
	"dataConfirmacao" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"pendenciaId" text
);
--> statement-breakpoint
CREATE TABLE "CalendarioEscolar" (
	"id" text PRIMARY KEY NOT NULL,
	"escolaId" text NOT NULL,
	"anoLetivoId" text NOT NULL,
	"titulo" text NOT NULL,
	"dataInicio" timestamp(3) NOT NULL,
	"dataFim" timestamp(3) NOT NULL,
	"tipo" "TipoDia" DEFAULT 'LETIVO_EXTRA' NOT NULL,
	"bloqueiaAula" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Pagamento" (
	"id" text PRIMARY KEY NOT NULL,
	"pendenciaId" text NOT NULL,
	"metodo" "MetodoPagamento" NOT NULL,
	"valorPago" numeric(10, 2) NOT NULL,
	"dataPagamento" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"comprovanteUrl" text,
	"transacaoId" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"escolaId" text NOT NULL,
	"adminId" text,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Alerta" (
	"id" text PRIMARY KEY NOT NULL,
	"titulo" text NOT NULL,
	"mensagem" text NOT NULL,
	"tipo" "TipoAlerta" DEFAULT 'INFO' NOT NULL,
	"papel" "PapelUsuario",
	"ativo" boolean DEFAULT true NOT NULL,
	"expiresAt" timestamp(3),
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "AtividadeTurma" (
	"id" text PRIMARY KEY NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text,
	"data" timestamp(3) NOT NULL,
	"tipo" "TipoAtividade" NOT NULL,
	"turmaId" text NOT NULL,
	"cicloId" text,
	"disciplinaId" text,
	"valorMaximo" double precision DEFAULT 10 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "CicloLetivo" (
	"id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"dataInicio" timestamp(3) NOT NULL,
	"dataFim" timestamp(3) NOT NULL,
	"escolaId" text NOT NULL,
	"anoLetivoId" text NOT NULL,
	"pontuacaoMaxima" double precision DEFAULT 10 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Planejamento" (
	"id" text PRIMARY KEY NOT NULL,
	"titulo" text NOT NULL,
	"objetivos" text,
	"data" timestamp(3) NOT NULL,
	"turmaId" text NOT NULL,
	"professorId" text,
	"escolaId" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"atividade" text,
	"conteudo" text,
	"diario" text,
	"metodologia" text,
	"observacoes" text,
	"status" "StatusPlanejamento" DEFAULT 'PENDENTE' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "DespesaEscola" (
	"id" text PRIMARY KEY NOT NULL,
	"escolaId" text NOT NULL,
	"descricao" text NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"data" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"categoria" text NOT NULL,
	"status" text DEFAULT 'PAGO' NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "_DisciplinaToPlanejamento" (
	"A" text NOT NULL,
	"B" text NOT NULL,
	CONSTRAINT "_DisciplinaToPlanejamento_AB_pkey" PRIMARY KEY("A","B")
);
--> statement-breakpoint
ALTER TABLE "Conta" ADD CONSTRAINT "Conta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Sessao" ADD CONSTRAINT "Sessao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "UserEscola" ADD CONSTRAINT "UserEscola_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "UserEscola" ADD CONSTRAINT "UserEscola_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "public"."Escola"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Serie" ADD CONSTRAINT "Serie_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "public"."Escola"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "public"."Serie"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_anoLetivoId_fkey" FOREIGN KEY ("anoLetivoId") REFERENCES "public"."AnoLetivo"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "public"."Escola"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Frequencia" ADD CONSTRAINT "Frequencia_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."Aluno"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Frequencia" ADD CONSTRAINT "Frequencia_turmaDisciplinaId_fkey" FOREIGN KEY ("turmaDisciplinaId") REFERENCES "public"."TurmaDisciplina"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Professor" ADD CONSTRAINT "Professor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TurmaDisciplina" ADD CONSTRAINT "TurmaDisciplina_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "public"."Turma"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TurmaDisciplina" ADD CONSTRAINT "TurmaDisciplina_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "public"."Disciplina"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TurmaDisciplina" ADD CONSTRAINT "TurmaDisciplina_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "public"."Professor"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TurmaDisciplina" ADD CONSTRAINT "TurmaDisciplina_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."Aluno"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Disciplina" ADD CONSTRAINT "Disciplina_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "public"."Escola"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."Aluno"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "public"."Professor"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_turmaDisciplinaId_fkey" FOREIGN KEY ("turmaDisciplinaId") REFERENCES "public"."TurmaDisciplina"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_atividadeTurmaId_fkey" FOREIGN KEY ("atividadeTurmaId") REFERENCES "public"."AtividadeTurma"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "AnoLetivo" ADD CONSTRAINT "AnoLetivo_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "public"."Escola"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "QuestionarioPergunta" ADD CONSTRAINT "QuestionarioPergunta_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "public"."Escola"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "QuestionarioPergunta" ADD CONSTRAINT "QuestionarioPergunta_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."Aluno"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "QuestionarioResposta" ADD CONSTRAINT "QuestionarioResposta_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."Aluno"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "QuestionarioResposta" ADD CONSTRAINT "QuestionarioResposta_perguntaId_fkey" FOREIGN KEY ("perguntaId") REFERENCES "public"."QuestionarioPergunta"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ResponsavelAluno" ADD CONSTRAINT "ResponsavelAluno_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."Aluno"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."Aluno"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "public"."Turma"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Pendencia" ADD CONSTRAINT "Pendencia_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."Aluno"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Pendencia" ADD CONSTRAINT "Pendencia_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "public"."Escola"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "public"."Escola"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ParticipanteEvento" ADD CONSTRAINT "ParticipanteEvento_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "public"."Evento"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ParticipanteEvento" ADD CONSTRAINT "ParticipanteEvento_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."Aluno"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ParticipanteEvento" ADD CONSTRAINT "ParticipanteEvento_pendenciaId_fkey" FOREIGN KEY ("pendenciaId") REFERENCES "public"."Pendencia"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "CalendarioEscolar" ADD CONSTRAINT "CalendarioEscolar_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "public"."Escola"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "CalendarioEscolar" ADD CONSTRAINT "CalendarioEscolar_anoLetivoId_fkey" FOREIGN KEY ("anoLetivoId") REFERENCES "public"."AnoLetivo"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_pendenciaId_fkey" FOREIGN KEY ("pendenciaId") REFERENCES "public"."Pendencia"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "public"."Escola"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "AtividadeTurma" ADD CONSTRAINT "AtividadeTurma_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "public"."Turma"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "AtividadeTurma" ADD CONSTRAINT "AtividadeTurma_cicloId_fkey" FOREIGN KEY ("cicloId") REFERENCES "public"."CicloLetivo"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "AtividadeTurma" ADD CONSTRAINT "AtividadeTurma_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "public"."Disciplina"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "CicloLetivo" ADD CONSTRAINT "CicloLetivo_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "public"."Escola"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "CicloLetivo" ADD CONSTRAINT "CicloLetivo_anoLetivoId_fkey" FOREIGN KEY ("anoLetivoId") REFERENCES "public"."AnoLetivo"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Planejamento" ADD CONSTRAINT "Planejamento_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "public"."Turma"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Planejamento" ADD CONSTRAINT "Planejamento_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "public"."Professor"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Planejamento" ADD CONSTRAINT "Planejamento_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "public"."Escola"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "DespesaEscola" ADD CONSTRAINT "DespesaEscola_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "public"."Escola"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_DisciplinaToPlanejamento" ADD CONSTRAINT "_DisciplinaToPlanejamento_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Disciplina"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_DisciplinaToPlanejamento" ADD CONSTRAINT "_DisciplinaToPlanejamento_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Planejamento"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken" USING btree ("identifier" text_ops,"token" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken" USING btree ("token" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Conta_provider_providerAccountId_key" ON "Conta" USING btree ("provider" text_ops,"providerAccountId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Sessao_sessionToken_key" ON "Sessao" USING btree ("sessionToken" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "UserEscola_userId_escolaId_key" ON "UserEscola" USING btree ("userId" text_ops,"escolaId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Escola_cnpj_key" ON "Escola" USING btree ("cnpj" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Serie_nome_escolaId_key" ON "Serie" USING btree ("nome" text_ops,"escolaId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Turma_codigo_escolaId_key" ON "Turma" USING btree ("codigo" text_ops,"escolaId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Turma_codigo_key" ON "Turma" USING btree ("codigo" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Turma_nome_serieId_anoLetivoId_escolaId_key" ON "Turma" USING btree ("nome" text_ops,"serieId" text_ops,"anoLetivoId" text_ops,"escolaId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Frequencia_alunoId_turmaDisciplinaId_data_key" ON "Frequencia" USING btree ("alunoId" timestamp_ops,"turmaDisciplinaId" text_ops,"data" timestamp_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "User_email_key" ON "User" USING btree ("email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Professor_cpf_key" ON "Professor" USING btree ("cpf" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Professor_usuarioId_key" ON "Professor" USING btree ("usuarioId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "TurmaDisciplina_turmaId_disciplinaId_key" ON "TurmaDisciplina" USING btree ("turmaId" text_ops,"disciplinaId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Disciplina_nome_escolaId_key" ON "Disciplina" USING btree ("nome" text_ops,"escolaId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Disciplina_sigla_escolaId_key" ON "Disciplina" USING btree ("sigla" text_ops,"escolaId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Aluno_usuarioId_key" ON "Aluno" USING btree ("usuarioId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "AnoLetivo_ano_escolaId_key" ON "AnoLetivo" USING btree ("ano" int4_ops,"escolaId" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "QuestionarioResposta_alunoId_perguntaId_key" ON "QuestionarioResposta" USING btree ("alunoId" text_ops,"perguntaId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Matricula_numero_key" ON "Matricula" USING btree ("numero" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Matricula_turmaId_sequencial_key" ON "Matricula" USING btree ("turmaId" int4_ops,"sequencial" int4_ops);--> statement-breakpoint
CREATE INDEX "Pendencia_alunoId_idx" ON "Pendencia" USING btree ("alunoId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Pendencia_alunoId_mesReferencia_anoReferencia_tipo_key" ON "Pendencia" USING btree ("alunoId" int4_ops,"mesReferencia" int4_ops,"anoReferencia" int4_ops,"tipo" enum_ops);--> statement-breakpoint
CREATE INDEX "Pendencia_escolaId_idx" ON "Pendencia" USING btree ("escolaId" text_ops);--> statement-breakpoint
CREATE INDEX "Evento_escolaId_idx" ON "Evento" USING btree ("escolaId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "ParticipanteEvento_eventoId_alunoId_key" ON "ParticipanteEvento" USING btree ("eventoId" text_ops,"alunoId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "ParticipanteEvento_pendenciaId_key" ON "ParticipanteEvento" USING btree ("pendenciaId" text_ops);--> statement-breakpoint
CREATE INDEX "CalendarioEscolar_escolaId_anoLetivoId_idx" ON "CalendarioEscolar" USING btree ("escolaId" text_ops,"anoLetivoId" text_ops);--> statement-breakpoint
CREATE INDEX "Pagamento_dataPagamento_idx" ON "Pagamento" USING btree ("dataPagamento" timestamp_ops);--> statement-breakpoint
CREATE INDEX "Pagamento_escolaId_idx" ON "Pagamento" USING btree ("escolaId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Pagamento_pendenciaId_key" ON "Pagamento" USING btree ("pendenciaId" text_ops);--> statement-breakpoint
CREATE INDEX "Alerta_ativo_papel_idx" ON "Alerta" USING btree ("ativo" bool_ops,"papel" bool_ops);--> statement-breakpoint
CREATE INDEX "Alerta_expiresAt_idx" ON "Alerta" USING btree ("expiresAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "AtividadeTurma_turmaId_data_idx" ON "AtividadeTurma" USING btree ("turmaId" text_ops,"data" text_ops);--> statement-breakpoint
CREATE INDEX "CicloLetivo_escolaId_anoLetivoId_idx" ON "CicloLetivo" USING btree ("escolaId" text_ops,"anoLetivoId" text_ops);--> statement-breakpoint
CREATE INDEX "Planejamento_escolaId_idx" ON "Planejamento" USING btree ("escolaId" text_ops);--> statement-breakpoint
CREATE INDEX "Planejamento_status_idx" ON "Planejamento" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "Planejamento_turmaId_idx" ON "Planejamento" USING btree ("turmaId" text_ops);--> statement-breakpoint
CREATE INDEX "DespesaEscola_escolaId_idx" ON "DespesaEscola" USING btree ("escolaId" text_ops);--> statement-breakpoint
CREATE INDEX "_DisciplinaToPlanejamento_B_index" ON "_DisciplinaToPlanejamento" USING btree ("B" text_ops);
*/