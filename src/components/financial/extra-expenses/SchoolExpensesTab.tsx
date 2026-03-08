"use client";

import { useState, useActionState, useMemo } from "react";
import { Plus, Trash2, Calendar as CalendarIcon, Tag, CreditCard, CheckCircle2, Clock, MoreVertical, Search, FilterX, Pencil } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { formatCurrency } from "~/utils/formatCurrency";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { BaseModal } from "~/components/ui/modal/BaseModal";
import { FormModal } from "~/components/ui/modal/FormModal";
import { FormSection } from "~/components/ui/form/FormSection";
import { FormGrid } from "~/components/ui/form/FormGrid";
import { createDespesaAction, deleteDespesaAction, updateDespesaStatusAction, updateDespesaAction } from "~/actions/financial/despesa.actions";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { type ActionResponse } from "~/services/form/ActionResponse.types";

interface SchoolExpensesTabProps {
    despesas: any[];
}

export function SchoolExpensesTab({ despesas }: SchoolExpensesTabProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingDespesa, setEditingDespesa] = useState<any>(null);

    // Filters state
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("ALL");
    const [filterStatus, setFilterStatus] = useState("ALL");

    const [createState, createAction, isCreatePending] = useActionState(createDespesaAction, {
        success: false,
        message: "",
    } as ActionResponse);

    const [updateState, updateAction, isUpdatePending] = useActionState(updateDespesaAction, {
        success: false,
        message: "",
    } as ActionResponse);

    const filteredDespesas = useMemo(() => {
        return despesas.filter(d => {
            const matchesSearch = d.descricao.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = filterCategory === "ALL" || d.categoria === filterCategory;
            const matchesStatus = filterStatus === "ALL" || d.status === filterStatus;
            return matchesSearch && matchesCategory && matchesStatus;
        }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    }, [despesas, search, filterCategory, filterStatus]);

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir este registro?")) return;

        const res = await deleteDespesaAction(id);
        if (res.success) {
            toast.success(res.message);
        } else {
            toast.error(res.message);
        }
    }

    async function handleStatusToggle(id: string, currentStatus: string) {
        const newStatus = currentStatus === "PAGO" ? "PENDENTE" : "PAGO";
        const res = await updateDespesaStatusAction(id, newStatus);
        if (res.success) {
            toast.success(`Despesa marcada como ${newStatus.toLowerCase()}!`);
        } else {
            toast.error(res.message);
        }
    }

    function clearFilters() {
        setSearch("");
        setFilterCategory("ALL");
        setFilterStatus("ALL");
    }

    return (
        <div className="space-y-6">
            {/* Header with Search & Filters */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Controle de Despesas</h3>
                        <p className="text-sm text-slate-500">Gerencie as saídas de caixa da instituição.</p>
                    </div>
                    <Button
                        className="rounded-xl shadow-lg shadow-primary/20 gap-2 h-11 px-6 font-bold"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus className="w-5 h-5" />
                        Nova Despesa
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por descrição..."
                            className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 shadow-none">
                            <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="ALL">Todas Categorias</SelectItem>
                            <SelectItem value="ENERGIA">Energia Elétrica</SelectItem>
                            <SelectItem value="AGUA">Água e Esgoto</SelectItem>
                            <SelectItem value="ALUGUEL">Aluguel</SelectItem>
                            <SelectItem value="INTERNET">Internet</SelectItem>
                            <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                            <SelectItem value="LIMPEZA">Limpeza</SelectItem>
                            <SelectItem value="OUTROS">Outros</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 shadow-none">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="ALL">Todos Status</SelectItem>
                            <SelectItem value="PAGO">Pago</SelectItem>
                            <SelectItem value="PENDENTE">Pendente</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {(search || filterCategory !== "ALL" || filterStatus !== "ALL") && (
                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-slate-500 hover:text-primary gap-2 h-8 text-xs font-bold"
                        >
                            <FilterX className="w-3.5 h-3.5" />
                            Limpar Filtros
                        </Button>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="grid gap-3">
                {filteredDespesas.length === 0 ? (
                    <Card className="border-dashed border-2 bg-slate-50/50">
                        <CardContent className="py-20 text-center text-slate-400">
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-slate-100 rounded-full">
                                    <Clock className="w-10 h-10 opacity-30" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-500 text-lg">Nenhum registro encontrado</p>
                                    <p className="text-sm">Tente ajustar seus filtros ou cadastre um novo gasto.</p>
                                </div>
                                {(search || filterCategory !== "ALL" || filterStatus !== "ALL") && (
                                    <Button variant="outline" onClick={clearFilters} className="mt-2 rounded-xl px-6">
                                        Limpar Filtros
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    filteredDespesas.map((despesa) => (
                        <Card key={despesa.id} className="group hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md border-slate-200 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row sm:items-center p-4 gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 shadow-sm",
                                        despesa.status === "PAGO" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                                    )}>
                                        {despesa.status === "PAGO" ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-black text-slate-800 truncate text-[15px] uppercase tracking-tight">{despesa.descricao}</h4>
                                            <span className={cn(
                                                "text-[9px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider leading-none border shadow-sm",
                                                despesa.status === "PAGO" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"
                                            )}>
                                                {despesa.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-bold">
                                                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                                                {format(new Date(despesa.data), 'dd/MM/yyyy', { locale: ptBR })}
                                            </span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                                                <Tag className="w-3.5 h-3.5 text-slate-400" />
                                                {despesa.categoria}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:border-l sm:pl-6 border-slate-100">
                                        <div className="text-right">
                                            <p className="text-xl font-black text-slate-900 leading-none mb-1">{formatCurrency(Number(despesa.valor))}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Total</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {despesa.status === "PENDENTE" && (
                                                <Button
                                                    size="sm"
                                                    className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 font-black text-[11px] uppercase tracking-wider gap-1.5 rounded-xl shadow-lg shadow-emerald-600/20"
                                                    onClick={() => handleStatusToggle(despesa.id, despesa.status)}
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Dar Baixa
                                                </Button>
                                            )}

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 border border-slate-200">
                                                        <MoreVertical className="w-4 h-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl shadow-xl">
                                                    <DropdownMenuItem
                                                        onClick={() => setEditingDespesa(despesa)}
                                                        className="font-bold focus:bg-primary/5 focus:text-primary cursor-pointer gap-2 rounded-lg p-3"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                        Editar Registro
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusToggle(despesa.id, despesa.status)}
                                                        className="font-bold focus:bg-primary/5 focus:text-primary cursor-pointer gap-2 rounded-lg p-3"
                                                    >
                                                        {despesa.status === "PAGO" ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                                        Marcar como {despesa.status === "PAGO" ? "Pendente" : "Pago"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(despesa.id)}
                                                        className="text-red-600 focus:bg-red-50 focus:text-red-600 font-extrabold cursor-pointer gap-2 rounded-lg p-3"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Excluir Registro
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Create Modal */}
            <BaseModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Novo Registro Financeiro"
                description="Lançamento de despesa institucional."
            >
                <FormModal
                    action={createAction}
                    state={createState}
                    isPending={isCreatePending}
                    onSuccess={() => setIsCreateModalOpen(false)}
                    submitLabel="Registrar Gasto"
                >
                    <FormSection title="Descrição & Valor">
                        <div className="space-y-2">
                            <Label htmlFor="descricao" className="text-sm font-bold text-slate-700">O que foi pago?</Label>
                            <Input id="descricao" name="descricao" placeholder="Ex: Material de Limpeza Semanal" className="h-12 rounded-xl" required />
                        </div>
                        <FormGrid cols={2}>
                            <div className="space-y-2">
                                <Label htmlFor="valor" className="text-sm font-bold text-slate-700">Valor (R$)</Label>
                                <Input id="valor" name="valor" type="number" step="0.01" placeholder="0,00" className="h-12 rounded-xl" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="data" className="text-sm font-bold text-slate-700">Data do Pagamento</Label>
                                <Input id="data" name="data" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="h-12 rounded-xl" required />
                            </div>
                        </FormGrid>
                    </FormSection>

                    <FormSection title="Classificação">
                        <FormGrid cols={2}>
                            <div className="space-y-2">
                                <Label htmlFor="categoria" className="text-sm font-bold text-slate-700">Categoria</Label>
                                <Select name="categoria" defaultValue="OUTROS">
                                    <SelectTrigger className="h-12 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="ENERGIA">Energia Elétrica</SelectItem>
                                        <SelectItem value="AGUA">Água e Esgoto</SelectItem>
                                        <SelectItem value="ALUGUEL">Aluguel</SelectItem>
                                        <SelectItem value="INTERNET">Internet</SelectItem>
                                        <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                                        <SelectItem value="LIMPEZA">Limpeza</SelectItem>
                                        <SelectItem value="OUTROS">Outros</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-bold text-slate-700">Situação</Label>
                                <Select name="status" defaultValue="PAGO">
                                    <SelectTrigger className="h-12 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="PAGO">Pago</SelectItem>
                                        <SelectItem value="PENDENTE">Pendente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </FormGrid>
                    </FormSection>
                </FormModal>
            </BaseModal>

            {/* Edit Modal */}
            <BaseModal
                open={!!editingDespesa}
                onClose={() => setEditingDespesa(null)}
                title="Editar Registro Financeiro"
                description="Atualize as informações do lançamento de saída."
            >
                {editingDespesa && (
                    <FormModal
                        action={updateAction}
                        state={updateState}
                        isPending={isUpdatePending}
                        onSuccess={() => setEditingDespesa(null)}
                        submitLabel="Salvar Alterações"
                    >
                        <input type="hidden" name="id" value={editingDespesa.id} />

                        <FormSection title="Descrição & Valor">
                            <div className="space-y-2">
                                <Label htmlFor="edit-descricao" className="text-sm font-bold text-slate-700">O que foi pago?</Label>
                                <Input id="edit-descricao" name="descricao" defaultValue={editingDespesa.descricao} className="h-12 rounded-xl" required />
                            </div>
                            <FormGrid cols={2}>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-valor" className="text-sm font-bold text-slate-700">Valor (R$)</Label>
                                    <Input id="edit-valor" name="valor" type="number" step="0.01" defaultValue={editingDespesa.valor} className="h-12 rounded-xl" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-data" className="text-sm font-bold text-slate-700">Data</Label>
                                    <Input id="edit-data" name="data" type="date" defaultValue={new Date(editingDespesa.data).toISOString().split('T')[0]} className="h-12 rounded-xl" required />
                                </div>
                            </FormGrid>
                        </FormSection>

                        <FormSection title="Classificação">
                            <FormGrid cols={2}>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-categoria" className="text-sm font-bold text-slate-700">Categoria</Label>
                                    <Select name="categoria" defaultValue={editingDespesa.categoria}>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="ENERGIA">Energia Elétrica</SelectItem>
                                            <SelectItem value="AGUA">Água e Esgoto</SelectItem>
                                            <SelectItem value="ALUGUEL">Aluguel</SelectItem>
                                            <SelectItem value="INTERNET">Internet</SelectItem>
                                            <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                                            <SelectItem value="LIMPEZA">Limpeza</SelectItem>
                                            <SelectItem value="OUTROS">Outros</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-status" className="text-sm font-bold text-slate-700">Situação</Label>
                                    <Select name="status" defaultValue={editingDespesa.status}>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="PAGO">Pago</SelectItem>
                                            <SelectItem value="PENDENTE">Pendente</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </FormGrid>
                        </FormSection>
                    </FormModal>
                )}
            </BaseModal>
        </div>
    );
}
