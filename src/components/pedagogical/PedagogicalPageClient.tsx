"use client"

import { useState, useTransition } from "react";
import {
    ClipboardList, Search, History, Filter,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

import { PlanningFormModal } from "./PlanningFormModal";
import { PlanningCard } from "./PlanningCard";
import { PlanningDetailsModal } from "./PlanningDetailsModal";
import { deletePlanningAction } from "~/actions/pedagogical/planningActions";
import { toast } from "sonner";
import { useConfirm } from "~/hooks/ui/useConfirm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

import { cn } from "~/lib/utils";
import { PageHeader } from "../ui/PageHeader";

interface PedagogicalPageClientProps {
    planejamentos: any[];
    turmas: any[];
    disciplinas: any[];
    userRole: string;
    anosLetivos: any[];
    cicloLetivos: any[];
}

export function PedagogicalPageClient({
    planejamentos,
    turmas,
    disciplinas,
    userRole,
    anosLetivos,
    cicloLetivos
}: PedagogicalPageClientProps) {
    const isAdmin = userRole === "ADMINISTRADOR";
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any | null>(null);
    const [viewingPlan, setViewingPlan] = useState<any | null>(null);
    const [statusFilter, setStatusFilter] = useState("TODOS");
    const [searchTerm, setSearchTerm] = useState("");
    const { confirm } = useConfirm();

    const currentAnoId = searchParams.get("anoLetivoId") || "";
    const currentCicloId = searchParams.get("cicloId") || "";

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "TODOS") {
            params.set(key, value);
            if (key === "anoLetivoId") params.delete("cicloId");
        } else {
            params.delete(key);
        }

        startTransition(() => {
            router.push(`/dashboard/pedagogical-planning?${params.toString()}`);
        });
    };

    const filteredPlans = planejamentos.filter(p => {
        const matchesSearch = p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.turma.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (isAdmin && p.professor?.usuario?.nome.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === "TODOS" ||
            (statusFilter === "PENDENTE" && (!p.status || p.status === "PENDENTE")) ||
            p.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const counts = {
        TODOS: planejamentos.length,
        PENDENTE: planejamentos.filter(p => !p.status || p.status === "PENDENTE").length,
        APROVADO: planejamentos.filter(p => p.status === "APROVADO").length,
        REJEITADO: planejamentos.filter(p => p.status === "REJEITADO").length,
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            title: "Excluir Planejamento",
            description: "Tem certeza que deseja excluir este planejamento? Esta ação não pode ser desfeita.",
            confirmText: "Excluir",
            cancelText: "Cancelar"
        });

        if (confirmed) {
            const result = await deletePlanningAction(id);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <PageHeader
                title="Planejamento Pedagógico"
                description="Gerencie suas aulas, assuntos e atividades das turmas"
                backHref="/dashboard"
                iconElement={<ClipboardList className="w-7 h-7 md:w-8 md:h-8" />}
                buttonLabel="Novo Plano"
                showButton={isAdmin || userRole === "PROFESSOR"}
                onButtonClick={() => setIsModalOpen(true)}
                isPending={isPending}
            />
            <div className="bg-white p-4 md:p-6 rounded-3xl border shadow-sm space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <div className="md:col-span-2 relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder={isAdmin ? "Título, turma ou professor..." : "Título ou turma..."}
                            className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 ring-primary/20 focus:border-primary focus:bg-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full">
                        <Select value={currentAnoId} onValueChange={(val) => handleFilterChange("anoLetivoId", val)}>
                            <SelectTrigger className="h-12 w-full rounded-xl border-slate-200 font-bold bg-slate-50/50 hover:bg-white transition-colors">
                                <div className="flex items-center gap-2 truncate">
                                    <History className="w-4 h-4 text-slate-400 shrink-0" />
                                    <SelectValue placeholder="Ano Letivo" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                <SelectItem value="TODOS" className="font-bold text-xs">TODOS OS ANOS</SelectItem>
                                {anosLetivos.map(ano => (
                                    <SelectItem key={ano.id} value={ano.id} className="font-medium">{ano.ano}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full">
                        <Select value={currentCicloId} onValueChange={(val) => handleFilterChange("cicloId", val)}>
                            <SelectTrigger className="h-12 w-full rounded-xl border-slate-200 font-bold bg-slate-50/50 hover:bg-white transition-colors">
                                <div className="flex items-center gap-2 truncate">
                                    <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                                    <SelectValue placeholder="Ciclo Letivo" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                <SelectItem value="TODOS" className="font-bold text-xs">TODOS OS CICLOS</SelectItem>
                                {cicloLetivos
                                    .filter(c => !currentAnoId || currentAnoId === "TODOS" || c.anoLetivoId === currentAnoId)
                                    .map(ciclo => (
                                        <SelectItem key={ciclo.id} value={ciclo.id} className="font-medium">{ciclo.nome}</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="relative">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 md:mx-0 md:px-0">
                        {["TODOS", "PENDENTE", "APROVADO", "REJEITADO"].map((status) => {
                            const isActive = statusFilter === status;

                            return (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={cn(
                                        "h-10 px-4 md:px-6 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-3 border-2 shrink-0",
                                        isActive
                                            ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                                    )}
                                >
                                    <span>
                                        {status === "TODOS" ? "Todos os Planos" :
                                            status === "PENDENTE" ? "Pendentes" :
                                                status === "APROVADO" ? "Aprovados" : "Rejeitados"}
                                    </span>

                                    <span className={cn(
                                        "min-w-[22px] h-5 px-1.5 flex items-center justify-center rounded-lg text-[10px] font-black transition-colors",
                                        isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                                    )}>
                                        {counts[status as keyof typeof counts]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {filteredPlans.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center text-slate-400 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm animate-in slide-in-from-bottom-5">
                        <div className="p-6 bg-slate-50 rounded-full mb-6">
                            <ClipboardList className="w-16 h-16 opacity-20" />
                        </div>
                        <p className="text-xl font-black text-slate-400 uppercase tracking-tight">Vazio por aqui</p>
                        <p className="text-sm font-medium text-slate-400 mb-6">Nenhum planejamento corresponde aos filtros aplicados.</p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("TODOS");
                                router.push("/dashboard/pedagogical-planning");
                            }}
                            className="rounded-xl font-bold border-2"
                        >
                            Limpar Filtros e Histórico
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredPlans.map((plan) => (
                            <PlanningCard
                                key={plan.id}
                                plan={plan}
                                isAdmin={isAdmin}
                                onDelete={handleDelete}
                                onEdit={(p) => {
                                    setEditingPlan(p);
                                    setIsModalOpen(true);
                                }}
                                onViewDetails={(p) => setViewingPlan(p)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <PlanningFormModal
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingPlan(null);
                }}
                turmas={turmas}
                disciplinas={disciplinas}
                initialData={editingPlan}
            />

            <PlanningDetailsModal
                open={!!viewingPlan}
                onClose={() => setViewingPlan(null)}
                plan={viewingPlan}
                isAdmin={isAdmin}
            />
        </div>
    );
}
