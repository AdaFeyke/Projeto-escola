"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "~/components/ui/select";
import { Copy, CheckCircle2, QrCode, Wallet } from "lucide-react";
import { toast } from "sonner";
import { markAsPaidAction } from "~/actions/financial/financial.actions";

type MetodoPagamento = "DINHEIRO" | "PIX" | "BOLETO" | "CARTAO" | "TRANSFERENCIA";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    pendencia: any;
    userRole: string;
}

export function PaymentModal({ isOpen, onClose, pendencia, userRole }: PaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [pixCopied, setPixCopied] = useState(false);
    const [metodo, setMetodo] = useState<MetodoPagamento>("DINHEIRO");

    if (!pendencia) return null;

    const handleAdminPayment = async () => {
        setLoading(true);
        try {
            const result = await markAsPaidAction(pendencia.id, metodo);
            if (result.success) {
                toast.success(result.message);
                onClose();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Erro ao processar pagamento.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyPix = () => {
        const pixCode = `00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-4266141740005204000053039865405${pendencia.valor.toString().replace('.', '')}5802BR5913ESCOLA MODELO6008SAO PAULO62070503***6304`;
        navigator.clipboard.writeText(pixCode);
        setPixCopied(true);
        toast.success("Código PIX copiado!");
        setTimeout(() => setPixCopied(false), 3000);
    };

    const isAdmin = userRole === "ADMINISTRADOR";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        {isAdmin ? (
                            <Wallet className="w-6 h-6 text-primary" />
                        ) : (
                            <QrCode className="w-6 h-6 text-primary" />
                        )}
                    </div>
                    <DialogTitle className="text-center text-xl font-black text-slate-800">
                        {isAdmin ? "Baixa de Pagamento" : "Pagamento via PIX"}
                    </DialogTitle>
                    <DialogDescription className="text-center font-medium">
                        {isAdmin
                            ? `Selecione como o valor de R$ ${Number(pendencia.valor).toFixed(2)} foi recebido:`
                            : `Escaneie o QR Code ou copie o código para pagar R$ ${Number(pendencia.valor).toFixed(2)}`
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-bold">Descrição:</span>
                            <span className="text-slate-900 font-bold">{pendencia.descricao}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-bold">Vencimento:</span>
                            <span className="text-slate-900 font-bold">
                                {new Date(pendencia.dataVencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                            </span>
                        </div>

                        {isAdmin && (
                            <div className="pt-3 border-t border-slate-200">
                                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                                    Método de Recebimento
                                </label>
                                <Select
                                    value={metodo}
                                    onValueChange={(v) => setMetodo(v as MetodoPagamento)}
                                >
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="Selecione o método" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                                        <SelectItem value="PIX">PIX</SelectItem>
                                        <SelectItem value="CARTAO">Cartão de Crédito/Débito</SelectItem>
                                        <SelectItem value="BOLETO">Boleto Bancário</SelectItem>
                                        <SelectItem value="TRANSFERENCIA">Transferência / TED</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {!isAdmin && (
                            <div className="my-4 flex flex-col items-center gap-3">
                                <div className="relative w-40 h-40 bg-white border-2 border-slate-200 rounded-lg flex items-center justify-center">
                                    <QrCode className="w-24 h-24 text-slate-800 opacity-20" />
                                    <span className="absolute text-[10px] font-bold text-slate-400 text-center px-2">
                                        QR CODE SIMULADO
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-2">
                    {isAdmin ? (
                        <Button
                            onClick={handleAdminPayment}
                            disabled={loading}
                            className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20"
                        >
                            {loading ? "Processando..." : "Confirmar Recebimento"}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleCopyPix}
                            variant="outline"
                            className="w-full h-12 rounded-xl text-base font-bold border-primary text-primary hover:bg-primary/5"
                        >
                            {pixCopied ? (
                                <><CheckCircle2 className="w-5 h-5 mr-2" /> Copiado!</>
                            ) : (
                                <><Copy className="w-5 h-5 mr-2" /> Copiar Código PIX</>
                            )}
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="w-full rounded-xl font-bold text-slate-400"
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}