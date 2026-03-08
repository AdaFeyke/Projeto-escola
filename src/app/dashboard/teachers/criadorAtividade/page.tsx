import { PageHeader } from "~/components/ui/PageHeader";
import GeradorDeProvas from "~/components/teachers/criadorAtividades/GeradorDeProvas";

export default async function CriadorAtividadePage() {
    return (
        <>
            <PageHeader
                title="Criador de Atividades"
                description="Gerencie suas aulas, assuntos e atividades das turmas"
            />
            <GeradorDeProvas/>
        </>
    );
}