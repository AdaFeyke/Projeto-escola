"use client";

import { useState, useActionState, useMemo } from "react";
import { UserPlus, Receipt, Search, User, Calendar as CalendarIcon, MoreVertical, Trash2, CheckCircle2, Clock, Wallet, X, Check, FilterX, Pencil } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
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
import { ScrollArea } from "~/components/ui/scroll-area";
import { BaseModal } from "~/components/ui/modal/BaseModal";
import { FormModal } from "~/components/ui/modal/FormModal";
import { FormSection } from "~/components/ui/form/FormSection";
import { FormGrid } from "~/components/ui/form/FormGrid";
import { createExtraChargeAction, deleteFinancialRecordAction, updateExtraChargeAction } from "~/actions/financial/financial.actions";
import { formatCurrency } from "~/utils/formatCurrency";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { type ActionResponse } from "~/services/form/ActionResponse.types";

interface StudentExtraChargesTabProps {
    students: any[];
    extraCharges: any[];
}

export function StudentExtraChargesTab({ students, extraCharges }: StudentExtraChargesTabProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingCharge, setEditingCharge] = useState<any>(null);

    // Filters state
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("ALL");
    const [filterStatus, setFilterStatus] = useState("ALL");

    // Create selection state
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState("");

    const [createState, createAction, isCreatePending] = useActionState(createExtraChargeAction, {
        success: false,
        message: "",
    } as ActionResponse);

    const [updateState, updateAction, isUpdatePending] = useActionState(updateExtraChargeAction, {
        success: false,
        message: "",
    } as ActionResponse);

    const selectedStudentForCreate = students.find(s => s.id === selectedStudentId);

    const filteredStudents = students.filter(s =>
        s.usuario.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCharges = useMemo(() => {
        return extraCharges.filter(c => {
            const matchesSearch = c.aluno?.usuario?.nome.toLowerCase().includes(search.toLowerCase()) ||
                c.descricao.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = filterCategory === "ALL" || c.tipo === filterCategory;
            const matchesStatus = filterStatus === "ALL" || c.status === filterStatus;
            return matchesSearch && matchesCategory && matchesStatus;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [extraCharges, search, filterCategory, filterStatus]);

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir esta cobrança?")) return;

        const res = await deleteFinancialRecordAction(id);
        if (res.success) {
            toast.success("Cobrança excluída!");
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
                        <h3 className="text-xl font-bold text-slate-800">Cobranças aos Alunos</h3>
                        <p className="text-sm text-slate-500">Lançamentos específicos para itens da loja ou serviços.</p>
                    </div>
                    <Button
                        className="rounded-xl shadow-lg shadow-blue-600/20 gap-2 h-11 px-6 bg-blue-600 hover:bg-blue-700 font-bold"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <UserPlus className="w-5 h-5" />
                        Nova Cobrança
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por aluno ou descrição..."
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
                            <SelectItem value="EXTRA">Extra (Fardamento, etc)</SelectItem>
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
                            className="text-slate-500 hover:text-blue-600 gap-2 h-8 text-xs font-bold"
                        >
                            <FilterX className="w-3.5 h-3.5" />
                            Limpar Filtros
                        </Button>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="grid gap-3">
                {filteredCharges.length === 0 ? (
                    <Card className="border-dashed border-2 bg-slate-50/50">
                        <CardContent className="py-20 text-center text-slate-400">
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-slate-100 rounded-full">
                                    <Wallet className="w-10 h-10 opacity-30" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-500 text-lg">Nenhum registro encontrado</p>
                                    <p className="text-sm text-slate-400">Tente ajustar seus filtros ou lance uma nova cobrança.</p>
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
                    filteredCharges.map((charge) => (
                        <Card key={charge.id} className="group hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-md border-slate-200 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row sm:items-center p-4 gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:scale-105",
                                        charge.status === "PAGO" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                                    )}>
                                        <User className="w-6 h-6" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-black text-slate-800 truncate text-[15px] uppercase tracking-tight">{charge.aluno?.usuario?.nome}</h4>
                                            <span className={cn(
                                                "text-[9px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider leading-none shadow-sm border",
                                                charge.status === "PAGO" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-blue-100 text-blue-700 border-blue-200"
                                            )}>
                                                {charge.tipo}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 font-bold mb-1 italic">"{charge.descricao}"</p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-bold">
                                                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                                                Vencimento: {format(new Date(charge.dataVencimento), 'dd/MM/yyyy', { locale: ptBR })}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium">
                                                Lançado em {format(new Date(charge.createdAt), 'dd/MM/yyyy')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:border-l sm:pl-6 border-slate-100">
                                        <div className="text-right">
                                            <p className="text-xl font-black text-slate-900 leading-none mb-1">{formatCurrency(Number(charge.valor))}</p>
                                            <div className={cn(
                                                "inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                                                charge.status === "PAGO" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                            )}>
                                                {charge.status === "PAGO" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {charge.status}
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 border border-slate-200">
                                                    <MoreVertical className="w-4 h-4 text-slate-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl shadow-xl">
                                                <DropdownMenuItem
                                                    onClick={() => setEditingCharge(charge)}
                                                    className="font-bold focus:bg-blue-50 focus:text-blue-600 cursor-pointer gap-2 rounded-lg p-3"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    Editar Cobrança
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(charge.id)}
                                                    className="text-red-600 focus:bg-red-50 focus:text-red-600 font-extrabold cursor-pointer gap-2 rounded-lg p-3"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Excluir Registro
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setSelectedStudentId("");
                    setSearchTerm("");
                }}
                title="Lançar Cobrança Extra"
                description="Selecione o aluno e informe os dados da cobrança."
            >
                <FormModal
                    action={createAction}
                    state={createState}
                    isPending={isCreatePending}
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        setSelectedStudentId("");
                        setSearchTerm("");
                    }}
                    submitLabel="Lançar Débito"
                >
                    <FormSection title="Aluno Alvo">
                        {selectedStudentForCreate ? (
                            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black shrink-0 shadow-lg shadow-blue-600/20">
                                        {selectedStudentForCreate.usuario.nome?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-blue-900 text-sm truncate uppercase tracking-tight">{selectedStudentForCreate.usuario.nome}</p>
                                        <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-0.5">Aluno Selecionado</p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-blue-400 hover:text-red-600 hover:bg-white rounded-xl transition-all shadow-sm"
                                    onClick={() => setSelectedStudentId("")}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                                <input type="hidden" name="alunoId" value={selectedStudentId} />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Pesquisar por nome do aluno..."
                                        className="pl-11 h-12 border-slate-200 focus:border-blue-400 focus:ring-blue-100 rounded-xl shadow-sm bg-slate-50 focus:bg-white transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                {searchTerm.length > 0 && (
                                    <Card className="overflow-hidden border-slate-200 shadow-2xl shadow-slate-300/50 rounded-2xl">
                                        <ScrollArea className="h-[240px]">
                                            <div className="p-1">
                                                {filteredStudents.length > 0 ? (
                                                    filteredStudents.map(s => (
                                                        <button
                                                            key={s.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedStudentId(s.id);
                                                                setSearchTerm("");
                                                            }}
                                                            className="w-full px-4 py-3 text-left transition-all hover:bg-blue-600 hover:scale-[0.98] flex items-center justify-between group rounded-xl my-0.5"
                                                        >
                                                            <div className="flex items-center gap-4 min-w-0">
                                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-black shrink-0 text-slate-500 group-hover:bg-white group-hover:text-blue-600 transition-colors shadow-sm">
                                                                    {s.usuario.nome?.[0]?.toUpperCase()}
                                                                </div>
                                                                <span className="truncate font-bold text-slate-700 group-hover:text-white text-sm">{s.usuario.nome}</span>
                                                            </div>
                                                            <Check className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="p-8 text-center bg-slate-50">
                                                        <p className="text-xs text-slate-400 font-black uppercase tracking-widest italic">Nenhum aluno encontrado</p>
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </Card>
                                )}
                                {searchTerm.length === 0 && (
                                    <p className="text-[10px] text-slate-400 font-extrabold px-1 uppercase tracking-[0.15em] animate-pulse">
                                        Digite para buscar na lista da escola
                                    </p>
                                )}
                            </div>
                        )}
                    </FormSection>

                    <FormSection title="Dados do Débito">
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                            <div className="space-y-2">
                                <Label htmlFor="descricao" className="text-sm font-bold text-slate-700">Descrição</Label>
                                <Input id="descricao" name="descricao" placeholder="Ex: Fardamento Completo 2026" className="h-12 rounded-xl" required />
                            </div>

                            <FormGrid cols={2}>
                                <div className="space-y-2">
                                    <Label htmlFor="valor" className="text-sm font-bold text-slate-700">Valor (R$)</Label>
                                    <Input id="valor" name="valor" type="number" step="0.01" placeholder="0,00" className="h-12 border-blue-100 focus:border-blue-400 rounded-xl" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dataVencimento" className="text-sm font-bold text-slate-700">Vencimento</Label>
                                    <Input id="dataVencimento" name="dataVencimento" type="date" className="h-12 rounded-xl" required />
                                </div>
                            </FormGrid>

                            <div className="space-y-2">
                                <Label htmlFor="tipo" className="text-sm font-bold text-slate-700">Classificação</Label>
                                <Select name="tipo" defaultValue="EXTRA">
                                    <SelectTrigger className="h-12 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="EXTRA">Cobrança Extra Item</SelectItem>
                                        <SelectItem value="OUTROS">Outras Taxas / Lançamentos</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </FormSection>
                </FormModal>
            </BaseModal>

            {/* Edit Modal */}
            <BaseModal
                open={!!editingCharge}
                onClose={() => setEditingCharge(null)}
                title="Editar Cobrança Extra"
                description="Ajuste os valores ou detalhes da cobrança selecionada."
            >
                {editingCharge && (
                    <FormModal
                        action={updateAction}
                        state={updateState}
                        isPending={isUpdatePending}
                        onSuccess={() => setEditingCharge(null)}
                        submitLabel="Atualizar Dados"
                    >
                        <input type="hidden" name="id" value={editingCharge.id} />

                        <FormSection title="Informações do Aluno">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm opacity-80 select-none">
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-black shrink-0">
                                    {editingCharge.aluno?.usuario?.nome?.[0]?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-black text-slate-700 text-sm truncate uppercase tracking-tight">{editingCharge.aluno?.usuario?.nome}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Aluno Vinculado (Não editável)</p>
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title="Dados da Cobrança">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-descricao" className="text-sm font-bold text-slate-700">Descrição</Label>
                                    <Input id="edit-descricao" name="descricao" defaultValue={editingCharge.descricao} className="h-12 rounded-xl" required />
                                </div>

                                <FormGrid cols={2}>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-valor" className="text-sm font-bold text-slate-700">Valor (R$)</Label>
                                        <Input id="edit-valor" name="valor" type="number" step="0.01" defaultValue={editingCharge.valor} className="h-12 rounded-xl" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-dataVencimento" className="text-sm font-bold text-slate-700">Vencimento</Label>
                                        <Input id="edit-dataVencimento" name="dataVencimento" type="date" defaultValue={new Date(editingCharge.dataVencimento).toISOString().split('T')[0]} className="h-12 rounded-xl" required />
                                    </div>
                                </FormGrid>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-tipo" className="text-sm font-bold text-slate-700">Classificação</Label>
                                    <Select name="tipo" defaultValue={editingCharge.tipo}>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="EXTRA">Cobrança Extra Item</SelectItem>
                                            <SelectItem value="OUTROS">Outras Taxas / Lançamentos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </FormSection>
                    </FormModal>
                )}
            </BaseModal>
        </div>
    );
}
