"use client";

import React from "react";
import {
  Calendar as CalendarIcon,
  BookOpen,
  Target,
  FileText,
  ClipboardList,
  Users,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { approvePlanningAction } from "~/actions/pedagogical/planningActions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "~/components/ui/sheet";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { cn } from "~/lib/utils";

interface PlanningDetailsModalProps {
  open: boolean;
  onClose: () => void;
  plan: any;
  isAdmin?: boolean;
}

export function PlanningDetailsModal({ open, onClose, plan, isAdmin }: PlanningDetailsModalProps) {
  if (!plan) return null;

  const formattedDate = format(new Date(plan.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l-primary/10">
        <SheetHeader className="p-6 bg-primary/[0.02] border-b text-left">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {plan.disciplinas && plan.disciplinas.length > 0 ? (
              plan.disciplinas.map((d: any) => (
                <Badge key={d.id} variant="outline" className="rounded-full border-primary/20 text-primary text-[10px] font-bold uppercase">
                  {d.nome}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="rounded-full border-primary/20 text-primary text-[10px] font-bold uppercase">
                {plan.disciplina?.nome || "Geral"}
              </Badge>
            )}
            <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-500 border-none text-[10px] font-bold uppercase">
              {plan.turma.nome}
            </Badge>
          </div>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <SheetTitle className="text-2xl font-black text-slate-900 leading-tight">
                {plan.titulo}
              </SheetTitle>
              <SheetDescription className="font-medium text-slate-500 flex items-center gap-2 mt-1">
                <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                {formattedDate}
              </SheetDescription>
            </div>

            {isAdmin && (
              <div className="ml-4 flex flex-col items-end gap-1.5 min-w-[140px]">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alterar Status</span>
                <Select
                  defaultValue={plan.status || "PENDENTE"}
                  onValueChange={async (val: any) => {
                    const res = await approvePlanningAction(plan.id, val);
                    if (res.success) {
                      toast.success(res.message);
                    } else {
                      toast.error(res.message);
                    }
                  }}
                >
                  <SelectTrigger className={cn(
                    "h-9 rounded-xl border-2 font-black text-[10px] uppercase tracking-tighter px-3",
                    plan.status === 'APROVADO' ? "border-emerald-200 text-emerald-600 bg-emerald-50" :
                      plan.status === 'REJEITADO' ? "border-red-200 text-red-600 bg-red-50" : "border-amber-200 text-amber-600 bg-amber-50"
                  )}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                    <SelectItem value="PENDENTE" className="font-black text-[10px] uppercase text-amber-600">Pendente</SelectItem>
                    <SelectItem value="APROVADO" className="font-black text-[10px] uppercase text-emerald-600">Aprovar</SelectItem>
                    <SelectItem value="REJEITADO" className="font-black text-[10px] uppercase text-red-600">Rejeitar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <BookOpen className="w-4 h-4 text-primary" />
                Conteúdo / Assuntos
              </div>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                "{plan.conteudo || plan.assuntos || 'Sem conteúdo registrado'}"
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Target className="w-4 h-4 text-emerald-500" />
                Objetivos de Aprendizagem
              </div>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                {plan.objetivos || "Nenhum objetivo específico definido."}
              </div>
            </div>

            <Separator className="bg-slate-100" />

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <FileText className="w-4 h-4 text-purple-500" />
                Metodologia
              </div>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                {plan.metodologia || plan.descricao || "Nenhuma metodologia informada."}
              </div>
            </div>

            {plan.atividade && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <ClipboardList className="w-4 h-4 text-orange-500" />
                  Atividade Prevista
                </div>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  {plan.atividade}
                </div>
              </div>
            )}

            {plan.diario && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  Diário / Observações
                </div>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  {plan.diario}
                </div>
              </div>
            )}

            {plan.atividadeTurma && (
              <div className="flex items-center justify-between p-4 rounded-2xl border border-primary/10 bg-primary/[0.01] group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-primary/60 uppercase tracking-tight">Atividade Vinculada</p>
                    <p className="text-sm font-bold text-slate-800">{plan.atividadeTurma.titulo}</p>
                  </div>
                </div>
                <div className="p-2 bg-green-50 rounded-full text-green-500">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

      </SheetContent>
    </Sheet>
  );
}