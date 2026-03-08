"use client";

import React from "react";
import { useActionState } from "react";
import { BookOpen } from "lucide-react";

import { Input } from "~/components/ui/input";
import { FormModal } from "~/components/ui/modal/FormModal";
import { FormSection } from "~/components/ui/form/FormSection";
import { BaseModal } from "~/components/ui/modal/BaseModal";

import { createDisciplinaAction, updateDisciplinaAction } from "~/actions/settings/disciplines.actions";
import type { ActionResponse } from "~/services/form/ActionResponse.types";

interface Disciplina {
    id: string;
    nome: string;
    sigla: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    disciplina?: Disciplina;
}

export function DisciplinaFormModal({ isOpen, onClose, disciplina }: Props) {
    const isEditing = Boolean(disciplina);
    const action = isEditing ? updateDisciplinaAction : createDisciplinaAction;

    const [state, formAction, isPending] = useActionState(action, {
        success: false,
        message: "",
        values: {}
    } as ActionResponse);

    return (
        <BaseModal
            open={isOpen}
            onClose={onClose}
            title={isEditing ? `Editar ${disciplina?.nome}` : "Criar Nova Disciplina"}
            description="Configure o nome e a sigla da disciplina"
        >
            <FormModal
                action={formAction}
                state={state}
                isPending={isPending}
                onSuccess={onClose}
                submitLabel={isEditing ? "Salvar Alterações" : "Criar Disciplina"}
            >
                {isEditing && <input type="hidden" name="disciplinaId" value={disciplina!.id} />}

                <FormSection title="Dados da Disciplina">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block">
                                Nome da Disciplina
                            </label>
                            <Input
                                name="nome"
                                defaultValue={(state as any)?.values?.nome ?? disciplina?.nome}
                                placeholder="Ex: Matemática, Português"
                                required
                                disabled={isPending}
                                className="rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block">
                                Sigla
                            </label>
                            <Input
                                name="sigla"
                                defaultValue={(state as any)?.values?.sigla ?? disciplina?.sigla}
                                placeholder="Ex: MAT"
                                maxLength={5}
                                required
                                disabled={isPending}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                </FormSection>
            </FormModal>
        </BaseModal>
    );
}
