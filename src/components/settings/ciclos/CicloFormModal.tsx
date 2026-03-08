"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useActionState } from "react";
import { Clock, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { FormModal } from "~/components/ui/modal/FormModal";
import { FormSection } from "~/components/ui/form/FormSection";
import { FormGrid } from "~/components/ui/form/FormGrid";
import { BaseModal } from "~/components/ui/modal/BaseModal";

import { createCicloAction, updateCicloAction } from "~/actions/settings/ciclo.actions";
import type { CicloLetivo, AnoLetivo } from "./CicloManager";

import { toDateInputString, getDurationInDays } from "~/utils/date-utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ciclo?: CicloLetivo;
  anosLetivos: AnoLetivo[];
}

export function CicloFormModal({ isOpen, onClose, ciclo, anosLetivos }: Props) {
  const router = useRouter();
  const isEditing = Boolean(ciclo);
  const action = isEditing ? updateCicloAction : createCicloAction;

  const [state, formAction, isPending] = useActionState(action, {
    success: false,             
    message: "",
    timestamp: Date.now(),      
    values: {}
  });
  
  const [dInicio, setDInicio] = useState("");
  const [dFim, setDFim] = useState("");

  useEffect(() => {
    if (ciclo && isOpen) {
      setDInicio(toDateInputString(ciclo.dataInicio));
      setDFim(toDateInputString(ciclo.dataFim));
    }
  }, [ciclo, isOpen]);

  const duracao = useMemo(() => {
    if (dInicio && dFim) {
      return getDurationInDays(dInicio, dFim);
    }
    return null;
  }, [dInicio, dFim]);

  const isInvalidRange = duracao !== null && duracao <= 0;

  return (
    <BaseModal
      open={isOpen}
      onClose={onClose}
      title={isEditing ? `Editar ${ciclo?.nome}` : "Criar Novo Ciclo"}
      description="Configure o período e o nome do ciclo letivo"
    >
      <FormModal
        action={formAction}
        state={state}
        isPending={isPending}
        onSuccess={onClose}
        submitLabel={isEditing ? "Salvar Alterações" : "Criar Ciclo"}
      >
        {isEditing && <input type="hidden" name="cicloId" value={ciclo!.id} />}

        <FormSection title="Dados do Ciclo">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Ano Letivo</label>
            <Select
              name="anoLetivoId"
              defaultValue={state?.values?.anoLetivoId ?? ciclo?.anoLetivoId ?? anosLetivos.find(a => a.anoAtual)?.id}
            >
              <SelectTrigger >
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {anosLetivos.map((ano) => (
                  <SelectItem key={ano.id} value={ano.id}>
                    Ano {ano.ano} {ano.anoAtual && " (Atual)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Nome do Ciclo</label>
            <Input
              name="nome"
              defaultValue={state?.values?.nome ?? ciclo?.nome}
              placeholder="Ex: 1º Bimestre"
              required
            />
          </div>

          <FormGrid>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Data Início</label>
              <Input
                type="date"
                name="dataInicio"
                value={dInicio}
                onChange={(e) => setDInicio(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Data Fim</label>
              <Input
                type="date"
                name="dataFim"
                value={dFim}
                onChange={(e) => setDFim(e.target.value)}
                required
              />
            </div>
          </FormGrid>

          {duracao !== null && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm transition-colors ${isInvalidRange
              ? 'bg-red-50 border-red-100 text-red-600'
              : 'bg-primary/5 border-primary/10 text-primary'
              }`}>
              {isInvalidRange ? (
                <Calendar className="w-5 h-5 opacity-70" />
              ) : (
                <Clock className="w-5 h-5 opacity-70" />
              )}
              <span className="font-semibold">
                {isInvalidRange
                  ? "A data de fim deve ser posterior à data de início."
                  : `Duração estimada: ${duracao} dias letivos.`}
              </span>
            </div>
          )}
        </FormSection>
      </FormModal>
    </BaseModal>
  );
}