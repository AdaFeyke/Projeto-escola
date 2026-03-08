"use client";

import React, { useMemo } from "react";
import { format, eachDayOfInterval, isWeekend } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "~/lib/utils";
import {
  BookOpen, Calendar, GraduationCap, AlertCircle,
  FileText, Flag, Star, PlusCircle, Users,
  Lock
} from "lucide-react";
import { getLabelByType } from "~/services/calendar/calendar.service";

const toISODate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split("T")[0] ?? '';
};

const getEventIcon = (tipo: string) => {
  const icons: Record<string, React.ReactNode> = {
    PROVA: <GraduationCap className="w-2.5 h-2.5" />,
    TRABALHO: <FileText className="w-2.5 h-2.5" />,
    SEMINARIO: <Users className="w-2.5 h-2.5" />,
    NAO_LETIVO_FERIADO: <Flag className="w-2.5 h-2.5" />,
    NAO_LETIVO_RECESSO: <Calendar className="w-2.5 h-2.5" />,
    REUNIAO_PEDAGOGICA: <BookOpen className="w-2.5 h-2.5" />,
    EVENTO_ESCOLAR: <Star className="w-2.5 h-2.5" />,
    LETIVO_EXTRA: <PlusCircle className="w-2.5 h-2.5" />,
  };
  return icons[tipo?.toUpperCase()] || <AlertCircle className="w-2.5 h-2.5" />;
};

export function MonthCard({
  month,
  eventos,
  ciclos = [],
  onDateClick
}: {
  month: Date | string;
  eventos: any[];
  ciclos?: any[];
  onDateClick?: (date: Date, info: { evento?: any; ciclo?: any; forcedEvento?: boolean }) => void;
}) {

  const { monthStart, monthEnd, yearRef, monthRef, days, startDayIndex } = useMemo(() => {
    const d = new Date(month);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth();
    const start = new Date(Date.UTC(y, m, 1, 12, 0, 0));
    const end = new Date(Date.UTC(y, m + 1, 0, 12, 0, 0));

    return {
      monthStart: start,
      monthEnd: end,
      yearRef: y,
      monthRef: m,
      days: eachDayOfInterval({ start, end }),
      startDayIndex: start.getUTCDay()
    };
  }, [month]);

  const eventosDoMes = useMemo(() =>
    eventos.filter(ev => {
      const d = new Date(ev.dataInicio);
      return d.getUTCMonth() === monthRef && d.getUTCFullYear() === yearRef;
    }), [eventos, monthRef, yearRef]);

  const cicloAtivoNoMes = useMemo(() =>
    ciclos.find(c => {
      const inicio = new Date(c.dataInicio);
      const fim = new Date(c.dataFim);
      return (inicio <= monthEnd && fim >= monthStart);
    }), [ciclos, monthStart, monthEnd]);

  const formatarIntervalo = (inicio: Date | string, fim?: Date | string) => {
    const d1 = new Date(inicio);
    const d2 = fim ? new Date(fim) : null;
    if (!d2 || toISODate(d1) === toISODate(d2)) return `Dia ${d1.getUTCDate()}`;
    const mesmoMes = d1.getUTCMonth() === d2.getUTCMonth();
    if (mesmoMes) return `Dia ${d1.getUTCDate()} - ${d2.getUTCDate()}`;
    const mes1 = format(d1, "MMM", { locale: ptBR }).replace(".", "");
    const mes2 = format(d2, "MMM", { locale: ptBR }).replace(".", "");
    return `${d1.getUTCDate()} ${mes1} a ${d2.getUTCDate()} ${mes2}`;
  };

  return (
    <section className="group bg-white rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col overflow-hidden print:shadow-none">
      <header className="px-6 pt-6 pb-4">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-800 capitalize leading-none tracking-tight">
              {format(monthStart, "MMMM", { locale: ptBR })}
            </h3>
            {cicloAtivoNoMes && (
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <p className="text-[11px] font-black text-emerald-600 uppercase tracking-tight">
                    {cicloAtivoNoMes.nome}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <p className="text-[10px] font-bold uppercase tracking-wide">
                    {formatarIntervalo(cicloAtivoNoMes.dataInicio, cicloAtivoNoMes.dataFim)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <span className="text-xs font-black text-slate-300 tabular-nums">
            {yearRef}
          </span>
        </div>
      </header>

      <div className="px-5 pb-4">
        <div className="grid grid-cols-7 gap-1">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
            <div key={i} className="text-[10px] font-bold text-slate-400 text-center py-2">{d}</div>
          ))}

          {Array.from({ length: startDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {days.map((date) => {
            const dateISO = toISODate(date);
            const ehFimDeSemana = isWeekend(date);

            const eventosNoDia = eventos.filter(ev => {
              const start = toISODate(ev.dataInicio);
              const end = toISODate(ev.dataFim || ev.dataInicio);
              return dateISO >= start && dateISO <= end;
            });

            const cicloNoDia = ciclos.find(c => dateISO >= toISODate(c.dataInicio) && dateISO <= toISODate(c.dataFim));
            const ehInicioCiclo = cicloNoDia && dateISO === toISODate(cicloNoDia.dataInicio);
            const ehFimCiclo = cicloNoDia && dateISO === toISODate(cicloNoDia.dataFim);

            return (
              <button
                key={dateISO}
                onClick={() => onDateClick?.(date, { evento: eventosNoDia[0], ciclo: cicloNoDia })}
                className={cn(
                  "relative aspect-square rounded-xl border-1 transition-all active:scale-95 flex flex-col items-center justify-center overflow-hidden border-slate-200 hover:bg-slate-100",
                  ehFimDeSemana && eventosNoDia.length === 0 ? "bg-slate-50/50" : "bg-white"
                )}
              >
                {eventosNoDia.length > 0 && (
                  <div className="absolute inset-0 flex rotate-12 scale-150">
                    {eventosNoDia.slice(0, 2).map((ev, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "h-full flex-1 transition-colors",
                          ev.colorConfig.split(' ')[0]
                        )}
                        style={{
                          clipPath: eventosNoDia.length > 1
                            ? (idx === 0 ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)')
                            : 'none'
                        }}
                      />
                    ))}
                  </div>
                )}

                {(ehInicioCiclo || ehFimCiclo) && (
                  <div className={cn(
                    "absolute top-1 right-1 z-20 w-3.5 h-3.5 rounded-full flex items-center justify-center ",
                    ehInicioCiclo ? "bg-blue-600" : "bg-orange-500"
                  )}>
                    <Flag className="w-2 h-2 text-white fill-current" />
                  </div>
                )}

                <div className="relative z-10 flex flex-col items-center">
                  <span className={cn(
                    "text-xs font-bold leading-none",
                    eventosNoDia.length > 0 ? "text-slate-900" : (ehFimDeSemana ? "text-slate-300" : "text-slate-500")
                  )}>
                    {date.getUTCDate()}
                  </span>

                  {eventosNoDia.length > 0 && (
                    <div className="mt-0.5 text-slate-800">
                      {getEventIcon(eventosNoDia[0].tipo)}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto bg-slate-50/50 border-t border-slate-100 p-5 space-y-3 min-h-[120px]">
        {eventosDoMes.length > 0 ? (
          eventosDoMes.map((ev) => (
            <div
              key={ev.id}
              onClick={() => onDateClick?.(new Date(ev.dataInicio), { evento: ev, forcedEvento: true })}
              className="group flex items-center gap-3 cursor-pointer hover:translate-x-1 transition-all duration-200"
            >
              <div className={cn(
                "w-7 h-7 rounded-full shrink-0 flex items-center justify-center ring-4 ring-white shadow-sm transition-transform group-hover:scale-110",
                ev.colorConfig || "bg-slate-100 text-slate-500"
              )}>
                {getEventIcon(ev.tipo)}
              </div>

              <div className="min-w-0 flex-1 border-b border-slate-50 pb-2 group-last:border-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-700 leading-tight truncate tracking-tight group-hover:text-black">
                      {ev.titulo}
                    </p>
                    <div className="flex gap-2">
                      <p className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">
                        {getLabelByType(ev.tipo)}
                      </p>
                      {ev.bloqueiaAula && (
                        <div className="flex items-center gap-0.5 px-1 rounded bg-rose-50 border border-rose-100/50 shrink-0">
                          <Lock className="w-2 h-2 text-rose-500" />
                          <span className="text-[7px] font-bold text-rose-500 uppercase tracking-tighter">
                            Sem Aula
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[8px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 rounded uppercase">
                      {formatarIntervalo(ev.dataInicio, ev.dataFim)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-4 opacity-40">
            <div className="h-[1px] w-8 bg-slate-300 mb-2" />
            <p className="text-[9px] text-slate-500 font-medium uppercase tracking-[0.2em]">
              Calendário Regular
            </p>
          </div>
        )}
      </div>
    </section>
  );
}