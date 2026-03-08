"use client";

import React from "react";
import { useActionState } from "react";
import { HelpCircle } from "lucide-react";

import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { FormModal } from "~/components/ui/modal/FormModal";
import { FormSection } from "~/components/ui/form/FormSection";
import { BaseModal } from "~/components/ui/modal/BaseModal";

import { createPerguntaAction, updatePerguntaAction } from "~/actions/settings/pergunta.actions";
import type { ActionResponse } from "~/services/form/ActionResponse.types";

interface Pergunta {
    id: string;
    pergunta: string;
    tipo: string | null;
    ativa: boolean;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    pergunta?: Pergunta;
}

export function PerguntaFormModal({ isOpen, onClose, pergunta }: Props) {
    const isEditing = Boolean(pergunta);
    const action = isEditing ? updatePerguntaAction : createPerguntaAction;

    const [state, formAction, isPending] = useActionState(action, {
        success: false,
        message: "",
        values: {}
    } as ActionResponse);

    return (
        <BaseModal
            open={isOpen}
            onClose={onClose}
            title={isEditing ? "Editar Pergunta" : "Nova Pergunta do Questionário"}
            description="Configure o enunciado e o tipo de resposta esperada"
        >
            <FormModal
                action={formAction}
                state={state}
                isPending={isPending}
                onSuccess={onClose}
                submitLabel={isEditing ? "Salvar Alterações" : "Criar Pergunta"}
            >
                {isEditing && <input type="hidden" name="perguntaId" value={pergunta!.id} />}

                <FormSection title="Dados da Pergunta">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block">
                                Enunciado da Pergunta
                            </label>
                            <Input
                                name="pergunta"
                                defaultValue={(state as any)?.values?.pergunta ?? pergunta?.pergunta}
                                placeholder="Ex: Possui alguma restrição alimentar?"
                                required
                                disabled={isPending}
                                className="rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block">
                                Tipo de Resposta
                            </label>
                            <Select
                                name="tipo"
                                defaultValue={(state as any)?.values?.tipo ?? pergunta?.tipo ?? "TEXTO"}
                                disabled={isPending}
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TEXTO">Texto Livre</SelectItem>
                                    <SelectItem value="CHECKBOX">Múltipla Escolha (Checkbox)</SelectItem>
                                    <SelectItem value="OPCOES">Opção Única (Rádio)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </FormSection>
            </FormModal>
        </BaseModal>
    );
}
