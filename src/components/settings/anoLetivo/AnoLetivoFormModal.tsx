"use client";

import React from "react";
import { useActionState } from "react";
import { Calendar } from "lucide-react";

import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { FormModal } from "~/components/ui/modal/FormModal";
import { FormSection } from "~/components/ui/form/FormSection";
import { BaseModal } from "~/components/ui/modal/BaseModal";

import { createAnoLetivoAction, updateAnoLetivoAction } from "~/actions/settings/anoLetivo.actions";
import type { ActionResponse } from "~/services/form/ActionResponse.types";

interface AnoLetivo {
    id: string;
    ano: number;
    anoAtual: boolean;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    anoLetivo?: AnoLetivo;
}

export function AnoLetivoFormModal({ isOpen, onClose, anoLetivo }: Props) {
    const isEditing = Boolean(anoLetivo);
    const action = isEditing ? updateAnoLetivoAction : createAnoLetivoAction;

    const [state, formAction, isPending] = useActionState(action, {
        success: false,
        message: "",
        values: {}
    } as ActionResponse);

    return (
        <BaseModal
            open={isOpen}
            onClose={onClose}
            title={isEditing ? `Editar Ano Letivo ${anoLetivo?.ano}` : "Criar Novo Ano Letivo"}
            description="Configure o ano letivo e defina se ele é o atual"
        >
            <FormModal
                action={formAction}
                state={state}
                isPending={isPending}
                onSuccess={onClose}
                submitLabel={isEditing ? "Salvar Alterações" : "Criar Ano Letivo"}
            >
                {isEditing && <input type="hidden" name="anoLetivoId" value={anoLetivo!.id} />}

                <FormSection title="Dados do Período">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">Ano</label>
                        <Input
                            name="ano"
                            type="number"
                            defaultValue={(state as any)?.values?.ano ?? anoLetivo?.ano ?? new Date().getFullYear()}
                            placeholder={`Ex: ${new Date().getFullYear()}`}
                            required
                            disabled={isPending}
                            className="rounded-xl"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mt-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">Definir como atual</span>
                            <span className="text-xs text-slate-500">Este ano será o padrão para novas turmas</span>
                        </div>
                        <Switch
                            name="isCurrent"
                            defaultChecked={(state as any)?.values?.isCurrent ?? anoLetivo?.anoAtual}
                            disabled={isPending}
                        />
                    </div>
                </FormSection>
            </FormModal>
        </BaseModal>
    );
}
