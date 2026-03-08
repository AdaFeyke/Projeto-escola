"use client";

import { safeFormat } from "~/utils/safe-format";

export function EventosPassados({ eventosPassados, onEdit }: any) {
  return (
    <>
      {eventosPassados.length > 0 && (
        <details className="group opacity-60">
          <summary className="cursor-pointer py-2 border-t border-slate-100 mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest list-none">
            Histórico Recente ({eventosPassados.length})
          </summary>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-4">
            {eventosPassados.slice(-6).reverse().map((evento: any) => (
              <div
                key={evento.id}
                onClick={() => onEdit?.(evento)}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center cursor-pointer hover:bg-slate-100/80 hover:border-slate-300 transition-all duration-200"
              >
                <span className="text-[10px] font-bold text-slate-400 truncate line-through italic">{evento.titulo}</span>
                <span className="text-[10px] font-bold text-slate-400">{safeFormat(evento.dataInicio, "dd/MM")}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </>
  );
}

