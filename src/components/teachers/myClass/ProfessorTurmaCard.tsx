"use client";

import Link from "next/link";
import {
  Users,
  GraduationCap,
  ArrowRight,
  ClipboardCheck,
  TrendingUp,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Accordion, AccordionItem } from "@radix-ui/react-accordion";
import { cn } from "~/lib/utils";

interface Props {
  data: {
    id: string;
    disciplina: { nome: string; sigla: string };
    turma: {
      nome: string;
      serie: { nome: string };
      _count: { matriculas: number };
    };
    stats?: {
      mediaGeral: number | null;
      ultimaAula: Date | null;
      totalAulas: number;
      frequenciaHoje: boolean;
      totalAlunos: number;
      notasLancadasCount: number;
      proximaAtividade: {
        titulo: string;
        data: Date;
        tipo: string;
      } | null;
    };
  };
}

export function ProfessorTurmaCard({ data }: Props) {
  const getMediaColor = (media: number | null) => {
    if (media === null || media === 0) return "text-slate-400";
    if (media >= 7) return "text-emerald-600";
    if (media >= 5) return "text-amber-500";
    return "text-rose-500";
  };

  const totalAlunos = data.stats?.totalAlunos || 1;
  const launchProgress = data.stats?.proximaAtividade
    ? (data.stats.notasLancadasCount / totalAlunos) * 100
    : 0;

  const isExpired = data.stats?.proximaAtividade
    ? new Date(data.stats.proximaAtividade.data) < new Date()
    : false;


  const isTotalmenteAvaliado = data.stats?.notasLancadasCount === data.stats?.totalAlunos;
  const isPassada = data.stats?.proximaAtividade
    ? new Date(data.stats.proximaAtividade.data) < new Date()
    : false;

  const mostrarComoPendencia = isPassada && !isTotalmenteAvaliado;

  return (
    <Accordion
      type="single"
      collapsible
      className="group bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
    >
      <AccordionItem key={data.id} value={data.id} className="h-full">
        <div className="p-6 flex flex-col h-full space-y-4">

          <header className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 font-bold px-2.5 py-0.5 rounded-lg text-[10px] tracking-wider uppercase">
                  {data.disciplina.sigla}
                </Badge>
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> {data.turma.serie.nome}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-600">{data.turma._count.matriculas}</span>
              </div>
            </div>

            <div>
              <Link href={`/dashboard/classes/class/${data.id}`} className="group-hover:text-primary transition-colors duration-200 block">
                <h3 className="
                    text-2xl font-black tracking-tight text-slate-900
                    group-hover:text-primary transition-colors
                  ">
                  {data.disciplina.nome}
                </h3>
                <p className="text-sm font-medium text-slate-500">{data.turma.nome}</p>
              </Link>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col justify-center p-3 rounded-xl bg-slate-50/50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3" /> Média
              </span>
              <div className="flex items-baseline gap-1">
                <span className={cn("text-2xl font-black tracking-tight", getMediaColor(data.stats?.mediaGeral ?? null))}>
                  {data.stats?.mediaGeral !== null ? data.stats?.mediaGeral.toFixed(1) : "-"}
                </span>
                <span className="text-[10px] font-bold text-slate-400">/10</span>
              </div>
            </div>

            <div className="col-span-2 flex flex-col justify-center p-3 rounded-xl bg-slate-50/50 border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Frequência
                </span>
                {data.stats?.frequenciaHoje ? (
                  <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                    <CheckCircle2 className="w-2.5 h-2.5" />CHAMADA
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100">
                    <AlertCircle className="w-2.5 h-2.5" /> CHAMADA
                  </span>
                )}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-lg font-black text-slate-700">{data.stats?.totalAulas || 0}</span>
                  <span className="text-[10px] font-medium text-slate-400 ml-1">aulas</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Última</span>
                  <span className="text-xs font-bold text-slate-600">
                    {data.stats?.ultimaAula ? new Date(data.stats.ultimaAula).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' }) : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={cn(
            "relative flex flex-col gap-3 p-4 rounded-xl border transition-all flex-1",
            mostrarComoPendencia
              ? "bg-rose-50 border-rose-200" 
              : "bg-primary/5 border-primary/20" 
          )}>
            <p className="text-[10px] font-bold uppercase tracking-wider">
              {mostrarComoPendencia ? "Aguardando Lançamento" : "Próximo Evento"}
            </p>
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border shrink-0",
                data.stats?.proximaAtividade
                  ? isExpired ? "bg-white text-amber-600 border-amber-200" : "bg-white text-primary border-primary/20"
                  : "bg-white text-slate-300 border-slate-200"
              )}>
                {data.stats?.proximaAtividade ? <FileText className="w-5 h-5" /> : <ClipboardCheck className="w-5 h-5" />}
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {data.stats?.proximaAtividade ? (isExpired ? "Lançar Notas" : "Próxima Atividade") : "Sem Atividades"}
                </p>
                {data.stats?.proximaAtividade ? (
                  <>
                    <p className={cn("text-sm font-bold leading-tight line-clamp-1", isExpired ? "text-amber-700" : "text-primary")}>
                      {data.stats.proximaAtividade.titulo}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500">
                      {new Date(data.stats.proximaAtividade.data).toLocaleDateString("pt-BR", { weekday: 'short', day: '2-digit', month: 'long' })}
                    </p>
                  </>
                ) : (
                  <p className="text-xs font-medium text-slate-400 italic">Nenhum registro recente</p>
                )}
              </div>
            </div>

            {data.stats?.proximaAtividade && (
              <div className="w-full space-y-1 mt-auto">
                <div className="flex justify-between items-center text-[9px] font-black uppercase">
                  <span className="text-slate-500">Progresso de Lançamento</span>
                  <span className={launchProgress === 100 ? "text-emerald-600" : "text-primary"}>
                    {data.stats.notasLancadasCount}/{data.stats.totalAlunos}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200/60 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", launchProgress === 100 ? "bg-emerald-500" : "bg-primary")}
                    style={{ width: `${launchProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <footer className="pt-2 mt-auto">
            <Button
              asChild
              className="w-full"
            >
              <Link href={`/dashboard/classes/class/${data.id}`}>
                Gerenciar Turma
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </footer>
        </div>
      </AccordionItem>
    </Accordion>
  );
}