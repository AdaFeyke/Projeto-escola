"use client";

import React, { useState, useEffect } from "react";

import { useActionState } from "react";
import { createClassAction } from '~/actions/classes/class.actions';

import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox"; 

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "~/components/ui/dialog";

import type {
    ClassDetailed,
    SerieSimple,
    AnoLetivoSimple,
    DisciplinaSimple
} from "~/services/classes/class.service.types";
import type { TeacherDetailed } from "~/services/teachers/teacher.service.types";

type ProfessorMapping = {
    [disciplinaId: string]: string | undefined;
};

interface ClassFormModalProps {
    title: string;
    action: typeof createClassAction | ((...args: any[]) => Promise<any>);
    isOpen: boolean;
    onClose: () => void;
    classData?: ClassDetailed;
    availableSeries: SerieSimple[];
    availableAnoLetivo: AnoLetivoSimple[];
    availableDisciplinas: DisciplinaSimple[];
    availableProfessores: TeacherDetailed[];
    linkedDisciplinas?: string[];
}

export default function ClassFormModal({
    title,
    action,
    isOpen,
    onClose,
    classData,
    availableSeries,
    availableAnoLetivo,
    availableDisciplinas,
    availableProfessores
}: ClassFormModalProps) {
    const isEditing = !!classData;
    const [state, formAction, isPending] = useActionState(
        action,
        { success: false, message: '' }
    );

    const [selectedDisciplinas, setSelectedDisciplinas] = useState<string[]>(
        classData?.turmaDisciplinas?.map(td => td.disciplina.id) ?? []
    );

    const [professorMapping, setProfessorMapping] = useState<ProfessorMapping>(() => {
        if (classData?.turmaDisciplinas) {
            return classData.turmaDisciplinas.reduce((acc, td) => {
                const professorValue = td.professor?.id
                    ? td.professor.id
                    : "nao_alocado";

                acc[td.disciplina.id] = professorValue;
                return acc;
            }, {} as ProfessorMapping);
        }
        return {};
    });

    const [formData, setFormData] = useState({
        nome: classData?.nome ?? "",
        codigo: classData?.codigo ?? "", 
        serieId: classData?.serie.id ?? "",
        anoLetivoId: classData?.anoLetivo.id ?? "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const toggleDisciplina = (id: string) => {
        setSelectedDisciplinas(prev => {
            const isCurrentlySelected = prev.includes(id);

            if (isCurrentlySelected) {
                setProfessorMapping(mapping => {
                    const { [id]: _, ...rest } = mapping;
                    return rest;
                });
                return prev.filter(d => d !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleProfessorChange = (disciplinaId: string, professorId: string) => {
        setProfessorMapping(prev => ({
            ...prev,
            [disciplinaId]: professorId,
        }));
    };

    const getDisciplinasPayload = () => {
        return selectedDisciplinas.map(disciplinaId => ({
            disciplinaId: disciplinaId,
            professorId: professorMapping[disciplinaId] || null, 
        }));
    };


    useEffect(() => {
        if (state.message && !isPending) {
            if (state.success) {
                toast.success("Sucesso!", { description: state.message });
                onClose();
            } else {
                toast.error("Erro", { description: state.message });
            }
        }
    }, [state, isPending, onClose]);

    const handleSubmit = (formData: FormData) => {
        const disciplinasPayload = getDisciplinasPayload();
        formData.append('disciplinasPayload', JSON.stringify(disciplinasPayload));
        formAction(formData);
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Preencha os dados abaixo para continuar.
                    </DialogDescription>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-4">
                    {isEditing && (
                        <input type="hidden" name="classId" value={classData.id} />
                    )}

                    <h3 className="text-md font-semibold text-gray-700 pt-2">
                        Dados da Turma
                    </h3>

                    <Input
                        name="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Nome da Turma (ex: Turma A)"
                        required
                        autoComplete="off"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Série</label>
                            <Select
                                value={formData.serieId}
                                onValueChange={(newValue) => handleSelectChange("serieId", newValue)}
                                name="serieId"
                                required
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione a Série" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableSeries.map((serie) => (
                                        <SelectItem key={serie.id} value={serie.id}>
                                            {serie.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Ano Letivo</label>
                            <Select
                                value={formData.anoLetivoId}
                                onValueChange={(newValue) => handleSelectChange("anoLetivoId", newValue)}
                                name="anoLetivoId"
                                required
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione o Ano Letivo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableAnoLetivo.map((ano) => (
                                        <SelectItem key={ano.id} value={ano.id}>
                                            {ano.ano}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <h3 className="text-md font-semibold text-gray-700 pt-4 border-t">
                        Alocação de Disciplinas e Professores
                    </h3>

                    <div className="border rounded-lg p-3 max-h-72 overflow-y-auto space-y-3">
                        {availableDisciplinas.map((disciplina) => {
                            const isSelected = selectedDisciplinas.includes(disciplina.id);

                            return (
                                <div
                                    key={disciplina.id}
                                    className={`flex flex-col md:flex-row items-start md:items-center gap-2 p-2 rounded-md transition ${isSelected ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center flex-1 min-w-[150px]">
                                        <Checkbox
                                            id={`disc-${disciplina.id}`}
                                            checked={isSelected}
                                            onCheckedChange={() => toggleDisciplina(disciplina.id)}
                                            className="mr-3"
                                        />
                                        <label
                                            htmlFor={`disc-${disciplina.id}`}
                                            className="font-medium text-sm cursor-pointer"
                                        >
                                            {disciplina.nome}
                                        </label>
                                    </div>

                                    <div className="">
                                        {isSelected ? (
                                            <Select
                                                value={professorMapping[disciplina.id]}
                                                onValueChange={(newValue) => handleProfessorChange(disciplina.id, newValue)}
                                                disabled={isPending}
                                            >
                                                <SelectTrigger className="w-full text-xs">
                                                    <SelectValue placeholder="Alocar Professor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="nao_alocado">
                                                        (Nenhum Professor Alocado)
                                                    </SelectItem>
                                                    {availableProfessores.map((professor) => (
                                                        <SelectItem key={professor.id} value={professor.id}>
                                                            {professor.usuario.nome}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <span className="text-xs text-gray-400">Não Alocado</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {availableDisciplinas.length === 0 && (
                            <p className="text-sm text-gray-500 py-4 text-center">
                                Nenhuma disciplina cadastrada para alocação.
                            </p>
                        )}
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : isEditing ? (
                                "Salvar Alterações"
                            ) : (
                                "Criar Turma"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}