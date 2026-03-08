"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Copy, AlertCircle, CheckCircle2, Clock, MoreVertical, FileText,
    Ban, Wallet, UserCircle, ChevronLeft, ChevronRight, Hash,
    Pencil, Trash2, MoreHorizontal
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { PaymentModal } from "./PaymentModal";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "~/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { toast } from "sonner";
import { updateFinancialStatusAction, deleteFinancialRecordAction } from "~/actions/financial/financial.actions";

const statusConfig: any = {
    PENDENTE: { label: "Pendente", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    PAGO: { label: "Pago", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    ATRASADO: { label: "Atrasado", color: "bg-rose-50 text-rose-700 border-rose-200", icon: AlertCircle },
    CANCELADO: { label: "Cancelado", color: "bg-slate-50 text-slate-500 border-slate-200", icon: FileText },
};

interface FinancialListProps {
    itens: any[];
    userRole: string;
    pagination: {
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
    };
}

export function FinancialList({ itens, userRole, pagination }: FinancialListProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
    };

    const handleAction = (item: any) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleUpdateStatus = async (id: string, newStatus: any) => {
        const res = await updateFinancialStatusAction(id, newStatus);
        if (res.success) {
            toast.success("Status atualizado com sucesso!");
        } else {
            toast.error(res.message);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const res = await deleteFinancialRecordAction(deleteId);
        if (res.success) {
            toast.success("Registro excluído!");
            setDeleteId(null);
        } else {
            toast.error(res.message);
        }
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`/dashboard/financial?${params.toString()}`);
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-black text-slate-800">Histórico de Lançamentos</h3>
                    <p className="text-sm text-slate-500 font-medium">Exibindo {itens.length} de {pagination.total} registros</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs tracking-wider text-left">Descrição</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs tracking-wider text-center">Aluno / Turma</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs tracking-wider text-center">Vencimento</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs tracking-wider text-center">Valor</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs tracking-wider text-center">Status</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {itens.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium">
                                    <div className="flex flex-col items-center gap-2">
                                        <Ban className="w-10 h-10 opacity-20" />
                                        <p>Nenhum registro encontrado com os filtros atuais.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            itens.map((item) => {
                                const status = statusConfig[item.status] || statusConfig.PENDENTE;
                                const StatusIcon = status.icon;

                                const turma = item.aluno?.matriculas?.[0]?.turma?.nome || "-";

                                return (
                                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700 truncate max-w-[200px]">{item.descricao}</span>
                                                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 w-fit px-1.5 rounded mt-1">
                                                    {item.tipo}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.mesReferencia && item.anoReferencia ? (
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700 capitalize">
                                                        {format(new Date(item.anoReferencia, item.mesReferencia - 1, 1), 'MMMM', { locale: ptBR })}
                                                    </span>
                                                    <span className="text-xs text-slate-400">{item.anoReferencia}</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    {userRole === "ADMINISTRADOR" && item.aluno ? (
                                                        <>
                                                            <div className="flex gap-1.5 font-bold text-slate-700">
                                                                <span className="truncate max-w-[150px]">{item.aluno.usuario?.nome || "Aluno"}</span>
                                                            </div>
                                                            <div className="flex text-xs text-slate-400 items-center">
                                                                <span>{turma}</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium tabular-nums text-center">
                                            {new Date(item.dataVencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-800 tabular-nums text-center">
                                            {formatCurrency(item.valor)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold", status.color)}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {status.label}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {item.status !== 'PAGO' && item.status !== 'CANCELADO' && (
                                                <Button
                                                    size="sm"
                                                    className={cn(
                                                        "h-8 rounded-lg text-xs font-bold border gap-1.5 transition-all opacity-0 group-hover:opacity-100",
                                                        userRole === "ADMINISTRADOR"
                                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                                            : "bg-primary text-white border-primary hover:bg-primary/90 shadow-sm shadow-primary/20",
                                                        isModalOpen && selectedItem?.id === item.id && "opacity-100"
                                                    )}
                                                    onClick={() => handleAction(item)}
                                                >
                                                    {userRole === "ADMINISTRADOR" ? (
                                                        <>
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Dar Baixa
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Wallet className="w-3 h-3" />
                                                            Pagar
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                            {userRole === "ADMINISTRADOR" && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 ml-2">
                                                            <MoreVertical className="h-4 w-4 text-slate-400" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleAction(item)}>
                                                            <Wallet className="mr-2 h-4 w-4" /> Detalhes/Baixa
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                <Pencil className="mr-2 h-4 w-4" /> Alterar Status
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent>
                                                                <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, "PENDENTE")}>
                                                                    Pendente
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, "PAGO")}>
                                                                    Pago
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, "ATRASADO")}>
                                                                    Atrasado
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, "CANCELADO")}>
                                                                    Cancelado
                                                                </DropdownMenuItem>
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600 font-bold focus:text-red-600 focus:bg-red-50"
                                                            onClick={() => setDeleteId(item.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={pagination.page <= 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                        className="text-slate-500 font-bold"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                    </Button>
                    <span className="text-xs font-bold text-slate-400">
                        Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                        className="text-slate-500 font-bold"
                    >
                        Próxima <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            )}

            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pendencia={selectedItem}
                userRole={userRole}
            />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Registro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se houver pagamento vinculado, ele também será excluído.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Confirmar Exclusão
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
