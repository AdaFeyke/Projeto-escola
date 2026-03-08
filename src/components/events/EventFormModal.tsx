"use client";

import { useActionState } from "react";
import { FormModal } from "~/components/ui/modal/FormModal";
import { FormSection } from "~/components/ui/form/FormSection";
import { FormGrid } from "~/components/ui/form/FormGrid";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

import type { EventoDetailed } from "~/services/events/event.service.types";
import { BaseModal } from "../ui/modal/BaseModal";
import { Skeleton } from "../ui/skeleton";

interface Props {
  evento: EventoDetailed | null;
  action: any;
  open: boolean;
  onClose: () => void;
  isLoadingData: boolean;
}

export function EventoFormModal({ open, evento, action, onClose, isLoadingData }: Props) {
  const isEditing = Boolean(evento);

  const [state, formAction, isPending] = useActionState(action, { success: null, message: "", values: {} as Record<string, any> });

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar Evento" : "Novo Evento"}
      description="Preencha os dados abaixo para continuar"
    >
      {isLoadingData ? (
        <div className="space-y-6 p-4">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-28 w-28 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ) : (

        <FormModal
          action={formAction}
          state={state}
          isPending={isPending}
          submitLabel={isEditing ? "Salvar Evento" : "Cadastrar Evento"}
          onSuccess={onClose}
        >
          {isEditing && (
            <input type="hidden" name="eventoId" value={evento!.id} />
          )}

          <FormSection title="Dados do Evento">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block mb-1">Nome do Evento</label>
              <Input
                name="nome"
                placeholder="Digite o nome do evento"
                defaultValue={state?.values?.nome ?? evento?.nome}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block mb-1">Descrição</label>
              <Textarea
                name="descricao"
                placeholder="Descreva detalhes como roteiro ou itens necessários"
                defaultValue={state?.values?.descricao ?? evento?.descricao ?? ""}
                className="min-h-[100px]"
              />
            </div>

            <FormGrid>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">Data do Evento</label>
                <Input
                  type="date"
                  name="dataEvento"
                  defaultValue={
                    state?.values?.dataEvento ??
                    (evento ? evento.dataEvento : "")
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">Local</label>
                <Input
                  name="local"
                  placeholder="Onde será realizado?"
                  defaultValue={state?.values?.local ?? evento?.local ?? ""}
                />
              </div>
            </FormGrid>

            <FormGrid>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">Valor</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-700">
                    R$
                  </span>
                  <Input
                    type="number"
                    name="valor"
                    step="0.01"
                    className="pl-10"
                    defaultValue={state?.values?.valor ?? evento?.valor.toString()}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">Limite de Vagas</label>
                <Input
                  type="number"
                  name="vagas"
                  defaultValue={state?.values?.vagas ?? evento?.vagas ?? ""}
                  placeholder="Ex: 50"
                />
              </div>
            </FormGrid>
          </FormSection>
        </FormModal>
      )}
    </BaseModal >
  );
}
