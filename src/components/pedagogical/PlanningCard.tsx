"use client";

import React from "react";
import {
    Calendar as CalendarIcon,
    Trash2,
    Edit,
    ClipboardList,
    Target,
    BookOpen,
    Info,
    GraduationCap,
    FileText,
    CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { approvePlanningAction } from "~/actions/pedagogical/planningActions";
import { toast } from "sonner";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "~/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

interface PlanningCardProps {
    plan: any;
    isAdmin: boolean;
    onDelete: (id: string) => void;
    onEdit: (plan: any) => void;
    onViewDetails: (plan: any) => void;
}

export function PlanningCard({ plan, isAdmin, onDelete, onEdit, onViewDetails }: PlanningCardProps) {
    return (
        <div className="group relative h-full">
            <Accordion
                type="single"
                collapsible
                className="group bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
            >
                <AccordionItem value={plan.id} className="border-none">
                    <div className="p-5 pb-0">
                        <header className="space-y-3 mb-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-1">
                                        {plan.disciplinas && plan.disciplinas.length > 0 ? (
                                            plan.disciplinas.map((d: any) => (
                                                <span key={d.id} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-tighter">
                                                    {d.nome}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-tighter">
                                                {plan.disciplina?.nome || "Geral"}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors duration-300 leading-tight">
                                        {plan.titulo}
                                    </h3>
                                    {isAdmin && (
                                        <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                                            <GraduationCap className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                                {plan.professor?.usuario?.nome || "Professor"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="text-right">
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        <CalendarIcon className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold uppercase tracking-tighter">
                                            {format(new Date(plan.data), "dd/MM/yyyy", { locale: ptBR })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 border border-gray-100/50">
                                <div className="p-2 rounded-lg bg-white shadow-sm">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Turma</span>
                                    <span className="text-sm font-bold text-gray-700 truncate max-w-[80px]">{plan.turma.nome}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 border border-gray-100/50">
                                <div className="p-2 rounded-lg bg-white shadow-sm">
                                    <ClipboardList className="w-4 h-4 text-teal-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
                                    <div className={cn(
                                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit",
                                        plan.status === 'APROVADO' ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                                            plan.status === 'REJEITADO' ? "bg-red-100 text-red-700 border border-red-200" :
                                                "bg-amber-100 text-amber-700 border border-amber-200"
                                    )}>
                                        {plan.status || "PENDENTE"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trigger para Detalhes Pedagógicos */}
                    <AccordionTrigger className="w-full px-5 py-3 text-sm font-medium text-gray-500 hover:text-primary hover:bg-gray-50/80 transition-all border-y border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Conteúdo Pedagógico
                        </div>
                    </AccordionTrigger>

                    <AccordionContent className="p-0">
                        <div className="p-4 bg-gray-50/30 space-y-4">
                            {/* Assuntos */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                    Conteúdo / Assuntos
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    "{plan.conteudo || plan.assuntos || 'Sem conteúdo registrado'}"
                                </p>
                            </div>

                            {/* Objetivos */}
                            {plan.objetivos && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <Target className="w-4 h-4 text-emerald-500" />
                                        Objetivos de Aprendizagem
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {plan.objetivos}
                                    </p>
                                </div>
                            )}

                            {/* Metodologia */}
                            {plan.metodologia && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <FileText className="w-4 h-4 text-purple-500" />
                                        Metodologia
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {plan.metodologia}
                                    </p>
                                </div>
                            )}

                            {/* Atividade */}
                            {plan.atividade && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <ClipboardList className="w-4 h-4 text-orange-500" />
                                        Atividade Prevista
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {plan.atividade}
                                    </p>
                                </div>
                            )}

                            {/* Diario */}
                            {isAdmin && plan.diario && (
                                <div className="space-y-1 border-t pt-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                        Diário / Observações
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {plan.diario}
                                    </p>
                                </div>
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewDetails(plan)}
                                className="w-full mt-2 bg-white border-gray-200 text-gray-500 hover:text-primary hover:border-primary/30 rounded-xl font-bold text-xs uppercase tracking-widest"
                            >
                                Ver Detalhes Completos
                            </Button>
                        </div>
                    </AccordionContent>

                    {/* Footer Actions (Mantendo o padrão do ClassCard) */}
                    <div className="flex justify-between items-center p-3 bg-gray-50/50 border-t border-gray-100">
                        <div className="pl-2 flex items-center gap-2">
                            {isAdmin && (
                                <Select
                                    defaultValue={plan.status || "PENDENTE"}
                                    onValueChange={async (val: any) => {
                                        const res = await approvePlanningAction(plan.id, val);
                                        if (res.success) toast.success(res.message);
                                        else toast.error(res.message);
                                    }}
                                >
                                    <SelectTrigger className={cn(
                                        "h-8 rounded-lg border-2 font-black text-[10px] uppercase tracking-tighter px-3 min-w-[120px]",
                                        plan.status === 'APROVADO' ? "border-emerald-200 text-emerald-600 bg-emerald-50" :
                                            plan.status === 'REJEITADO' ? "border-red-200 text-red-600 bg-red-50" : "border-amber-200 text-amber-600 bg-amber-50"
                                    )}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                        <SelectItem value="PENDENTE" className="font-black text-[10px] uppercase text-amber-600">Pendente</SelectItem>
                                        <SelectItem value="APROVADO" className="font-black text-[10px] uppercase text-emerald-600">Aprovado</SelectItem>
                                        <SelectItem value="REJEITADO" className="font-black text-[10px] uppercase text-red-600">Rejeitado</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(plan)}
                                className="h-9 w-9 p-0 rounded-full text-gray-400 hover:bg-white hover:text-primary hover:shadow-sm"
                            >
                                <Edit className="w-4 h-4" />
                                <span className="sr-only">Editar</span>
                            </Button>

                            {isAdmin && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDelete(plan.id)}
                                    className="h-9 w-9 p-0 rounded-full hover:bg-red-50 hover:text-red-500 text-gray-400"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="sr-only">Deletar</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </AccordionItem>
            </Accordion>
        </div>
    );
}