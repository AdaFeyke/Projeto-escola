import db from "~/lib/db";
import {
  evento as eventoTable,
  participanteEvento as participanteTable,
  aluno as alunoTable,
  user as userTable,
  matricula as matriculaTable,
  turma as turmaTable,
  pendencia as pendenciaTable
} from "~/lib/schema";
import { eq, and, sql, desc, asc, getTableColumns } from "drizzle-orm";
import type {
  EventoCreateInput,
  EventoUpdateInput,
} from "./event.service.types";
import { v4 as uuidv4 } from 'uuid';

export class EventoService {
  static async listByEscola(escolaId: string) {
    const eventosRaw = await db.select({
      ...getTableColumns(eventoTable),
      participantesCount: sql<number>`(SELECT count(*) FROM "ParticipanteEvento" WHERE "eventoId" = ${eventoTable.id})`
    })
      .from(eventoTable)
      .where(eq(eventoTable.escolaId, escolaId))
      .orderBy(asc(eventoTable.dataEvento));

    const eventsWithDetailedParticipantes = await Promise.all(eventosRaw.map(async (evento) => {
      const participantes = await db.select({
        confirmado: participanteTable.confirmado,
        pago: sql<boolean>`CASE WHEN ${pendenciaTable.status} = 'PAGO' THEN true ELSE false END`,
        nome: userTable.nome,
        imagem: userTable.imagem,
        dataNascimento: userTable.dataNascimento,
        matricula: matriculaTable.numero,
        turma: turmaTable.nome,
        pendenciaStatus: pendenciaTable.status
      })
        .from(participanteTable)
        .innerJoin(alunoTable, eq(participanteTable.alunoId, alunoTable.id))
        .innerJoin(userTable, eq(alunoTable.usuarioId, userTable.id))
        .leftJoin(pendenciaTable, eq(participanteTable.pendenciaId, pendenciaTable.id))
        .leftJoin(matriculaTable, and(eq(alunoTable.id, matriculaTable.alunoId), eq(matriculaTable.status, "ATIVA")))
        .leftJoin(turmaTable, eq(matriculaTable.turmaId, turmaTable.id))
        .where(eq(participanteTable.eventoId, evento.id));

      const sortedParticipantes = participantes.sort((a, b) => {
        const statusOrder: Record<string, number> = { PAGO: 2, PENDENTE: 1, ATRASADO: 0, CANCELADO: -1 };
        const orderA = statusOrder[a.pendenciaStatus ?? ''] ?? -2;
        const orderB = statusOrder[b.pendenciaStatus ?? ''] ?? -2;

        if (orderA !== orderB) return orderB - orderA;
        return (a.nome ?? '').localeCompare(b.nome ?? '');
      });

      return {
        ...evento,
        valor: Number(evento.valor),
        participantesCount: Number(evento.participantesCount),
        dataEvento: evento.dataEvento.split('T')[0],
        participantes: sortedParticipantes.map((p) => ({
          nome: p.nome,
          imagem: p.imagem,
          turma: p.turma || "Sem Turma",
          pago: p.pago,
          confirmado: p.confirmado,
          matricula: p.matricula,
          idade: p.dataNascimento
            ? new Date().getFullYear() - new Date(p.dataNascimento).getFullYear()
            : null
        })),
      };
    }));

    return eventsWithDetailedParticipantes;
  }

  static async create(escolaId: string, data: EventoCreateInput) {
    const id = uuidv4();
    const dataEventoStr = data.dataEvento instanceof Date ? data.dataEvento.toISOString() : data.dataEvento;
    const dataLimiteStr = data.dataLimite ? (data.dataLimite instanceof Date ? data.dataLimite.toISOString() : data.dataLimite) : null;

    await db.insert(eventoTable).values({
      id,
      escolaId,
      nome: data.nome,
      descricao: data.descricao || null,
      dataEvento: dataEventoStr,
      local: data.local || null,
      valor: String(data.valor),
      vagas: data.vagas || null,
      dataLimite: dataLimiteStr,
    });

    return { id, ...data, escolaId };
  }

  static async update(data: EventoUpdateInput) {
    const dataEventoStr = data.dataEvento instanceof Date ? data.dataEvento.toISOString() : data.dataEvento;
    const dataLimiteStr = data.dataLimite ? (data.dataLimite instanceof Date ? data.dataLimite.toISOString() : data.dataLimite) : null;

    return db.update(eventoTable)
      .set({
        nome: data.nome,
        descricao: data.descricao || null,
        dataEvento: dataEventoStr,
        local: data.local || null,
        valor: String(data.valor),
        vagas: data.vagas || null,
        dataLimite: dataLimiteStr,
      })
      .where(eq(eventoTable.id, data.id));
  }

  static async delete(eventoId: string) {
    return db.delete(eventoTable)
      .where(eq(eventoTable.id, eventoId));
  }
}
