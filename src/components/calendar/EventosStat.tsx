"use client";

import { cn } from "~/lib/utils";

export function EventosStat({ stats }: any) {
  return (
    <section className="space-y-4">
      <div className="p-8 flex flex-col gap-8 border relative overflow-hidden text-slate-700 bg-white rounded-[2.5rem] border-slate-200/60 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-1 relative z-10">
            <h3 className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">Dias letivos totais</h3>
            <span className="text-6xl font-black tabular-nums">{stats.diasLetivosTotais}</span>
          </div>

          <div className="h-px md:h-20 w-full md:w-px bg-slate-200" />

          <div className="flex-1 w-full space-y-4 relative z-10">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 block">Progresso da Meta (200 dias)</span>
                <span className="text-2xl font-black">{stats.porcentagemMeta.toFixed(1)}%</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-rose-500 block">Total de Pausas</span>
                <span className="text-lg font-bold text-slate-400">{stats.diasSemAula} dias</span>
              </div>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1">
              <div
                className={cn("h-full rounded-full transition-all duration-1000", stats.diasLetivosTotais >= 200 ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-amber-500")}
                style={{ width: `${stats.porcentagemMeta}%` }}
              />
            </div>
          </div>
        </div>

        {/* DETALHAMENTO POR CICLO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          {stats.statsCiclos?.map((ciclo: any, idx: number) => (
            <div key={idx} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ciclo.nome}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-slate-800">{ciclo.diasLetivos}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Dias Letivos</span>
              </div>
              <p className="text-[9px] font-medium text-slate-400 italic">
                Duração total: {ciclo.duracaoTotal} dias corridos
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 