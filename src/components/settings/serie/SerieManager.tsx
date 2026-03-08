"use client";

import React, { startTransition, useState } from "react";
import { Plus, Layers, Edit, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { SerieFormModal } from "./SerieFormModal";
import { deleteSerieAction } from "~/actions/settings/serie.actions";

import { useRouter } from "next/navigation";
import { useConfirm } from "~/hooks/ui/useConfirm";
import { toast } from "sonner";


interface Serie {
    id: string;
    nome: string;
}

interface SerieManagerProps {
    initialSeries: Serie[];
}

export default function SerieManager({ initialSeries }: SerieManagerProps) {
    const [editingSerie, setEditingSerie] = useState<Serie | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { confirm } = useConfirm();
    const router = useRouter();

    const openCreateModal = () => {
        setEditingSerie(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (serie: Serie) => {
        setEditingSerie(serie);
        setIsModalOpen(true);
    };
    
    const handleDelete = async (serie: Serie) => {
        const confirmed = await confirm({
            title: "Confirmar Exclusão",
            description: `Tem certeza que deseja excluir a série "${serie.nome}"?`,
            confirmText: "Sim, Excluir",
            cancelText: "Cancelar"
        });

        if (confirmed) {
            startTransition(async () => {
                const response = await deleteSerieAction(serie.id);
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm transition-all">
                <div className="flex items-center gap-4 md:gap-5">
                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Layers className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight truncate">
                            Séries
                        </h2>
                        <p className="text-slate-500 text-xs md:text-sm font-medium leading-tight">
                            Criação e edição de séries acadêmicas
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
                        Nova Série
                    </span>
                </Button>
            </div>

            <div className="space-y-6 text-2xl font-black text-slate-800 tracking-tight">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                        Séries Ativas
                    </h3>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest">
                        {initialSeries.length} cadastradas
                    </span>
                </div>

                {initialSeries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <Layers className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium text-sm">Nenhuma série cadastrada</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {initialSeries.map((serie) => (
                            <div
                                key={serie.id}
                                className="group relative p-6 rounded-[2rem] border border-slate-100 bg-white hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-primary/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                            <Layers className="w-7 h-7" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Série</span>
                                            <span className="text-lg font-bold text-slate-700">
                                                {serie.nome}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditModal(serie)}
                                            className="h-10 w-10 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(serie)}
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

            <SerieFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                serie={editingSerie}
            />
        </div>
    );
}

