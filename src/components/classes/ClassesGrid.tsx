"use client";

import React, { useState } from "react";
import { BookOpen } from "lucide-react";

import { useConfirm } from "~/hooks/ui/useConfirm"

import type {
    ClassDetailed,
    SerieSimple,
    AnoLetivoSimple,
    DisciplinaSimple,
} from "~/services/classes/class.service.types";

import { ClassCard } from "./ClassCard";
import ClassFormModal from "./ClassFormModal";
import type { ActionResponse } from "~/services/form/ActionResponse.types";

import { toast } from "sonner";

import type {
    createClassAction,
    updateClassAction
} from '~/actions/classes/class.actions';

import type { TeacherDetailed } from "~/services/teachers/teacher.service.types";
import { PageHeader } from "../ui/PageHeader";

interface ClassesGridProps {
    classes: ClassDetailed[];
    series: SerieSimple[];
    anosLetivos: AnoLetivoSimple[];
    disciplinas: DisciplinaSimple[];
    professores: TeacherDetailed[];
    isAdmin: boolean;
    createAction: typeof createClassAction;
    updateAction: typeof updateClassAction;
    deleteAction: (formData: FormData) => Promise<ActionResponse>;
}

export default function ClassesGrid({
    classes,
    series,
    anosLetivos,
    disciplinas,
    professores,
    isAdmin,
    createAction,
    updateAction,
    deleteAction,
}: ClassesGridProps) {

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<ClassDetailed | undefined>();

    const { confirm } = useConfirm();

    const openEditModal = (classItem: ClassDetailed) => {
        setEditingClass(classItem);
        setIsCreateModalOpen(true);
    };

    const closeModal = () => {
        setIsCreateModalOpen(false);
        setEditingClass(undefined);
    };

    const handleDelete = async (turmaId: string, turmaNome: string, turmaSerie: string) => {
        const confirmed = await confirm({
            title: "Confirmar Exclusão",
            description: `Tem certeza que deseja deletar a turma "${turmaNome}" da série "${turmaSerie}"?`,
            confirmText: "Sim, Excluir",
            cancelText: "Cancelar"
        });

        if (confirmed) {
            const data = new FormData();
            data.append('classId', turmaId);

            const result = await deleteAction(data);
            if (result.success) {
                toast.success("Sucesso", { description: result.message });
            } else {
                toast.error("Erro", { description: result.message });
            }
        }
    };


    const groupedClasses = classes.reduce<Record<string, ClassDetailed[]>>(
        (acc, turma) => {
            const ano = turma.anoLetivo.ano.toString();
            acc[ano] ??= [];
            acc[ano].push(turma);
            return acc;
        },
        {}
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Turmas"
                description="Organize suas turmas e faça alocação de professores."
                backHref="/dashboard"
                iconElement={<BookOpen className="w-7 h-7 md:w-8 md:h-8" />}
                buttonLabel="Nova Turma"
                showButton={isAdmin}
                onButtonClick={() => setIsCreateModalOpen(true)}
            />

            {Object.keys(groupedClasses)
                .sort()
                .reverse()
                .map((ano) => (
                    <div key={ano} className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-700">
                            Ano Letivo {ano} (Turmas: {groupedClasses[ano]?.length})
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                            {groupedClasses[ano]?.map((turma) => (
                                <ClassCard
                                    key={turma.id}
                                    turma={turma}
                                    isAdmin={isAdmin}
                                    onEdit={() => openEditModal(turma)}
                                    onDelete={() => handleDelete(turma.id, turma.nome, turma.serie.nome)}
                                />
                            ))}
                        </div>
                    </div>
                ))}

            {classes.length === 0 && (
                <p className="text-center text-gray-500 py-10">
                    Nenhuma turma encontrada.
                </p>
            )}

            {isCreateModalOpen && (
                <ClassFormModal
                    title={editingClass ? "Editar Turma" : "Criar Nova Turma"}
                    action={editingClass ? updateAction : createAction}
                    isOpen={isCreateModalOpen}
                    onClose={closeModal}
                    classData={editingClass}
                    availableSeries={series}
                    availableAnoLetivo={anosLetivos}
                    availableDisciplinas={disciplinas}
                    availableProfessores={professores}
                    linkedDisciplinas={
                        editingClass
                            ? editingClass.turmaDisciplinas.map(td => td.disciplina.id)
                            : []
                    }
                />
            )}
        </div>
    );
}