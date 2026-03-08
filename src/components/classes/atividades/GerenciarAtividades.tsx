"use client";

import { useState } from "react";
import { Plus, ClipboardCheck } from "lucide-react";
import { Button } from "~/components/ui/button";
import { AtividadeCard } from "./AtividadeCard";
import { createAtividadeAction, updateAtividadeAction, deleteAtividadeAction } from "~/actions/classes/atividade/atividade.actions";
import { AtividadeFormModal } from "./AtividadeFormModal";
import { useConfirm } from "~/hooks/ui/useConfirm";
import { toast } from "sonner";

interface Atividade {
  id: string;
  titulo: string;
  tipo: "PROVA" | "TRABALHO" | "SEMINARIO" | "AULA" | "OUTRO";
  data: Date;
  descricao?: string | null;
  notificado?: boolean;
  valorMaximo?: number;
  cicloId?: string | null;
  notas?: any[];
}

interface Aluno {
  id: string;
  nome: string;
  imagem?: string | null;
  matricula: string;
}

interface Ciclo {
  id: string;
  nome: string;
}

interface GerenciadorAtividadesProps {
  atividades: Atividade[];
  alunos: Aluno[];
  usuarioId: string;
  turmaId: string;
  disciplinaId: string;
  ciclos: Ciclo[];
}

export function GerenciadorAtividades({ atividades, alunos, usuarioId, turmaId, disciplinaId, ciclos }: GerenciadorAtividadesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAtividade, setEditingAtividade] = useState<Atividade | null>(null);
  const { confirm } = useConfirm();

  const handleEdit = (atv: Atividade) => {
    setEditingAtividade(atv);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingAtividade(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Confirmar Exclusão",
      description: `Tem certeza que deseja excluir a atividade?`,
      confirmText: "Sim, Excluir",
      cancelText: "Cancelar"
    });

    if (confirmed) {
      const result = await deleteAtividadeAction(id);
      if (result.success) {
        toast.success("Sucesso", { description: result.message });
      } else {
        toast.error("Erro", { description: result.message });
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAtividade(null);
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-2 z-30 flex items-center justify-between bg-white/90 backdrop-blur-md p-4 rounded-[2rem] border shadow-sm">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <h2 className="font-black text-slate-800 hidden sm:block">Atividades</h2>
        </div>

        <Button
          onClick={handleCreate}
          className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-10 px-5 gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 fill-current" />
          <span>Nova Atividade</span>
        </Button>
      </div>

      <AtividadeFormModal
        open={isModalOpen}
        atividade={editingAtividade}
        action={editingAtividade ? updateAtividadeAction : createAtividadeAction}
        onClose={handleCloseModal}
        isLoadingData={false}
        ciclos={ciclos}
        turmaId={turmaId}
        disciplinaId={disciplinaId}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {atividades.map((atv) => (
          <AtividadeCard
            key={atv.id}
            atv={atv}
            alunos={alunos}
            usuarioId={usuarioId}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        {atividades.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed rounded-3xl">
            <ClipboardCheck className="w-12 h-12 mb-3 opacity-20" />
            <p>Nenhuma atividade cadastrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}