import prisma from "~/lib/prisma";
import { eachMonthOfInterval, addDays } from "date-fns";

import { Calendar as CalendarIcon } from "lucide-react";
import { CalendarioService } from "~/services/calendar/calendar.service";
import { getCurrentEscolaId, getUserSession } from "~/config/permission-manager";

import { ActionsCalendarWrapper } from "~/components/calendar/ActionsCalendarWrapper";
import { EventosStat } from "~/components/calendar/EventosStat";
import { getNameEscolaById } from "~/services/school/school.service";
import { getProfessorId } from "~/services/teachers/teacher.service";
import { PageHeader } from "~/components/ui/PageHeader";

export default async function CalendarioPage() {
  const [user, escolaId, nomeEscola] = await Promise.all([getUserSession(), getCurrentEscolaId(), getNameEscolaById()]);

  const anoAtivo = await prisma.anoLetivo.findFirst({
    where: { escolaId, anoAtual: true }
  });

  if (!anoAtivo) return <AnoNaoConfigurado />;

  let professorId: string | null = null;
  let alunoInfo: any = null;

  if (user.role === 'PROFESSOR') {
    professorId = await getProfessorId();
  } else if (user.role === 'ALUNO') {
    alunoInfo = await prisma.aluno.findUnique({
      where: { usuarioId: user.id },
      include: {
        matriculas: {
          where: { status: 'ATIVA', turma: { anoLetivoId: anoAtivo.id } },
          include: { turma: true }
        }
      }
    });
  }

  const [eventosRaw, ciclos, turmas, atividadesRaw] = await Promise.all([
    CalendarioService.getCalendarioCompleto(escolaId, anoAtivo.id),

    prisma.cicloLetivo.findMany({ where: { escolaId, anoLetivoId: anoAtivo.id } }),

    prisma.turma.findMany({
      where: {
        escolaId,
        anoLetivoId: anoAtivo.id,
        ...(user.role === 'PROFESSOR' && professorId ? {
          disciplinas: {
            some: { professorId: professorId }
          }
        } : {}),
        ...(user.role === 'ALUNO' && alunoInfo?.matriculas?.[0]?.turmaId ? {
          id: alunoInfo.matriculas[0].turmaId
        } : {})
      },
      include: {
        disciplinas: {
          include: { disciplina: true }
        }
      }
    }),

    prisma.atividadeTurma.findMany({
      where: {
        data: {
          gte: new Date(anoAtivo.ano, 0, 1),
          lte: new Date(anoAtivo.ano, 11, 31)
        },
        ...(user.role === 'PROFESSOR' && professorId ? {
          turma: {
            disciplinas: {
              some: { professorId: professorId }
            }
          }
        } : {}),
        ...(user.role === 'ALUNO' && alunoInfo?.matriculas?.[0]?.turmaId ? {
          turmaId: alunoInfo.matriculas[0].turmaId
        } : {})
      },
      select: { id: true, titulo: true, data: true, tipo: true, turmaId: true, cicloId: true, descricao: true, disciplinaId: true }
    })
  ]);

  const eventos: any[] = [
    ...eventosRaw,
    ...atividadesRaw.map(atv => ({
      ...atv,
      dataInicio: atv.data,
      dataFim: atv.data,
      colorConfig: ["TRABALHO", "PROVA"].includes(atv.tipo)
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-blue-100 text-blue-700 border-blue-200"
    }))
  ];

  const mesesDoAno = eachMonthOfInterval({
    start: new Date(Date.UTC(anoAtivo.ano, 0, 1, 12)),
    end: new Date(Date.UTC(anoAtivo.ano, 11, 1, 12)),
  });
  const isAdmin = user.role === 'ADMINISTRADOR';

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="Calendário Escolar"
        description={`Gestão letiva da escola ${nomeEscola}`}
        iconElement={<CalendarIcon className="w-7 h-7 md:w-8 md:h-8" />}
        backHref="/dashboard"
        showButton={isAdmin}
        onButtonClick={undefined}
      />
      {isAdmin && (
        <EventosStat stats={calcularStats(eventos, ciclos, anoAtivo.ano)} />
      )}

      <ActionsCalendarWrapper
        anoLetivo={anoAtivo}
        userRole={user.role}
        userId={user.id}
        professorId={professorId}
        turmas={turmas}
        ciclos={ciclos}
        eventos={eventos}
        mesesDoAno={mesesDoAno}
        nomeEscola={nomeEscola}
      />
    </div>
  );

}

function AnoNaoConfigurado() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-slate-100 p-6 rounded-full mb-4"><CalendarIcon className="w-12 h-12 text-slate-400" /></div>
      <h2 className="text-2xl font-black text-slate-800">Ano Letivo não configurado</h2>
    </div>
  );
}
function calcularStats(eventos: any[], ciclos: any[], ano: number) {
  const mapaEventos = new Map<string, string[]>();
  const diasSemAulaSet = new Set<string>();
  eventos.forEach(e => {
    let d = new Date(e.dataInicio);
    const dFim = new Date(e.dataFim || e.dataInicio);

    while (d <= dFim) {
      const iso = d.toISOString().split('T')[0]!;
      const tiposAtuais = mapaEventos.get(iso) || [];
      tiposAtuais.push(e.tipo);
      mapaEventos.set(iso, tiposAtuais);

      if (['NAO_LETIVO_FERIADO', 'NAO_LETIVO_RECESSO'].includes(e.tipo)) {
        diasSemAulaSet.add(iso);
      }
      d = addDays(d, 1);
    }
  });

  const contarLetivosNoIntervalo = (inicio: Date, fim: Date) => {
    let contagem = 0;
    let curr = new Date(inicio);

    while (curr <= fim) {
      const iso = curr.toISOString().split('T')[0]!;
      const tiposNoDia = mapaEventos.get(iso) || [];
      const isFimDeSemana = curr.getUTCDay() === 0 || curr.getUTCDay() === 6;

      const temLetivoExtra = tiposNoDia.includes('LETIVO_EXTRA');

      const temPausa = tiposNoDia.some(t => ['NAO_LETIVO_FERIADO', 'NAO_LETIVO_RECESSO'].includes(t));
      const ehDiaUtilSemPausa = !isFimDeSemana && !temPausa;
      if (ehDiaUtilSemPausa || temLetivoExtra) {
        contagem++;
      }

      curr = addDays(curr, 1);
    }
    return contagem;
  };

  const diasLetivosTotais = contarLetivosNoIntervalo(
    new Date(Date.UTC(ano, 0, 1, 12)),
    new Date(Date.UTC(ano, 11, 31, 12))
  );

  const statsCiclos = ciclos.map(ciclo => {
    const inicio = new Date(ciclo.dataInicio);
    const fim = new Date(ciclo.dataFim);
    const duracaoCalendario = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return {
      nome: ciclo.nome,
      duracaoTotal: duracaoCalendario,
      diasLetivos: contarLetivosNoIntervalo(inicio, fim)
    };
  });

  return {
    diasLetivosTotais,
    diasSemAula: diasSemAulaSet.size,
    porcentagemMeta: Math.min((diasLetivosTotais / 200) * 100, 100),
    statsCiclos
  };
}