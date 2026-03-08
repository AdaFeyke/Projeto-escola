"use client";

import { useActionState, useEffect } from "react";
import { FormModal } from "~/components/ui/modal/FormModal";
import { FormSection } from "~/components/ui/form/FormSection";
import { FormGrid } from "~/components/ui/form/FormGrid";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { BaseModal } from "../ui/modal/BaseModal";
import { Skeleton } from "../ui/skeleton";
import { cn } from "~/lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Trash2 } from "lucide-react";
import { deletarCalendarioAction } from "~/actions/calendar/calendar.actions";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "../ui/button";
import { useConfirm } from "~/hooks/ui/useConfirm";

interface Props {
  evento: any | null;
  action: any;
  open: boolean;
  onClose: () => void;
  isLoadingData: boolean;
  anoLetivoId: string;
  userRole?: string;
}

export function CalendarioFormModal({
  open,
  evento,
  action,
  onClose,
  isLoadingData,
  anoLetivoId,
  userRole
}: Props) {
  const isEditing = Boolean(evento);

  const [isDeleting, setIsDeleting] = useState(false);

  const [state, formAction, isPending] = useActionState(action, { success: null, message: "", values: {} as Record<string, any> });
  const { confirm } = useConfirm();

  const dataParaInputInicio = evento?.dataInicio ? new Date(evento.dataInicio).toISOString().split('T')[0] : "";
  const dataParaInputFim = evento?.dataFim ? new Date(evento.dataFim).toISOString().split('T')[0] : "";

  const [isDiaUnico, setIsDiaUnico] = useState(true);

  useEffect(() => {
    if (isEditing && dataParaInputInicio && dataParaInputFim) {
      const inicio = dataParaInputInicio.trim();
      const fim = dataParaInputFim.trim();

      setIsDiaUnico(inicio === fim);
    }
  }, [dataParaInputInicio, dataParaInputFim, isEditing]);

  const handleDelete = async () => {
    if (!evento?.id) return;

    const confirmed = await confirm({
      title: "Confirmar Exclusão",
      description: `Tem certeza que deseja excluir o evento "${evento.titulo}"?`,
      confirmText: "Sim, Excluir",
      cancelText: "Cancelar"
    });

    if (confirmed) {
      const result = await deletarCalendarioAction(evento.id);
      if (result.success) {
        setIsDeleting(true);
        toast.success("Sucesso", { description: result.message });
        onClose();
      } else {
        toast.error(result.message);
      }
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar Registro" : "Configurar Dia/Período"}
      description="Defina como este dia ou período será tratado no ano letivo"
    >
      {isLoadingData ? (
        <div className="space-y-6 p-4">
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <FormGrid>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </FormGrid>
          </div>
        </div>
      ) : (
        <FormModal
          action={formAction}
          state={state}
          isPending={isPending}
          submitLabel={isEditing ? "Atualizar Calendário" : "Salvar no Calendário"}
          onSuccess={onClose}
        >
          <input type="hidden" name="anoLetivoId" value={anoLetivoId} />
          {isEditing && <input type="hidden" name="id" value={evento!.id} />}

          <FormSection title="Classificação do Dia">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block mb-1">Título do Evento/Feriado</label>
              <Input
                name="titulo"
                placeholder="Ex: Feriado de Tiradentes ou Recesso Escolar"
                defaultValue={state?.values?.titulo ?? evento?.titulo}
                required
              />
            </div>
            <FormGrid>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block mb-1">Tipo de Data</label>
                <Select
                  name="tipo"
                  defaultValue={state?.values?.tipo ?? evento?.tipo ?? "NAO_LETIVO_FERIADO"}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAO_LETIVO_FERIADO">Feriado (Não Letivo)</SelectItem>
                    <SelectItem value="NAO_LETIVO_RECESSO">Recesso/Férias</SelectItem>
                    <SelectItem value="LETIVO_EXTRA">Dia Letivo Extra</SelectItem>
                    <SelectItem value="REUNIAO_PEDAGOGICA">Planejamento/Reunião</SelectItem>
                    <SelectItem value="EVENTO_ESCOLAR">Evento Especial (Com Aula)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isEditing && (
                <div className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold"
                    onClick={handleDelete}
                    disabled={isDeleting || isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? "Excluindo..." : "Excluir Registro"}
                  </Button>
                </div>
              )}
            </FormGrid>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 mt-6">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Bloquear Aulas</label>
                <p className="text-[10px] text-slate-500">Impede lançamento de frequência</p>
              </div>
              <Switch
                name="bloqueiaAula"
                defaultChecked={state?.values?.bloqueiaAula ?? evento?.bloqueiaAula ?? true}
              />
            </div>
          </FormSection>

          <FormSection title="Duração">
            <div className="flex items-center gap-3 mb-6 p-3 bg-primary/10 rounded-xl border border-primary/15">
              <Switch
                id="diaUnico"
                checked={isDiaUnico}
                onCheckedChange={setIsDiaUnico}
              />
              <label htmlFor="diaUnico" className="text-xs font-black uppercase text-primary cursor-pointer">
                Evento de apenas um dia
              </label>
            </div>
            <FormGrid>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block mb-1">Início</label>
                <Input
                  type="date"
                  name="dataInicio"
                  defaultValue={state?.values?.dataInicio ?? dataParaInputInicio}
                  required
                />
              </div>
              <div className={cn("space-y-2 transition-opacity", isDiaUnico && "opacity-40 grayscale pointer-events-none")}>
                <label className="text-sm font-bold text-slate-700 block mb-1">Fim {isDiaUnico && "(Mesmo dia)"}</label>
                <Input
                  type="date"
                  name="dataFim"
                  defaultValue={state?.values?.dataFim ?? (isDiaUnico ? "" : dataParaInputFim)}
                  placeholder="Deixe vazio se for apenas um dia"
                  disabled={isDiaUnico}
                />
              </div>
            </FormGrid>
          </FormSection>

          <FormSection title="Observações">
            <div className="space-y-2">
              <Textarea
                name="descricao"
                placeholder="Detalhes adicionais para professores e alunos..."
                defaultValue={state?.values?.descricao ?? evento?.descricao ?? ""}
                className="min-h-[80px]"
              />
            </div>
          </FormSection>
        </FormModal>
      )}
    </BaseModal>
  );
}