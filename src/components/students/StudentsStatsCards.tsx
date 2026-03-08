import { Briefcase, UserRound, ArrowUpRight, Ban } from "lucide-react";
import type { StudentsStats } from "~/services/students/aluno.service.types";
import StatsCard from '~/components/ui/StatsCard';

interface StudentsStatsCardsProps {
    stats: StudentsStats;
}

export function StudentsStatsCards({ stats }: StudentsStatsCardsProps) {
    const { totalAlunos, alunosAtivos, alunosInativos, alunosEmTransferencia } = stats;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
                title="Total de Alunos"
                value={totalAlunos.toLocaleString('pt-BR')}
                icon={Briefcase}
                color="text-indigo-600"
                description="Inclui todos alunos na escola."
            />

            <StatsCard
                title="Matriculados Ativos"
                value={alunosAtivos.toLocaleString('pt-BR')}
                icon={UserRound}
                color="text-green-600"
                description={`Representa ${((alunosAtivos / totalAlunos) * 100).toFixed(1)}% do total.`}
            />

            <StatsCard
                title="Em Transferência"
                value={alunosEmTransferencia.toLocaleString('pt-BR')}
                icon={ArrowUpRight}
                color="text-yellow-600"
                description="Aguardando confirmação de saída ou entrada."
            />

            <StatsCard
                title="Inativos"
                value={alunosInativos.toLocaleString('pt-BR')}
                icon={Ban}
                color="text-red-600"
                description="Alunos que deixaram a escola."
            />
        </div>
    );
}