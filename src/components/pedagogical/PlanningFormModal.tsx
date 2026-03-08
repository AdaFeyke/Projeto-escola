"use client";

import React, { useActionState, useState, useEffect } from "react";
import { AlertCircle, BookOpen, Check, CheckCircle2, ChevronsUpDown, ClipboardList, FileText, Target, X } from "lucide-react";
import { getDay } from "date-fns";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { FormModal } from "~/components/ui/modal/FormModal";
import { FormSection } from "~/components/ui/form/FormSection";
import { FormGrid } from "~/components/ui/form/FormGrid";
import { BaseModal } from "~/components/ui/modal/BaseModal";
import { Badge } from "~/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { Alert, AlertDescription } from "~/components/ui/alert";

import { createPlanningAction, updatePlanningAction, checkDateStatusAction } from "~/actions/pedagogical/planningActions";
import type { ActionResponse } from "~/services/form/ActionResponse.types";

interface PlanningData {
    id: string;
    titulo: string;
    conteudo: string;
    objetivos: string;
    metodologia: string;
    diario: string;
    observacoes: string;
    atividade: string;
    data: Date | string;
    turmaId: string;
    disciplinas: { id: string; nome: string }[];
}

interface Props {
    open: boolean;
    onClose: () => void;
    turmas: { id: string; nome: string; disciplinas: { id: string; nome: string }[] }[];
    disciplinas: { id: string; nome: string }[];
    initialData?: PlanningData | null;
}

const DAYS_OF_WEEK = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

export function PlanningFormModal({ open, onClose, turmas, disciplinas: allDisciplinas, initialData }: Props) {
    const isEditing = !!initialData;
    const action = isEditing ? updatePlanningAction : createPlanningAction;

    const [state, formAction, isPending] = useActionState(action, {
        success: false,
        message: "",
        values: initialData || {}
    } as ActionResponse);

    const [selectedTurmaId, setSelectedTurmaId] = useState(initialData?.turmaId || "");
    const [selectedDisciplinaIds, setSelectedDisciplinaIds] = useState<string[]>(
        initialData?.disciplinas?.map(d => d.id) || []
    );
    const [data, setData] = useState(
        initialData?.data
            ? (typeof initialData.data === "string" ? initialData.data.split("T")[0] : initialData.data.toISOString().split("T")[0])
            : new Date().toISOString().split("T")[0]
    );

    const [dateStatus, setDateStatus] = useState<{
        hasHoliday?: boolean;
        holidayName?: string;
        hasEvent?: boolean;
        eventName?: string;
        bloqueiaAula?: boolean;
        isLoading?: boolean;
    }>({});

    const currentTurma = turmas.find(t => t.id === selectedTurmaId);
    const availableDisciplinas = currentTurma?.disciplinas || [];

    useEffect(() => {
        if (open && initialData) {
            setSelectedTurmaId(initialData.turmaId);
            setSelectedDisciplinaIds(initialData.disciplinas.map(d => d.id));
            setData(typeof initialData.data === "string" ? initialData.data.split("T")[0] : initialData.data.toISOString().split("T")[0]);
        }
    }, [initialData, open]);

    useEffect(() => {
        const checkDate = async () => {
            if (!data) return;
            setDateStatus({ isLoading: true });
            const status = await checkDateStatusAction(data);
            setDateStatus({ ...status, isLoading: false });
        };
        checkDate();
    }, [data]);

    const toggleDisciplina = (id: string) => {
        setSelectedDisciplinaIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const dayOfWeek = data ? DAYS_OF_WEEK[getDay(new Date(data.replace(/-/g, '\/')))] : "";

    return (
        <BaseModal
            open={open}
            onClose={onClose}
            title={isEditing ? "Editar Planejamento" : "Novo Planejamento"}
            description="Preencha os detalhes pedagógicos da aula abaixo."
        >
            <FormModal
                action={formAction}
                state={state}
                isPending={isPending}
                onSuccess={onClose}
                submitLabel={isEditing ? "Salvar Alterações" : "Cadastrar Planejamento"}
            >
                {isEditing && <input type="hidden" name="id" value={initialData.id} />}

                <FormSection title="Contexto da Aula">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block mb-1">Título do Planejamento</label>
                        <Input
                            name="titulo"
                            defaultValue={state?.values?.titulo ?? initialData?.titulo}
                            placeholder="Ex: Introdução à Termodinâmica"
                            required
                        />
                    </div>

                    <FormGrid>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                                Data da Aula {dayOfWeek && <span className="text-primary font-bold ml-1">({dayOfWeek})</span>}
                            </label>
                            <Input
                                type="date"
                                name="data"
                                value={data}
                                onChange={(e) => setData(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block mb-1">Turma</label>
                            <Select
                                value={selectedTurmaId}
                                onValueChange={(id) => {
                                    setSelectedTurmaId(id);
                                    setSelectedDisciplinaIds([]);
                                }}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a turma..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {turmas.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <input type="hidden" name="turmaId" value={selectedTurmaId} />
                        </div>
                    </FormGrid>

                    {/* Alerta de Calendário */}
                    {(dateStatus.hasHoliday || dateStatus.hasEvent) && (
                        <Alert variant={dateStatus.bloqueiaAula ? "destructive" : "default"} className="py-3">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs font-medium">
                                {dateStatus.hasHoliday && `${dateStatus.holidayName}. `}
                                {dateStatus.hasEvent && `Evento: ${dateStatus.eventName}. `}
                                {dateStatus.bloqueiaAula && <strong>Aulas bloqueadas neste dia.</strong>}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block mb-1">Disciplinas</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-between font-normal",
                                        !selectedTurmaId && "opacity-50 cursor-not-allowed"
                                    )}
                                    disabled={!selectedTurmaId}
                                >
                                    {selectedDisciplinaIds.length > 0
                                        ? `${selectedDisciplinaIds.length} selecionada(s)`
                                        : "Selecionar disciplinas..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-2" align="start">
                                <div className="space-y-1">
                                    {availableDisciplinas.length === 0 ? (
                                        <p className="text-xs text-center p-2 text-gray-500">Selecione uma turma primeiro</p>
                                    ) : (
                                        availableDisciplinas.map((d) => (
                                            <div
                                                key={d.id}
                                                onClick={() => toggleDisciplina(d.id)}
                                                className={cn(
                                                    "flex items-center justify-between p-2 rounded-md cursor-pointer text-sm",
                                                    selectedDisciplinaIds.includes(d.id) ? "bg-primary/10 text-primary font-bold" : "hover:bg-gray-100"
                                                )}
                                            >
                                                {d.nome}
                                                {selectedDisciplinaIds.includes(d.id) && <Check className="w-4 h-4" />}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <div className="flex flex-wrap gap-1 mt-2">
                            {selectedDisciplinaIds.map(id => {
                                const d = allDisciplinas.find(dis => dis.id === id);
                                return (
                                    <Badge key={id} variant="secondary" className="text-[10px] gap-1 py-0.5">
                                        {d?.nome}
                                        <X className="w-3 h-3 cursor-pointer" onClick={() => toggleDisciplina(id)} />
                                    </Badge>
                                );
                            })}
                        </div>
                        {selectedDisciplinaIds.map(id => (
                            <input key={id} type="hidden" name="disciplinaIds" value={id} />
                        ))}
                    </div>
                </FormSection>

                <FormSection title="Conteúdo Pedagógico">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                            <BookOpen className="w-4 h-4 text-primary" />
                            Conteúdo / Assuntos
                        </label>
                        <Textarea
                            name="conteudo"
                            defaultValue={state?.values?.conteudo ?? initialData?.conteudo}
                            placeholder="Tópicos que serão abordados"
                            className="min-h-[80px]"
                            required
                        />
                    </div>

                    <FormGrid>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-emerald-500" />
                                Objetivos de Aprendizagem
                            </label>
                            <Textarea
                                name="objetivos"
                                defaultValue={state?.values?.objetivos ?? initialData?.objetivos}
                                placeholder="O que o aluno deve aprender"
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-purple-500" />
                                Metodologia
                            </label>
                            <Textarea
                                name="metodologia"
                                defaultValue={state?.values?.metodologia ?? initialData?.metodologia}
                                placeholder="Como a aula será conduzida"
                                className="min-h-[100px]"
                            />
                        </div>
                    </FormGrid>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                            <ClipboardList className="w-4 h-4 text-orange-500" />
                            Atividade Prevista
                        </label>
                        <Textarea
                            name="atividade"
                            defaultValue={state?.values?.atividade ?? initialData?.atividade}
                            placeholder="Exercícios ou tarefas práticas"
                            className="min-h-[80px]"
                        />
                    </div>
                </FormSection>

                <FormSection title="Observações e Registros">
                    <FormGrid cols={1}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                Diário / Observações
                            </label>
                            <Textarea
                                name="diario"
                                defaultValue={state?.values?.diario ?? initialData?.diario}
                                placeholder="Relato do que aconteceu na aula"
                                className="text-xs"
                            />
                        </div>
                        {/*<div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block mb-1">Observações Admin</label>
                            <Textarea
                                name="observacoes"
                                defaultValue={state?.values?.observacoes ?? initialData?.observacoes}
                                placeholder="Notas para a coordenação"
                                className="text-xs italic"
                            />
                        </div>*/}
                    </FormGrid>
                </FormSection>
            </FormModal>
        </BaseModal>
    );
}