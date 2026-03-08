"use client";

import React, { useState, useMemo, startTransition } from "react";
import { Plus, Calendar, Edit, Trash2, Clock, CalendarDays, CalendarCheck } from "lucide-react";
import { format, parseISO, isBefore, isAfter, startOfDay, differenceInDays } from "date-fns";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { CicloFormModal } from "./CicloFormModal";
import { getDurationInDays } from "~/utils/date-utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useConfirm } from "~/hooks/ui/useConfirm";
import { deleteCicloAction } from "~/actions/settings/ciclo.actions";

export interface AnoLetivo {
  id: string;
  ano: number;
  anoAtual: boolean;
}

export interface CicloLetivo {
  id: string;
  nome: string;
  dataInicio: string | Date;
  dataFim: string | Date;
  anoLetivoId: string;
  anoLetivo?: { ano: number };
}

interface CicloManagerProps {
  initialCiclos: CicloLetivo[];
  anosLetivos: AnoLetivo[];
}

export default function CicloManager({ initialCiclos, anosLetivos }: CicloManagerProps) {
  const [editingCiclo, setEditingCiclo] = useState<CicloLetivo | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filtroAno, setFiltroAno] = useState<string>("all");
  const router = useRouter();
  const { confirm } = useConfirm();

  const ciclosFiltrados = useMemo(() => {
    const hoje = startOfDay(new Date());

    const filtrados = filtroAno === "all"
      ? initialCiclos
      : initialCiclos.filter(c => c.anoLetivoId === filtroAno);

    return filtrados.map(ciclo => {
      const dataInicioLimpa = typeof ciclo.dataInicio === 'string'
        ? ciclo.dataInicio.substring(0, 10)
        : ciclo.dataInicio.toISOString().substring(0, 10);

      const dataFimLimpa = typeof ciclo.dataFim === 'string'
        ? ciclo.dataFim.substring(0, 10)
        : ciclo.dataFim.toISOString().substring(0, 10);

      const inicio = parseISO(dataInicioLimpa);
      const fim = parseISO(dataFimLimpa);

      let calcProgress = 0;

      if (isAfter(hoje, fim)) {
        calcProgress = 100;
      } else if (isBefore(hoje, inicio)) {
        calcProgress = 0;
      } else {
        const totalDias = differenceInDays(fim, inicio) + 1;
        const diasPassados = differenceInDays(hoje, inicio) + 1;
        calcProgress = Math.round((diasPassados / totalDias) * 100);
      }

      return {
        ...ciclo,
        dataInicio: dataInicioLimpa,
        dataFim: dataFimLimpa,
        progressoReal: calcProgress
      };
    });
  }, [initialCiclos, filtroAno]);



  const handleDelete = async (ciclo: CicloLetivo) => {
    const confirmed = await confirm({
      title: "Confirmar Exclusão",
      description: `Tem certeza que deseja excluir o ciclo "${ciclo.nome}"?`,
      confirmText: "Sim, Excluir",
      cancelText: "Cancelar"
    });

    if (confirmed) {
      startTransition(async () => {
        const response = await deleteCicloAction(ciclo.id);
        if (response.success) {
          toast.success(response.message);
          router.refresh();
        } else {
          toast.error(response.message);
        }
      });
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <CalendarDays className="w-8 h-8 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight truncate">
              Ciclos Letivos
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Criação e edição de ciclos letivos
            </p>
          </div>
        </div>

        <div className="w-full lg:w-auto">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full bg-transparent sm:bg-slate-50 sm:p-1.5 sm:rounded-2xl sm:border sm:border-slate-100">
            <div className="w-full sm:w-auto">
              <Select value={filtroAno} onValueChange={setFiltroAno}>
                <SelectTrigger
                  className="
                    w-full sm:w-[160px] 
                    bg-white border-slate-200 sm:border-none 
                    shadow-sm h-12 sm:h-11 
                    rounded-2xl sm:rounded-xl 
                    font-bold text-slate-600
                  "
                >
                  <SelectValue placeholder="Filtrar Ano" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100">
                  <SelectItem value="all">Todos os anos</SelectItem>
                  {anosLetivos.map(ano => (
                    <SelectItem key={ano.id} value={ano.id}>{ano.ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => { setEditingCiclo(undefined); setIsModalOpen(true); }}
              className="
                w-full sm:w-auto 
                bg-primary hover:bg-primary/90 
                text-white font-black 
                rounded-2xl sm:rounded-xl 
                h-12 sm:h-11 px-8
                transition-all active:scale-95 
                gap-2
              "
            >
              <Plus className="w-5 h-5 shrink-0" />
              <span className="whitespace-nowrap uppercase tracking-wider text-xs sm:normal-case sm:text-sm sm:tracking-normal">
                Novo Ciclo
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            Ciclos Encontrados
          </h3>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest">
            {ciclosFiltrados.length} itens
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {ciclosFiltrados.length > 0 ? (
            ciclosFiltrados.map((ciclo) => (
              <div key={ciclo.id} className="group bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                <div className="p-8 flex flex-col h-full gap-6">
                  <header className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <h3 className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors">
                        {ciclo.nome}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-primary/5 text-primary border-none font-black px-4 py-1.5 rounded-xl shrink-0 uppercase tracking-widest text-[10px]">
                          Ano {ciclo.anoLetivo?.ano}
                        </Badge>

                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-xl text-slate-400 font-bold border border-slate-100/50">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[11px] uppercase tracking-tighter">
                            {getDurationInDays(new Date(ciclo.dataFim), new Date(ciclo.dataInicio))} dias
                          </span>
                        </div>
                      </div>
                    </div>
                  </header>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group-hover:bg-white group-hover:border-primary/10 transition-colors">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        Início
                      </div>
                      <span className="text-sm font-bold text-slate-700">
                        {format(parseISO(ciclo.dataInicio), "dd/MM/yyyy")}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group-hover:bg-white group-hover:border-primary/10 transition-colors">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <CalendarCheck className="w-3.5 h-3.5 text-primary" />
                        Término
                      </div>
                      <span className="text-sm font-bold text-slate-700">
                        {format(parseISO(ciclo.dataFim), "dd/MM/yyyy")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 p-5 rounded-[1.5rem] bg-primary/[0.02] border border-primary/5">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Progresso Real</span>
                      <span className="text-lg font-black text-primary leading-none">{ciclo.progressoReal}%</span>
                    </div>

                    <div className="h-2.5 w-full bg-primary/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all duration-1000 ease-out"
                        style={{ width: `${ciclo.progressoReal}%` }}
                      />
                    </div>
                  </div>

                  <footer className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditingCiclo(ciclo); setIsModalOpen(true); }}
                        className="h-10 w-10 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => handleDelete(ciclo)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      className="bg-white hover:bg-primary hover:text-white text-primary border border-primary/20 font-black text-[10px] uppercase tracking-widest rounded-xl px-4 h-10 transition-all active:scale-95 shadow-sm"
                    >
                      Configurar Provas
                    </Button>
                  </footer>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">Nenhum ciclo encontrado para este filtro.</p>
            </div>
          )}
        </div>
      </div>

      <CicloFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ciclo={editingCiclo}
        anosLetivos={anosLetivos}
      />
    </div>
  );
}

