import prisma from "~/lib/prisma";
import { getCurrentEscolaId } from "~/config/permission-manager";
import { PageHeader } from "~/components/ui/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Wallet, Receipt, Users, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import { SchoolExpensesTab } from "~/components/financial/extra-expenses/SchoolExpensesTab";
import { StudentExtraChargesTab } from "~/components/financial/extra-expenses/StudentExtraChargesTab";
import StatsCard from "~/components/ui/StatsCard";
import { formatCurrency } from "~/utils/formatCurrency";

export default async function ExtraExpensesPage() {
    const escolaId = await getCurrentEscolaId();

    const [despesas, alunos, cobrancasExtras] = await Promise.all([
        prisma.despesaEscola.findMany({
            where: { escolaId },
            orderBy: { data: 'desc' }
        }),
        prisma.aluno.findMany({
            where: { usuario: { escolas: { some: { escolaId } } } },
            include: { usuario: { select: { nome: true } } },
            orderBy: { usuario: { nome: 'asc' } }
        }),
        prisma.pendencia.findMany({
            where: {
                escolaId,
                tipo: { in: ['EXTRA', 'OUTROS'] as any }
            },
            include: {
                aluno: { include: { usuario: { select: { nome: true } } } }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        })
    ]);

    const totalDespesas = despesas.reduce((acc, d) => acc + Number(d.valor), 0);
    const totalCobrancasPendentes = cobrancasExtras
        .filter(c => c.status !== 'PAGO')
        .reduce((acc, c) => acc + Number(c.valor), 0);

    return (
        <div className="space-y-8">
            <PageHeader
                title="Gastos Extras"
                iconElement={<Receipt className="w-7 h-7" />}
                description="Gerenciamento de despesas escolares e cobranças extras aos alunos."
                backHref="/dashboard/financial"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatsCard
                    title="Total em Despesas Escolares"
                    value={formatCurrency(totalDespesas)}
                    icon={TrendingDown}
                    color="text-rose-600"
                    description="Soma de todos os gastos registrados"
                />
                <StatsCard
                    title="Cobranças Extras Pendentes"
                    value={formatCurrency(totalCobrancasPendentes)}
                    icon={TrendingUp}
                    color="text-blue-600"
                    description="Lançamentos aguardando pagamento"
                />
            </div>

            <Tabs defaultValue="escola" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-muted/50 rounded-xl">
                    <TabsTrigger value="escola" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Wallet className="w-4 h-4 mr-2" />
                        Gastos da Escola
                    </TabsTrigger>
                    <TabsTrigger value="alunos" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Users className="w-4 h-4 mr-2" />
                        Cobranças aos Alunos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="escola">
                    <SchoolExpensesTab despesas={despesas} />
                </TabsContent>

                <TabsContent value="alunos">
                    <StudentExtraChargesTab students={alunos} extraCharges={cobrancasExtras} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
