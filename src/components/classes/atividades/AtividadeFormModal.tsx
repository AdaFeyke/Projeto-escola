import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useActionState } from "react";
import { FormGrid } from "~/components/ui/form/FormGrid";
import { FormSection } from "~/components/ui/form/FormSection";
import { Input } from "~/components/ui/input";
import { BaseModal } from "~/components/ui/modal/BaseModal";
import { FormModal } from "~/components/ui/modal/FormModal";
import { Textarea } from "~/components/ui/textarea";

interface Ciclo {
    id: string;
    nome: string;
}

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


interface Props {
    atividade: Atividade | null;
    action: any;
    open: boolean;
    onClose: () => void;
    ciclos: Ciclo[];
    isLoadingData: boolean;
    turmaId: string;
    disciplinaId: string;
}

export function AtividadeFormModal({ open, atividade, action, onClose, ciclos, turmaId, disciplinaId, isLoadingData }: Props) {
    const [state, formAction, isPending] = useActionState(action, { success: null, message: "", values: {} as Record<string, any> });

    return (
        <BaseModal
            open={open}
            onClose={onClose}
            title={atividade ? "Editar Atividade" : "Nova Atividade"}
            description="Preencha os dados abaixo para criar uma nova atividade para esta turma."
        >
            <FormModal
                action={formAction}
                state={state}
                isPending={isPending}
                submitLabel={atividade ? "Salvar Alterações" : "Cadastrar Atividade"}
                onSuccess={onClose}
            >
                <input type="hidden" name="turmaId" value={turmaId} />
                <input type="hidden" name="disciplinaId" value={disciplinaId} />
                {atividade && <input type="hidden" name="id" value={atividade.id} />}

                <FormSection title="Atividade">
                    <FormGrid cols={1} >
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block mb-1">Título</label>
                            <Input
                                id="titulo"
                                name="titulo"
                                placeholder="Ex: Prova de Matemática 1ª Ciclo"
                                required
                                defaultValue={atividade?.titulo}
                            />
                        </div>
                    </FormGrid>

                    <FormGrid cols={1} >
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block mb-1">Descrição (Opcional)</label>
                            <Textarea
                                id="descricao"
                                name="descricao"
                                placeholder="Detalhes sobre a atividade"
                                className="resize-none h-20"
                                defaultValue={atividade?.descricao || ""}
                            />
                        </div>
                    </FormGrid>

                    <FormGrid cols={2}>
                        <div className="space-y-2 w">
                            <label className="text-sm font-medium text-gray-700">Tipo de Atividade</label>
                            <Select name="tipo" defaultValue={atividade?.tipo || "PROVA"}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PROVA">Prova</SelectItem>
                                    <SelectItem value="TRABALHO">Trabalho</SelectItem>
                                    <SelectItem value="SEMINARIO">Seminário</SelectItem>
                                    <SelectItem value="AULA">Aula</SelectItem>
                                    <SelectItem value="OUTRO">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block mb-1">Ciclo (Opcional)</label>
                            <Select name="cicloId" defaultValue={atividade?.cicloId || undefined}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione um ciclo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {ciclos.map((ciclo) => (
                                        <SelectItem key={ciclo.id} value={ciclo.id}>
                                            {ciclo.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </FormGrid>

                    <FormGrid cols={2}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block mb-1">Valor Máximo</label>
                            <Input
                                id="valorMaximo"
                                name="valorMaximo"
                                type="number"
                                step="0.1"
                                placeholder="10"
                                required
                                defaultValue={atividade?.valorMaximo ?? 10}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block mb-1">Data</label>
                            <Input
                                id="data"
                                name="data"
                                type="date"
                                placeholder="Data da atividade"
                                required
                                defaultValue={atividade?.data ? new Date(atividade.data).toISOString().split('T')[0] : ""}
                            />
                        </div>
                    </FormGrid>
                </FormSection>
            </FormModal>
        </BaseModal>

    );
}