import { authorizeUser, getCurrentEscolaId } from "~/config/permission-manager";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import SerieManager from "~/components/settings/serie/SerieManager";
import AnoLetivoManager from "~/components/settings/anoLetivo/AnoLetivoManager";

import { getSeriesAndAnoLetivos } from "~/services/classes/class.service";
import { getDisciplinasByEscola } from "~/services/disciplines/disciplines.service";

import { PageHeader } from "~/components/ui/PageHeader";
import DisciplinaManager from "~/components/settings/disciplina/DisciplinaManager";
import PerguntaManager from "~/components/settings/pergunta/PerguntaManager";
import { getEscolaQuestions } from "~/services/questions/questions.service";
import CicloManager from "~/components/settings/ciclos/CicloManager";
import prisma from "~/lib/prisma";
import { getCiclosAtuais } from "~/services/ciclo/ciclo.service";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
    const user = await authorizeUser('/dashboard/settings');
    const [
        { series, anosLetivos },
        disciplinas,
        questions
    ] = await Promise.all([
        getSeriesAndAnoLetivos(),
        getDisciplinasByEscola(),
        getEscolaQuestions()
    ]);

    const escolaId = await getCurrentEscolaId();

    const ciclos = await getCiclosAtuais();

    const anos = await prisma.anoLetivo.findMany({
        where: { escolaId },
        orderBy: { ano: 'desc' }
    });

    return (
        <>
            {user.role === "ADMINISTRADOR" && (
                <>
                    <PageHeader
                        title="Configuração da Escola"
                        backHref="/dashboard"
                        iconElement={<Settings className="w-7 h-7 md:w-8 md:h-8" />}
                    />
                    <Tabs defaultValue="ciclos" className="w-full">
                        <div className="bg-white/50 backdrop-blur-sm border border-gray-100 p-1.5 rounded-2xl shadow-sm mb-8 inline-block w-full md:w-auto">
                            <TabsList className="flex flex-wrap md:flex-nowrap gap-1 bg-transparent h-auto p-0">
                                {[
                                    { value: "escola", label: "Escola" },
                                    { value: "alunos", label: "Alunos" },
                                    { value: "ciclos", label: "Ciclos" },
                                    { value: "series", label: "Séries" },
                                    { value: "anos-letivos", label: "Anos Letivos" },
                                    { value: "disciplinas", label: "Disciplinas" },
                                    { value: "questionario", label: "Questionário" },
                                ].map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="
                                            px-6 py-2.5 text-sm font-bold transition-all duration-300
                                            data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md
                                            data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:bg-gray-100
                                            rounded-xl border-none
                                        "
                                    >
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <div className="mt-2">
                            <TabsContent value="escola">...</TabsContent>
                            <TabsContent value="alunos">...</TabsContent>
                            <TabsContent value="ciclos">
                                <CicloManager initialCiclos={ciclos} anosLetivos={anos} />
                            </TabsContent>
                            <TabsContent value="anos-letivos">
                                <AnoLetivoManager initialAnosLetivos={anosLetivos} />
                            </TabsContent>
                            <TabsContent value="series">
                                <SerieManager initialSeries={series} />
                            </TabsContent>
                            <TabsContent value="disciplinas">
                                <DisciplinaManager initialDisciplinas={disciplinas} />
                            </TabsContent>
                            <TabsContent value="questionario">
                                <PerguntaManager initialPerguntas={questions} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </>
            )}
        </>
    );
}
