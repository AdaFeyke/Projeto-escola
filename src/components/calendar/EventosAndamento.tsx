"use client";

import { Ban } from "lucide-react";
import { safeFormat } from "~/utils/safe-format";

export function EventosAndamento({ eventosEmAndamento, onEdit }: any) {
  return (
    <>
      {eventosEmAndamento.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" /> Em Andamento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {eventosEmAndamento.map((evento: any) => (
              <div
                key={evento.id}
                onClick={() => onEdit?.(evento)}
                className="p-5 rounded-[2rem] border-2 shadow-lg bg-white border-emerald-500/30 ring-4 ring-emerald-50 cursor-pointer hover:shadow-emerald-200/50 hover:translate-y-[-4px] hover:bg-emerald-50/20 transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">ATIVO</span>
                  {evento.bloqueiaAula && <span className="text-[10px] font-black text-rose-600 flex items-center gap-1"><Ban className="w-3 h-3" /> SEM AULA</span>}
                </div>
                <h4 className="text-lg font-black text-slate-900 leading-tight">{evento.titulo}</h4>
                <p className="text-xs font-bold text-slate-500 italic mt-1">Termina em {safeFormat(evento.dataFim || evento.dataInicio, "dd 'de' MMMM")}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

