import { CalendarDays, Users, Ticket, BadgeDollarSign } from "lucide-react";
import StatsCard from "~/components/ui/StatsCard";

interface EventsStatsProps {
    stats: {
        totalEventos: number;
        proximosEventos: number;
        totalInscritos: number;
        arrecadacaoReal: string;
    };
}

export function EventsStatsCards({ stats }: EventsStatsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
                title="Total de Eventos"
                value={stats.totalEventos}
                icon={CalendarDays}
                color="text-indigo-600"
                description="Eventos cadastrados no sistema."
            />

            <StatsCard
                title="Próximos Eventos"
                value={stats.proximosEventos}
                icon={Ticket}
                color="text-green-600"
                description="Agendados para os próximos 30 dias."
            />

            <StatsCard
                title="Total de Inscritos"
                value={stats.totalInscritos}
                icon={Users}
                color="text-yellow-600"
                description="Alunos confirmados em todos eventos."
            />
            <StatsCard
                title="Receita Prevista"
                value={stats.arrecadacaoReal}
                icon={BadgeDollarSign}
                color="text-red-600"
                description="Valor total baseado nas confirmações."
            />
        </div>
    );
}