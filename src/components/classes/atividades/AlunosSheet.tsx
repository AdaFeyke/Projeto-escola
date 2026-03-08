"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "~/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Search, Save, Loader2 } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { salvarNotasAtividade } from "~/actions/students/notas/notasActions";
import { Badge } from "~/components/ui/badge";

interface Aluno {
  id: string;
  nome: string;
  imagem?: string | null;
  matricula: string;
  nota?: number | string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  atv: any;
  alunos: Aluno[];
  usuarioId: string;
}

export function AlunosSheet({ isOpen, onClose, atv, alunos, usuarioId }: Props) {
  const valorAtividade = atv.valorMaximo.toFixed(1);

  const [searchTerm, setSearchTerm] = useState("");

  const [notas, setNotas] = useState<Record<string, string | number>>(() => {
    const notasExistentes = Object.fromEntries(
      (atv.notas || []).map((n: any) => [n.alunoId, n.valor])
    );

    return Object.fromEntries(
      alunos.map((aluno) => [
        aluno.id,
        notasExistentes[aluno.id] ?? ""
      ])
    );
  });

  const [isSaving, setIsSaving] = useState(false);

  const participantesFiltrados = alunos.filter((aluno) =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNotaChange = (alunoId: string, valor: string) => {
    const cleanValue = valor.replace(",", ".");
    const numValue = Number(cleanValue);

    if (cleanValue === "" || (!isNaN(numValue) && numValue >= 0 && numValue <= valorAtividade)) {
      setNotas((prev) => ({ ...prev, [alunoId]: cleanValue }));
    } else if (numValue > valorAtividade) {
      toast.error(`A nota máxima é ${valorAtividade}`, { duration: 1000 });
    }
  };

  const handleSave = async () => {
    if (Object.keys(notas).length === 0) return;

    setIsSaving(true);
    try {
      const result = await salvarNotasAtividade(atv.id, notas, usuarioId);

      if (result.success) {
        toast.success("Notas salvas com sucesso!");
        onClose();
      }
    } catch (error) {
      toast.error("Erro ao salvar notas. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l-primary/10">
        <SheetHeader className="p-6 bg-primary/[0.02] border-b">
          <SheetTitle className="text-2xl font-black text-slate-900 leading-tight">
            Lançar Notas
          </SheetTitle>
          <SheetDescription className="font-medium text-primary flex items-center justify-between">
            <span>{atv.titulo}</span>
            <Badge variant="secondary" className="text-primary border-primary/20 bg-primary/5">
              Valor: {valorAtividade} pts
            </Badge>
          </SheetDescription>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar aluno..."
              className="pl-10 rounded-xl border-slate-100 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {participantesFiltrados.map((aluno) => (
              <div
                key={aluno.id}
                className="flex items-center justify-between p-3 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm ">
                    <AvatarImage src={aluno.imagem || ""} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {aluno.nome.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[180px]">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {aluno.nome}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {aluno.matricula}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder={`0/${valorAtividade}`}
                    className="w-20 h-10 text-center font-bold text-primary rounded-lg border-slate-200 focus:ring-primary/20"
                    value={notas[aluno.id]}
                    onChange={(e) => handleNotaChange(aluno.id, e.target.value)}
                  />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                    Máx: {valorAtividade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <Button
            className="w-full h-12 rounded-xl font-black gap-2 shadow-lg shadow-primary/20"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Salvar Notas
          </Button>
          <p className="text-center text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-tighter">
            Dica: Use ponto ou vírgula para decimais
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}