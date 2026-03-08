import { getPlanningData, getClassesAndSubjects } from "~/services/pedagogical/planning.service";
import { PedagogicalPageClient } from "~/components/pedagogical/PedagogicalPageClient";
import { getUserSession } from "~/config/permission-manager";

export default async function PedagogicalPlanningPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ anoLetivoId?: string; cicloId?: string }> 
}) {
    const filters = await searchParams;
    const [planejamentos, { turmas, disciplinas, anosLetivos, cicloLetivos }, session] = await Promise.all([
        getPlanningData(filters),
        getClassesAndSubjects(),
        getUserSession()
    ]);

    return (
        <PedagogicalPageClient
            planejamentos={planejamentos}
            turmas={turmas}
            disciplinas={disciplinas}
            userRole={session.role}
            anosLetivos={anosLetivos}
            cicloLetivos={cicloLetivos}
        />
    );
}
