"use client";

import React, { useState, useTransition } from "react";
import { Plus, HelpCircle, Edit, Trash2 } from "lucide-react";
import { useConfirm } from "~/hooks/ui/useConfirm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "~/components/ui/button";
import { PerguntaFormModal } from "./PerguntaFormModal";
import { deletePerguntaAction } from "~/actions/settings/pergunta.actions";

interface Pergunta {
    id: string;
    pergunta: string;
    tipo: string | null;
    ativa: boolean;
}

interface PerguntaManagerProps {
    initialPerguntas: Pergunta[];
}

export default function PerguntaManager({ initialPerguntas }: PerguntaManagerProps) {
    const router = useRouter();
    const { confirm } = useConfirm();
    const [isPending, startTransition] = useTransition();

    const [editingPergunta, setEditingPergunta] = useState<Pergunta | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openCreateModal = () => {
        setEditingPergunta(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (pergunta: Pergunta) => {
        setEditingPergunta(pergunta);
        setIsModalOpen(true);
    };

    const handleDelete = async (pergunta: Pergunta) => {
        const confirmed = await confirm({
            title: "Confirmar Exclusão",
            description: `Tem certeza que deseja excluir a pergunta "${pergunta.pergunta}"?`,
            confirmText: "Sim, Excluir",
            cancelText: "Cancelar"
        });

        if (confirmed) {
            startTransition(async () => {
                const response = await deletePerguntaAction(pergunta.id);
                if (response.success) {
                    toast.success(response.message);
                    router.refresh();
                } else {
                    toast.error(response.message);
                }
            });
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-8 h-8 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight truncate">
                            Questionário
                        </h2>
                        <p className="text-slate-500 text-sm font-medium">
                            Criação e edição de perguntas extras no cadastro de alunos
                        </p>
                    </div>
                </div>

                <Button
                    onClick={openCreateModal}
                    className="
                        w-full sm:w-auto 
                        bg-primary hover:bg-primary/90 
                        text-white font-black 
                        rounded-2xl sm:rounded-xl 
                        h-12 sm:h-11 px-8
                        transition-all active:scale-95 
                        gap-2
                    "
                >
                    <Plus className="w-5 h-5 shrink-0" />
                    <span className="whitespace-nowrap uppercase tracking-wider text-xs sm:normal-case sm:text-sm sm:tracking-normal">
                        Nova Pergunta
                    </span>
                </Button>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                        Perguntas Ativas
                    </h3>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest">
                        {initialPerguntas.length} cadastradas
                    </span>
                </div>

                {initialPerguntas.length === 0 ? (
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-8 h-8 text-primary" />
                        <p className="text-slate-500 font-medium text-sm">Nenhuma pergunta cadastrada</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {initialPerguntas.map((p) => (
                            <div
                                key={p.id}
                                className="group relative p-6 rounded-[2rem] border border-slate-100 bg-white hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-primary/10 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                            <HelpCircle className="w-7 h-7" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                {p.tipo === "TEXTO" ? "Texto Livre" : p.tipo === "CHECKBOX" ? "Múltipla" : "Única"}
                                            </span>
                                            <span className="text-lg font-bold text-slate-700 leading-tight">
                                                {p.pergunta}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditModal(p)}
                                            className="h-10 w-10 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            disabled={isPending}
                                            onClick={() => handleDelete(p)}
                                            className="h-10 w-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <PerguntaFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pergunta={editingPergunta}
            />
        </div>
    );
}
