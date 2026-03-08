// ~/components/calendar/AtividadeFormSheet.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { BookOpen, Users, Info, CalendarCheck, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { createAtividadeAction, updateAtividadeAction } from "~/actions/classes/atividade/atividade.actions";
import { cn } from "~/lib/utils";


export function AtividadeFormSheet({
  isOpen,
  onClose,
  date,
  ciclo,
  turmas = [],
  userRole,
  professorId,
  evento,
  ciclos = [],
  defaultTurmaId
}: any) {
  const [loading, setLoading] = useState(false);

  const firstTurmaId = userRole === 'ALUNO' && turmas.length > 0 ? turmas[0].id : "";
  const preSelectedTurmaId = evento?.turmaId || (defaultTurmaId && defaultTurmaId !== "TODAS" ? defaultTurmaId : firstTurmaId);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setSelectedTurmaId(preSelectedTurmaId);
    }
  }, [isOpen, preSelectedTurmaId]);

  const disciplinasDisponiveis = useMemo(() => {
    const turma = turmas.find((t: any) => t.id === selectedTurmaId);
    if (!turma) return [];

    if (userRole === 'PROFESSOR' && professorId) {
      return turma.disciplinas.filter((d: any) => d.professorId === professorId);
    }

    return turma.disciplinas || [];
  }, [selectedTurmaId, turmas, userRole, professorId]);

  const currentCiclo = useMemo(() => {
    if (ciclo?.id) return ciclo;
    if (!date || !ciclos.length) return null;
    return ciclos.find((c: any) => {
      const inicio = new Date(c.dataInicio);
      const fim = new Date(c.dataFim);
      // Ajuste para evitar problemas de fuso horário
      const d = new Date(date);
      d.setHours(12, 0, 0, 0);
      return d >= inicio && d <= fim;
    });
  }, [ciclo, date, ciclos]);


  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      formData.append("data", date?.toISOString() || "");

      const finalCicloId = currentCiclo?.id || "";
      formData.append("cicloId", finalCicloId);

      if (!formData.get("turmaId") && selectedTurmaId) {
        formData.append("turmaId", selectedTurmaId);
      }

      let result;
      if (evento?.id) {
        formData.append("id", evento.id);
        result = await updateAtividadeAction({ success: false, message: "" }, formData);
      } else {
        result = await createAtividadeAction({ success: false, message: "" }, formData);
      }

      if (result.success) {
        toast.success("Atividade agendada com sucesso!");
        onClose();
      } else {
        toast.error(result.message || "Erro ao salvar");
      }
    } catch (error) {
      toast.error("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto flex flex-col gap-0 p-0">
        <div className="p-6 bg-slate-50/50 border-b">
          <SheetHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarCheck className="w-6 h-6 text-primary" />
              </div>
              <SheetTitle className="text-2xl font-black">
                {`${evento ? "Editar" : "Agendar"} ${["PROVA", "TRABALHO", "SEMINARIO", "OUTRO"].includes(evento?.tipo) || !evento ? "Atividade" : "Evento"}`}
              </SheetTitle>
            </div>
            <SheetDescription className="font-medium text-slate-600">
              {date?.toLocaleDateString('pt-BR', { dateStyle: 'full' })}
            </SheetDescription>
          </SheetHeader>
        </div>

        <form action={handleSubmit} className="flex-1 p-6 space-y-6">
          {currentCiclo?.nome && (
            <div className="flex items-center gap-2 p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-tight">
              <Info className="w-3.5 h-3.5" />
              Período Letivo: {currentCiclo.nome}
            </div>
          )}

          {/* Seção: Turma e Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-slate-500 ml-1">Turma</Label>
              <span className="sr-only">Turma</span>
              <Select
                name="turmaId"
                value={selectedTurmaId}
                onValueChange={setSelectedTurmaId}
                disabled={!!preSelectedTurmaId}
              >
                <SelectTrigger className="rounded-xl border-2 focus:ring-primary/20 h-11 font-bold">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {turmas.map((t: any) => (
                    <SelectItem key={t.id} value={t.id} className="font-medium">{t.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-slate-500 ml-1">Tipo</Label>
              <Select name="tipo" defaultValue={evento?.tipo || "PROVA"}>
                <SelectTrigger className="rounded-xl border-2 h-11 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROVA">Prova</SelectItem>
                  <SelectItem value="TRABALHO">Trabalho</SelectItem>
                  <SelectItem value="SEMINARIO">Seminário</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase text-slate-500 ml-1 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" /> Disciplina
            </Label>
            <Select name="disciplinaId" required defaultValue={evento?.disciplinaId} disabled={!selectedTurmaId}>
              <SelectTrigger className="rounded-xl border-2 h-11 font-bold">
                <SelectValue placeholder={selectedTurmaId ? "Selecione a matéria" : "Aguardando turma..."} />
              </SelectTrigger>
              <SelectContent>
                {disciplinasDisponiveis.map((d: any) => (
                  <SelectItem key={d.disciplina.id} value={d.disciplina.id}>
                    {d.disciplina.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo" className="text-xs font-black uppercase text-slate-500 ml-1">Título</Label>
              <Input
                id="titulo"
                name="titulo"
                defaultValue={evento?.titulo}
                placeholder="Ex: Prova 1º Ciclo"
                className="rounded-xl border-2 h-11 font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-xs font-black uppercase text-slate-500 ml-1">Conteúdo / Observações</Label>
              <Textarea
                id="descricao"
                name="descricao"
                defaultValue={evento?.descricao}
                placeholder="Observações sobre a atividade"
                className="rounded-xl border-2 min-h-[100px] resize-none"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 rounded-xl font-bold text-slate-500"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-[2] rounded-xl font-bold shadow-lg shadow-primary/20"
              disabled={loading || !selectedTurmaId}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Salvando...
                </span>
              ) : (evento ? "Salvar Alterações" : "Confirmar Agendamento")}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}