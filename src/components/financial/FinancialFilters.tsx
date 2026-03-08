"use client";

import { Search, Filter, Calendar, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { cn } from "~/lib/utils";

interface FinancialFiltersProps {
    turmas: { id: string; nome: string }[];
}

export function FinancialFilters({ turmas }: FinancialFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentSearch = searchParams.get("q") || "";
    const currentTurma = searchParams.get("turmaId") || "ALL";
    const currentStatus = searchParams.get("status") || "TODOS";

    const createQueryString = (name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "ALL" && value !== "TODOS") {
            params.set(name, value);
        } else {
            params.delete(name);
        }
        // Reset page on filter change
        if (name !== "page") params.delete("page");

        return params.toString();
    };

    const handleSearch = useDebouncedCallback((term: string) => {
        const query = createQueryString("q", term);
        router.push(`/dashboard/financial?${query}`);
    }, 300);

    const handleFilterChange = (key: string, value: string) => {
        const query = createQueryString(key, value);
        router.push(`/dashboard/financial?${query}`);
    };

    return (
        <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
                {/* Search Bar */}
                <div className="flex-1 relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                        defaultValue={currentSearch}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Buscar por nome do aluno..."
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
                    />
                </div>

                {/* Turma Filter */}
                <div className="relative min-w-[200px]">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Filter className="w-4 h-4 text-slate-400" />
                    </div>
                    <select
                        value={currentTurma}
                        onChange={(e) => handleFilterChange("turmaId", e.target.value)}
                        className="w-full h-11 pl-10 pr-8 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer transition-all"
                    >
                        <option value="ALL">Todas as Turmas</option>
                        {turmas.map((t) => (
                            <option key={t.id} value={t.id}>{t.nome}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {["TODOS", "PENDENTE", "ATRASADO", "PAGO"].map((status) => (
                    <button
                        key={status}
                        onClick={() => handleFilterChange("status", status)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border",
                            currentStatus === status
                                ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                        )}
                    >
                        {status === "TODOS" ? "Todos" :
                            status === "PENDENTE" ? "Pendentes" :
                                status === "ATRASADO" ? "Atrasados" : "Pagos"}
                    </button>
                ))}
            </div>
        </div>
    );
}
