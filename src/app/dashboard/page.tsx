import Link from 'next/link';
import type { PapelUsuario } from '@prisma/client';

import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import {
    ArrowRight, BookOpen, Users, DollarSign, Calendar,
    FileText, GraduationCap, Award, CheckCircle2
} from 'lucide-react';
import { getUserSession } from '~/config/permission-manager';
import {
    getAdminData,
    getAlerts,
    getProfessorData,
    getStudentData
} from '~/services/dashboard/dashboard.services'

import StatsCard from '~/components/ui/StatsCard';
import { AlertasDashboard } from '~/components/dashboard/AlertasDashboard';
import { WelcomeHeader } from '~/components/dashboard/WelcomeHeader';
import { BirthdayCard } from '~/components/dashboard/BirthdayCard';
import RecentActivity from '~/components/dashboard/RecentActivity';

export default async function HomePage() {
    const user = await getUserSession();
    const alerts = await getAlerts(user.role);

    let roleData: any = {};
    let kpis: any[] = [];
    let actions: any[] = [];

    if (user.role === 'ADMINISTRADOR') {
        roleData = await getAdminData();
        kpis = [
            { title: "Alunos Ativos", value: roleData.totalAlunos, icon: Users, color: "text-blue-500", description: "Crescimento de 5% este mês" },
            { title: "Turmas Atuais", value: roleData.totalTurmas, icon: BookOpen, color: "text-emerald-500", description: "Em 12 séries diferentes" },
            { title: "Média Global", value: roleData.avgGrade.toFixed(1), icon: Award, color: "text-amber-500", description: "Média de todas as notas" },
            { title: "Arrecadação", value: `R$ ${roleData.totalRevenue.toLocaleString('pt-BR')}`, icon: DollarSign, color: "text-rose-500", description: "Total de pagamentos pagos" },
        ];
        actions = [
            { label: "Gerenciar Alunos", href: "/dashboard/students", icon: Users },
            { label: "Gerenciar Turmas", href: "/dashboard/classes", icon: BookOpen },
            { label: "Financeiro", href: "/dashboard/finance", icon: DollarSign },
            { label: "Configurações", href: "/dashboard/settings", icon: FileText },
        ];
    } else if (user.role === 'PROFESSOR') {
        const profData = await getProfessorData(user.id);
        kpis = [
            { title: "Minhas Turmas", value: profData?.totalTurmas || 0, icon: BookOpen, color: "text-emerald-500", description: "Disciplinas ativas" },
            { title: "Meus Alunos", value: profData?.totalStudents || 0, icon: Users, color: "text-blue-500", description: "Total de alunos vinculados" },
            { title: "Atividades", value: profData?.upcomingActivities.length || 0, icon: Calendar, color: "text-amber-500", description: "Agendadas para breve" },
        ];
        actions = [
            { label: "Minhas Turmas", href: "/dashboard/classes", icon: BookOpen },
            { label: "Calendário", href: "/dashboard/calendar", icon: Calendar },
            { label: "Documentos", href: "/dashboard/reports", icon: FileText },
        ];
        roleData = { upcomingActivities: profData?.upcomingActivities || [] };
    } else if (user.role === 'ALUNO') {
        const studData = await getStudentData(user.id);
        kpis = [
            { title: "Minha Média", value: studData?.avgGrade.toFixed(1) || "0.0", icon: Award, color: "text-amber-500", description: "Desempenho acadêmico" },
            { title: "Provas", value: studData?.upcomingExams.length || 0, icon: FileText, color: "text-rose-500", description: "Próximas avaliações" },
            { title: "Turma", value: studData?.turma || "N/A", icon: GraduationCap, color: "text-blue-500", description: "Vínculo atual" },
        ];
        actions = [
            { label: "Minhas Notas", href: "/dashboard/grades", icon: Award },
            { label: "Horários", href: "/dashboard/calendar", icon: Calendar },
            { label: "Materiais", href: "/dashboard/materials", icon: BookOpen },
        ];
        roleData = { upcomingExams: studData?.upcomingExams || [] };
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <WelcomeHeader userName={user.nome || "Usuário"} />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi, index) => (
                    <StatsCard key={index} {...kpi} />
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-8 space-y-8">
                    <AlertasDashboard alertas={alerts} />

                    {user.role === 'ADMINISTRADOR' && roleData.recentActivity && (
                        <RecentActivity activities={roleData.recentActivity} />
                    )}

                    {(user.role === 'PROFESSOR' || user.role === 'ALUNO') && (
                        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-none">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    {user.role === 'PROFESSOR' ? 'Próximas Atividades' : 'Próximas Provas'}

                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {(roleData.upcomingActivities || roleData.upcomingExams || []).map((action: any, i: number) => (
                                        <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{action.titulo}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <BookOpen className="w-3 h-3" /> {action.disciplina?.nome}
                                                        {action.turma && <span className="flex items-center gap-1 ml-2"><Users className="w-3 h-3" /> {action.turma.nome}</span>}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary">
                                                    {new Date(action.data).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {(roleData.upcomingActivities || roleData.upcomingExams || []).length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground italic">
                                            Nenhuma atividade agendada.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <Card className="shadow-xl border-none bg-primary text-white overflow-hidden">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" /> Ações Rápidas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {actions.map((action, index) => (
                                <Button key={index} asChild variant="secondary" className="justify-start h-12 w-full font-semibold hover:scale-[1.02] transition-transform">
                                    <Link href={action.href}>
                                        <action.icon className="w-4 h-4 mr-2" />
                                        {action.label}
                                        <ArrowRight className="ml-auto w-4 h-4 opacity-50" />
                                    </Link>
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                    {user.role === 'ADMINISTRADOR' && roleData.upcomingBirthdays && (
                        <BirthdayCard birthdays={roleData.upcomingBirthdays} />
                    )}

                    {/*<Card className="shadow-xl border-none bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="bg-white/10 p-3 rounded-full ring-4 ring-white/5">
                                    <TrendingUp className="w-8 h-8 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">Produtividade Escolar</h3>
                                    <p className="text-sm text-white/60">Você completou 85% das suas tarefas esta semana.</p>
                                </div>
                                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg shadow-emerald-500/20">
                                    Ver Relatório Completo
                                </Button>
                            </div>
                        </CardContent>
                    </Card>*/}
                </div>
            </div>
        </div>
    );
}