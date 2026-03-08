"use client";

import React from "react";
import { useActionState } from "react";

import { Input } from "~/components/ui/input";
import { FormModal } from "~/components/ui/modal/FormModal";
import { FormSection } from "~/components/ui/form/FormSection";
import { BaseModal } from "~/components/ui/modal/BaseModal";

import { createSerieAction, updateSerieAction } from "~/actions/settings/serie.actions";

interface Serie {
    id: string;
    nome: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    serie?: Serie;
}

export function SerieFormModal({ isOpen, onClose, serie }: Props) {
    const isEditing = Boolean(serie);
    const action = isEditing ? updateSerieAction : createSerieAction;

    const [state, formAction, isPending] = useActionState(action, {
        success: false,
        message: "",
        values: {},
    });

    return (
        <BaseModal
            open={isOpen}
            onClose={onClose}
            title={isEditing ? `Editar ${serie?.nome}` : "Criar Nova Série"}
            description="Defina o nome da série acadêmica"
        >
            <FormModal
                action={formAction}
                state={state}
                isPending={isPending}
                onSuccess={onClose}
                submitLabel={isEditing ? "Salvar Alterações" : "Criar Série"}
            >
                {isEditing && <input type="hidden" name="serieId" value={serie!.id} />}

                <FormSection title="Dados da Série">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">
                            Nome da Série
                        </label>
                        <Input
                            name="nome"
                            defaultValue={state?.values?.nome ?? serie?.nome}
                            placeholder="Ex: 1º Ano, 6ª Série"
                            required
                            disabled={isPending}
                            className="rounded-xl"
                        />
                    </div>
                </FormSection>
            </FormModal>
        </BaseModal>
    );
}
