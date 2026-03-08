import React from 'react';
import { Button } from "~/components/ui/button";
import { Users, BookOpen, Trash2, Edit, GraduationCap, Code } from "lucide-react";
import type { ClassDetailed } from "~/services/classes/class.service.types";
import { cn } from "~/lib/utils";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface ClassCardProps {
    turma: ClassDetailed;
    isAdmin: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

export function ClassCard({ turma, isAdmin, onEdit, onDelete }: ClassCardProps) {
    return (
        <div className="group relative h-full">

            <Accordion type="single" collapsible className="group bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                <AccordionItem
                    key={turma.id}
                    value={turma.id}
                    className="border-none"
                >
                    <div className="p-0">
                        <div className="p-5 pb-0">
                            <header className="space-y-3 mb-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">
                                            {turma.nome}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                                            <span>{turma.codigo || "---"}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                            {turma.serie.nome}
                                        </span>
                                    </div>
                                </div>
                            </header>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 border border-gray-100/50">
                                    <div className="p-2 rounded-lg bg-white shadow-sm">
                                        <Users className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Alunos</span>
                                        <span className="text-sm font-bold text-gray-700">{turma.alunosCount}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 border border-gray-100/50">
                                    <div className="p-2 rounded-lg bg-white shadow-sm">
                                        <BookOpen className="w-4 h-4 text-teal-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Disciplinas</span>
                                        <span className="text-sm font-bold text-gray-700">{turma.turmaDisciplinas.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {turma.turmaDisciplinas.length > 0 && (
                            <AccordionTrigger className="w-full px-5 py-3 text-sm font-medium text-gray-500 hover:text-primary hover:bg-gray-50/80 transition-all border-y border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4" />
                                    Grade de Disciplinas
                                </div>
                            </AccordionTrigger>
                        )}

                        <AccordionContent className="p-0">
                            <div className="p-4 bg-gray-50/30">
                                <ul className="space-y-2">
                                    {turma.turmaDisciplinas.map((td) => (
                                        <li
                                            key={td.id}
                                            className="group/item flex items-center justify-between p-2.5 rounded-lg bg-white border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                                        >
                                            <span className="text-sm font-medium text-gray-700 group-hover/item:text-primary transition-colors">
                                                {td.disciplina.nome}
                                            </span>

                                            <div className={cn(
                                                "text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-tight",
                                                td.professor
                                                    ? "bg-green-50 text-green-600 border border-green-100"
                                                    : "bg-red-50 text-red-500 border border-red-100"
                                            )}>
                                                {td.professor
                                                    ? `Prof. ${td.professor.usuario.nome.split(' ')[0]}`
                                                    : "Sem Professor"}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </AccordionContent>
                    </div>

                    {/* Footer Actions */}
                    {isAdmin && (
                        <div className="flex justify-end items-center gap-2 p-3 bg-gray-50/50 border-t border-gray-100">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit()}
                                className="h-9 w-9 p-0 rounded-full text-slate-500 hover:bg-white hover:text-primary hover:shadow-sm"
                            >
                                <Edit className="w-4 h-4" />
                                <span className="sr-only">Editar</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete()}
                                className="h-9 w-9 p-0 rounded-full hover:bg-red-50 hover:text-red-500 hover:shadow-sm text-gray-400"
                            >
                                <Trash2 className="w-4 h-4 text-red-500" />
                                <span className="sr-only">Deletar</span>
                            </Button>
                        </div>
                    )}
                </AccordionItem>
            </Accordion>
        </div>
    );
}
