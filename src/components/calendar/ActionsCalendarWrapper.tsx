"use client";

import { useMemo, useState } from "react";
import { MonthCard } from "./MonthCard";
import { AtividadeFormSheet } from "./AtividadeFormSheet";
import { Button } from "~/components/ui/button";
import { CalendarDays, Users, LayoutGrid, Settings2, CheckCircle2, Ban, Info, CalendarIcon } from "lucide-react";
import { CalendarioFormModal } from "./CalendarioFormModal";
import { criarOuEditarCalendarioAction } from "~/actions/calendar/calendar.actions";
import { cn } from "~/lib/utils";
import { LegendCard } from "./LegendCard";
import { EventosAndamento } from "./EventosAndamento";
import { ProximosEventos } from "./ProximosEventos";
import { EventosPassados } from "./EventosPassados";
import { startOfDay } from "date-fns";
import { PrintContainer } from "../pdf/PrintContainer";

export function ActionsCalendarWrapper({ anoLetivo, userRole, userId, professorId, turmas, ciclos, eventos, mesesDoAno, nomeEscola }: any) {
  const initialTurma = userRole === 'ALUNO' && turmas.length > 0 ? turmas[0].id : "TODAS";
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>(initialTurma);

  const [isOpen, setIsOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCiclo, setSelectedCiclo] = useState<any>(null);
  const [selectedEvento, setSelectedEvento] = useState<any>(null);



  const hoje = startOfDay(new Date());

  const handleDayClick = (date: Date, info: any) => {
    if (userRole === 'ALUNO') return;

    // Helper para comparar datas com segurança
    const toDateString = (d: any) => {
      try {
        if (!d) return "";
        const dateObj = typeof d === "string" ? new Date(d) : d;
        if (isNaN(dateObj.getTime())) return "";
        return dateObj.toISOString().split("T")[0];
      } catch (e) {
        return "";
      }
    };

    const dateISO = toDateString(date);

    // Se for um evento "forçado" (vindo dos cards de status/listas laterais)
    if (info.forcedEvento) {
      const isInstitucional = info.evento && ["FERIADO", "NAO_LETIVO_FERIADO", "NAO_LETIVO_RECESSO", "LETIVO_EXTRA", "REUNIAO_PEDAGOGICA", "EVENTO_ESCOLAR"].includes(info.evento.tipo);

      if (isInstitucional && userRole === 'ADMINISTRADOR') {
        setSelectedEvento(info.evento);
        setIsOpen(true);
        return;
      }

      // Se não for institucional (ex: atividade), abre o sheet
      setSelectedDate(date);
      setSelectedCiclo(info.ciclo);
      setSelectedEvento(info.evento);
      setSheetOpen(true);
      return;
    }

    // Clique direto no dia do calendário: Prioridade é ATIVIDADE (conforme pedido)
    // Procuramos se já existe atividade naquele dia para a turma selecionada (se houver uma)
    let atividadeExistente = null;
    if (selectedTurmaId !== "TODAS") {
      atividadeExistente = eventos.find((ev: any) =>
        ev.turmaId === selectedTurmaId &&
        toDateString(ev.dataInicio) === dateISO
      );
    }

    // Independente de ter evento institucional, o clique no dia abre o fluxo de atividade
    // Se achou uma atividade da turma, edita. Se não, cria uma nova.
    setSelectedDate(date);
    setSelectedCiclo(info.ciclo);
    setSelectedEvento(atividadeExistente || null);
    setSheetOpen(true);
  };

  const canConfigure = userRole === 'ADMINISTRADOR' && selectedTurmaId === "TODAS";

  const { eventosExibicao, emAndamento, proximos, passados, ciclosExibicao } = useMemo(() => {
    const institucionais = eventos.filter((ev: any) =>
      ["FERIADO", "NAO_LETIVO_FERIADO", "NAO_LETIVO_RECESSO", "LETIVO_EXTRA", "REUNIAO_PEDAGOGICA", "EVENTO_ESCOLAR"].includes(ev.tipo)
    );

    let listaBase;
    if (selectedTurmaId === "TODAS") {
      listaBase = institucionais;
    } else {
      const especificos = eventos.filter((ev: any) => ev.turmaId === selectedTurmaId);
      listaBase = [...institucionais, ...especificos];
    }

    const andamento: any[] = [];
    const prox: any[] = [];
    const hist: any[] = [];

    listaBase.forEach((ev: any) => {
      const inicio = startOfDay(new Date(ev.dataInicio));
      const fim = startOfDay(new Date(ev.dataFim || ev.dataInicio));

      if (hoje >= inicio && hoje <= fim) {
        andamento.push(ev);
      } else if (inicio > hoje) {
        prox.push(ev);
      } else {
        hist.push(ev);
      }
    });

    prox.sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());

    let ciclosFiltrados = ciclos;
    if (selectedTurmaId !== "TODAS") {
      const turma = turmas.find((t: any) => t.id === selectedTurmaId);
      ciclosFiltrados = ciclos.filter((c: any) => c.segmento === "GERAL" || c.segmento === turma?.segmento);
    }

    return {
      eventosExibicao: listaBase,
      emAndamento: andamento,
      proximos: prox,
      passados: hist,
      ciclosExibicao: ciclosFiltrados
    };
  }, [eventos, selectedTurmaId, ciclos, turmas, hoje]);

  return (
    <>
      <section className="space-y-8 mb-10 print:hidden">
        <EventosAndamento
          eventosEmAndamento={emAndamento}
          onEdit={(ev: any) => handleDayClick(new Date(ev.dataInicio), { evento: ev, forcedEvento: true })}
        />
        <ProximosEventos
          proximosEventos={proximos}
          onEdit={(ev: any) => handleDayClick(new Date(ev.dataInicio), { evento: ev, forcedEvento: true })}
        />
        <EventosPassados
          eventosPassados={passados}
          onEdit={(ev: any) => handleDayClick(new Date(ev.dataInicio), { evento: ev, forcedEvento: true })}
        />
      </section>

      <div className="flex flex-col gap-6 mb-10 print:hidden">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
              Visualizando Calendário
            </h2>
            <div className="inline-flex p-1.5 bg-white rounded-[1.25rem] border shadow-sm">
              {userRole !== 'ALUNO' ? (
                <>
                  <button
                    onClick={() => setSelectedTurmaId("TODAS")}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                      selectedTurmaId === "TODAS"
                        ? "bg-slate-100 text-primary"
                        : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <CalendarDays className="w-4 h-4" />
                    Escola
                  </button>

                  <div className="w-px h-6 bg-slate-200 self-center mx-1" />
                  <div className="flex items-center px-2">
                    <Users className="w-4 h-4 text-slate-400 mr-2" />
                    <select
                      value={selectedTurmaId}
                      onChange={(e) => setSelectedTurmaId(e.target.value)}
                      className={cn(
                        "bg-transparent text-sm font-bold outline-none cursor-pointer pr-4",
                        selectedTurmaId !== "TODAS" ? "text-primary" : "text-slate-500"
                      )}
                    >
                      <option value="TODAS">Selecionar Turma...</option>
                      {turmas.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.nome}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 px-5 py-2.5 text-sm font-black text-primary uppercase tracking-tight">
                  <Users className="w-4 h-4" />
                  Turma: {turmas[0]?.nome || "Não Matriculado"}
                </div>
              )}
            </div>
          </div>


          <div className="flex items-center gap-3">
            {canConfigure ? (
              <Button onClick={() => {
                setSelectedEvento(null);
                setIsOpen(true);
              }}>
                <Settings2 className="w-4 h-4 mr-2" />
                Configurar Calendário
              </Button>

            ) : (
              selectedTurmaId !== "TODAS" && (
                <div className="hidden md:flex items-center gap-2 text-[11px] font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                  <LayoutGrid className="w-3 h-3" />
                  Clique em um dia para agendar atividade
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-10 print:hidden">
        <LegendCard icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} label="Dia Letivo" description="Aulas normais" color="bg-emerald-50/60 border-emerald-200/60" />
        <LegendCard icon={<Ban className="w-4 h-4 text-rose-600" />} label="Sem Aula" description="Feriados" color="bg-rose-50 border-rose-100" />
        <LegendCard icon={<Info className="w-4 h-4 text-amber-600" />} label="Pedagógico" description="Reuniões" color="bg-amber-50 border-amber-100" />
        <LegendCard icon={<CalendarIcon className="w-4 h-4 text-indigo-600" />} label="Evento Especial" description="Comemorações" color="bg-indigo-50 border-indigo-100" />
      </div>

      <PrintContainer filename={`Calendario_${anoLetivo.ano}`} title={`Calendário Letivo ${anoLetivo.ano}`} buttonLabel="Imprimir Calendário" nomeEscola={nomeEscola}>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 print:grid-cols-3">
          {mesesDoAno.map((mes: Date) => (
            <MonthCard
              key={mes.toISOString()}
              month={mes}
              eventos={eventosExibicao}
              ciclos={ciclosExibicao}
              onDateClick={(date, info) => {
                handleDayClick(date, { ...info, turmaId: selectedTurmaId });
              }}

            />
          ))}
        </div>
      </PrintContainer>

      <AtividadeFormSheet
        isOpen={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setSelectedEvento(null);
        }}
        date={selectedDate}
        ciclo={selectedCiclo}
        turmas={turmas}
        ciclos={ciclos}
        userRole={userRole}
        userId={userId}
        professorId={professorId}
        evento={selectedEvento}
        defaultTurmaId={selectedTurmaId}
      />



      <CalendarioFormModal
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSelectedEvento(null);
        }}
        action={criarOuEditarCalendarioAction}
        anoLetivoId={anoLetivo.id}
        evento={selectedEvento}
        isLoadingData={false}
        userRole={userRole}
      />


    </>
  );
}