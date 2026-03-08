import prisma from "~/lib/prisma";
import { getUserSession, getCurrentEscolaId } from "~/config/permission-manager";
import { PageHeader } from "~/components/ui/PageHeader";
import { FinancialList } from "~/components/financial/FinancialList";
import { FinancialFilters } from "~/components/financial/FinancialFilters";
import StatsCard from "~/components/ui/StatsCard";
import {
    Wallet,
    Clock,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import { formatCurrency } from "~/utils/formatCurrency";

export default async function FinancialPage(props: {
    searchParams: Promise<{ 
        q?: string; 
        turmaId?: string; 
        status?: string; 
        page?: string;
        mes?: string;
        ano?: string;
    }>
}) {
    const searchParams = await props.searchParams;
    const [user, escolaId] = await Promise.all([getUserSession(), getCurrentEscolaId()]);

    const hoje = new Date();
    const mesAtual = searchParams.mes ? Number(searchParams.mes) : hoje.getMonth() + 1;
    const anoAtual = searchParams.ano ? Number(searchParams.ano) : hoje.getFullYear();
    
    const inicioDoMes = new Date(anoAtual, mesAtual - 1, 1);
    const fimDoMes = new Date(anoAtual, mesAtual, 0, 23, 59, 59);

    const query = searchParams.q || "";
    const turmaId = searchParams.turmaId || "ALL";
    const statusFilter = searchParams.status || "TODOS";
    const currentPage = Number(searchParams.page) || 1;
    const perPage = 15;

    let whereClause: any = { 
        escolaId,
        dataVencimento: {
            gte: inicioDoMes,
            lte: fimDoMes
        }
    };

    if (user.role === 'ALUNO') {
        const aluno = await prisma.aluno.findUnique({
            where: { usuarioId: user.id },
            select: { id: true }
        });
        if (aluno) whereClause.alunoId = aluno.id;
    } else {
        if (query) {
            whereClause.aluno = {
                usuario: { nome: { contains: query, mode: 'insensitive' } }
            };
        }
        if (turmaId !== "ALL") {
            whereClause.aluno = {
                ...whereClause.aluno,
                matriculas: { some: { turmaId, status: "ATIVA" } }
            };
        }
    }

    if (statusFilter === "PAGO") {
        whereClause.status = "PAGO";
    } else if (statusFilter === "PENDENTE") {
        whereClause.status = "PENDENTE";
        whereClause.dataVencimento = { ...whereClause.dataVencimento, gte: hoje > inicioDoMes ? hoje : inicioDoMes };
    } else if (statusFilter === "ATRASADO") {
        whereClause.status = "PENDENTE";
        whereClause.dataVencimento = { ...whereClause.dataVencimento, lt: hoje };
    }

    const [totalCount, pendenciasRaw, turmas] = await Promise.all([
        prisma.pendencia.count({ where: whereClause }),
        prisma.pendencia.findMany({
            where: whereClause,
            include: {
                pagamento: true,
                aluno: {
                    include: {
                        usuario: { select: { nome: true } },
                        matriculas: {
                            where: { status: 'ATIVA' },
                            include: { turma: { select: { nome: true } } },
                            take: 1
                        }
                    }
                }
            },
            orderBy: { dataVencimento: 'asc' },
            skip: (currentPage - 1) * perPage,
            take: perPage
        }),
        user.role === 'ADMINISTRADOR'
            ? prisma.turma.findMany({ where: { escolaId }, select: { id: true, nome: true }, orderBy: { nome: 'asc' } })
            : []
    ]);

    const statsDoMes = await prisma.pendencia.findMany({
        where: {
            escolaId,
            dataVencimento: { gte: inicioDoMes, lte: fimDoMes },
            ...(user.role === 'ALUNO' ? { alunoId: whereClause.alunoId } : {})
        },
        select: { status: true, valor: true, dataVencimento: true, pagamento: { select: { valorPago: true } } }
    });

    const resumo = statsDoMes.reduce((acc, curr) => {
        const valor = Number(curr.valor);
        if (curr.status === 'PAGO') {
            acc.pago += Number(curr.pagamento?.valorPago || valor);
        } else {
            const vencimento = new Date(curr.dataVencimento);
            if (vencimento < hoje) acc.atrasado += valor;
            else acc.pendente += valor;
        }
        return acc;
    }, { pendente: 0, atrasado: 0, pago: 0 });

    const pendenciasProcessadas = pendenciasRaw.map(p => ({
        ...p,
        valor: Number(p.valor),
        status: (p.status === 'PENDENTE' && new Date(p.dataVencimento) < hoje) ? 'ATRASADO' : p.status,
        pagamento: p.pagamento ? { ...p.pagamento, valorPago: Number(p.pagamento.valorPago) } : null
    }));

    const nomeMes = inicioDoMes.toLocaleString('pt-BR', { month: 'long' });

    return (
        <div className="space-y-8">
            <PageHeader
                title={
                    <div className="flex items-center gap-3 text-2xl font-bold tracking-tight">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                            <Wallet className="w-7 h-7 text-primary" />
                        </div>
                        Financeiro <span className="text-muted-foreground font-normal capitalize">| {nomeMes}</span>
                    </div>
                }
                description={`Gestão financeira de ${nomeMes} de ${anoAtual}`}
                backHref="/dashboard"
            />
            

            {/* Stats focados no MÊS SELECIONADO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                    title="Recebido no Mês"
                    value={formatCurrency(resumo.pago)}
                    icon={CheckCircle2}
                    color="text-emerald-600"
                    description={`Total em ${nomeMes}`}
                />
                <StatsCard
                    title="Pendente (A Vencer)"
                    value={formatCurrency(resumo.pendente)}
                    icon={Clock}
                    color="text-blue-600"
                    description="Aguardando pagamento"
                />
                <StatsCard
                    title="Atrasado no Mês"
                    value={formatCurrency(resumo.atrasado)}
                    icon={AlertCircle}
                    color="text-rose-600"
                    description={`Vencidos em ${nomeMes}`}
                />
            </div>

            <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-muted/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold">Lançamentos de {nomeMes}</h3>
                        <p className="text-sm text-muted-foreground">Listagem de lançamentos do mês.</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <FinancialFilters turmas={turmas} />

                    <FinancialList
                        itens={pendenciasProcessadas}
                        userRole={user.role}
                        pagination={{
                            page: currentPage,
                            perPage,
                            total: totalCount,
                            totalPages: Math.ceil(totalCount / perPage)
                        }}
                    />
                </div>
            </div>
        </div>
    );
}