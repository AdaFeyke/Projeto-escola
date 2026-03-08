"use client";

import { cn } from "~/lib/utils";
import { CalendarDays, GraduationCap, BookOpen } from "lucide-react";
import { safeFormat } from "~/utils/safe-format";
import { getLabelByType } from "~/services/calendar/calendar.service";

export function ProximosEventos({ proximosEventos, onEdit }: any) {

  const getEventIcon = (tipo: string) => {
    const props = { className: "w-4 h-4" };
    if (tipo.includes("PROVA")) return <GraduationCap {...props} />;
    if (tipo.includes("ATIVIDADE") || tipo.includes("TRABALHO")) return <BookOpen {...props} />;
    return <CalendarDays {...props} />;
  };

  return (
    <>
      {proximosEventos.length > 0 && (
        <div className="space-y-6 py-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
              Próximas Datas
            </h2>
            <span className="h-[1px] flex-1 bg-slate-100 ml-4" />
          </div>

          <div className="flex flex-wrap gap-3">
            {proximosEventos.slice(0, 6).map((evento: any) => (
              <div
                key={evento.id}
                onClick={() => onEdit?.(evento)}
                className="group relative flex items-center gap-4 bg-white p-3 pr-5 rounded-2xl border border-slate-100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer"
              >
                <div className={cn(
                  "flex flex-col items-center justify-center w-12 h-12 rounded-xl border shadow-sm transition-colors",
                  evento.colorConfig?.split(' ')[0] || "bg-slate-50 border-slate-100"
                )}>
                  <span className="text-[10px] font-bold uppercase opacity-60">
                    {safeFormat(evento.dataInicio, "MMM")}
                  </span>
                  <span className="text-lg font-black leading-none">
                    {safeFormat(evento.dataInicio, "dd")}
                  </span>
                </div>

                <div className="flex flex-col min-w-[120px] max-w-[180px]">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={cn("p-1 rounded-md bg-slate-50 text-slate-400 group-hover:text-primary transition-colors")}>
                      {getEventIcon(evento.tipo)}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      {getLabelByType(evento.tipo)}
                    </span>
                  </div>
                  <h4 className="text-[13px] font-bold text-slate-700 leading-tight group-hover:text-primary transition-colors line-clamp-1">
                    {evento.titulo}
                  </h4>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

