"use client";

import {
    User as UserIcon,
    MapPin,
    Calendar,
    GraduationCap,
    Mail,
    BookOpen,
    CheckCircle2,
    XCircle,
    AlertCircle,
    TrendingUp,
    Clock,
    CircleQuestionMark,
    FileDown,
    Wallet
} from 'lucide-react';
import { FinancialList } from '~/components/financial/FinancialList';
import Image from 'next/image';
import { formatDisplayDate } from "~/utils/date-utils";
import { formatCurrency } from "~/utils/formatCurrency";
import { Badge } from "~/components/ui/badge";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { BoletimCard } from './boletim/BoletimCard';

function Progress({ value, className }: { value: number, className?: string }) {
    return (
        <div className={`w-full bg-slate-100 rounded-full h-2 overflow-hidden ${className}`}>
            <div
                className="bg-primary h-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
        </div>
    );
}

export function FichaAluno({ user, nomeEscola }: any) {
    const matriculaAtiva = user.aluno.matriculas?.find(
        (m: any) => m.status === "ATIVA"
    );

    const notas = user.aluno.notas || [];
    const frequencias = user.aluno.frequencias || [];

    const totalAulas = frequencias.length;
    const presencas = frequencias.filter((f: any) => f.status === 'PRESENTE').length;
    const mediaFrequencia = totalAulas > 0 ? (presencas / totalAulas) * 100 : 100;

    const mediaGeral = notas.length > 0
        ? notas.reduce((acc: number, n: any) => acc + n.valor, 0) / notas.length
        : 0;

    const pendencias = user.aluno.pendencias || [];
    const totalPendente = pendencias
        .filter((p: any) => p.status === 'PENDENTE' || p.status === 'ATRASADO')
        .reduce((acc: number, p: any) => acc + Number(p.valor), 0);
    const totalPago = pendencias
        .filter((p: any) => p.status === 'PAGO')
        .reduce((acc: number, p: any) => acc + Number(p.valor), 0);

    return (
        <div className="space-y-8">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-primary p-8 md:p-12 text-white transform-gpu">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="relative group">
                        <div className="absolute -inset-2 bg-white/20 rounded-full blur-md opacity-50 md:opacity-0 md:group-hover:opacity-100 transition duration-500" />

                        <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-white/20 bg-white/20 flex items-center justify-center shadow-2xl">
                            {user.imagem ? (
                                <Image
                                    src={user?.imagem}
                                    alt={user?.nome}
                                    fill
                                    priority
                                    sizes="(max-width: 768px) 128px, 176px"
                                    className="object-cover"
                                />
                            ) : (
                                <UserIcon className="w-16 h-16 text-white/40" />
                            )}
                        </div>
                        <div className={cn(
                            "absolute bottom-3 right-3 w-7 h-7 rounded-full border-4 border-primary flex items-center justify-center z-20",
                            user?.status === 'ATIVO' ? "bg-emerald-400" : "bg-red-400"
                        )} />
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-4xl md:text-5xl font-black leading-none text-white tracking-tight">
                                {user?.nome}
                            </h3>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <div className="flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                                    <GraduationCap className="w-4 h-4 text-white/80" />
                                    <span className="text-sm font-bold uppercase">
                                        Matrícula: {matriculaAtiva?.numero || 'Pendente'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                                    <BookOpen className="w-4 h-4 text-white/80" />
                                    <span className="text-sm font-bold uppercase">
                                        {matriculaAtiva?.turma?.nome || 'Sem Turma'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="bg-white/15 border border-white/20 rounded-[2.5rem] p-7 flex flex-col items-center justify-center min-w-[140px] shadow-xl transform-gpu transition-transform active:scale-95">
                            <span className="text-xs font-black text-white/60 uppercase mb-1">Presença</span>
                            <span className="text-4xl font-black">{mediaFrequencia.toFixed(0)}%</span>
                        </div>
                        <div className="bg-white/15 border border-white/20 rounded-[2.5rem] p-7 flex flex-col items-center justify-center min-w-[140px] shadow-xl transform-gpu transition-transform active:scale-95">
                            <span className="text-xs font-black text-white/60 uppercase mb-1">Média</span>
                            <span className="text-4xl font-black">{mediaGeral.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <div className="bg-white/60 backdrop-blur-md border border-slate-100 p-1.5 rounded-2xl shadow-sm mb-8 inline-block w-full md:w-auto">
                    <TabsList className="flex flex-wrap md:flex-nowrap gap-1 bg-transparent h-auto p-0">
                        {[
                            { value: "overview", label: "Informações Gerais" },
                            { value: "academic", label: "Desempenho Acadêmico" },
                            { value: "report-card", label: "Boletim Escolar" },
                            { value: "attendance", label: "Frequência Escolar" },
                            { value: "financial", label: "Financeiro" },
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

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-1 rounded-[2.5rem] bg-white overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-sm font-black uppercase  text-slate-800 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    Dados Pessoais
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-6">
                                <InfoItem icon={Calendar} label="Data de Nascimento" value={formatDisplayDate(user.dataNascimento)} />
                                <InfoItem icon={MapPin} label="Endereço Residencial" value={`${user.aluno.ruaEndereco}, ${user.aluno.numeroEndereco} - ${user.aluno.bairroEndereco}`} />
                                <InfoItem icon={Mail} label="E-mail" value={user.email} />

                                <Separator className="my-6" />

                                <div className="space-y-5">
                                    <h5 className="text-sm font-black uppercase text-primary/60">Responsáveis Legais</h5>
                                    {user.aluno.responsaveisAluno.map((r: any, idx: number) => (
                                        <div key={idx} className="group bg-slate-50 hover:bg-primary/5 rounded-[1.5rem] p-5 flex items-center gap-5 border border-slate-100 transition-all duration-300">
                                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                                <UserIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800">{r.nome}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm font-bold text-primary/70 uppercase">{r.parentesco}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <span className="text-sm font-medium text-slate-500">{r.telefone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2 rounded-[2.5rem] bg-white overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-sm font-black uppercase  text-slate-800 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner">
                                        <CircleQuestionMark className="w-5 h-5" />
                                    </div>
                                    Questionário
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    {user.aluno.questionarioResposta?.length > 0 ? (
                                        user.aluno.questionarioResposta.map((q: any, index: number) => (
                                            <div key={index} className="group p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 hover:border-primary/20 hover:bg-white">
                                                <p className="text-sm font-black uppercase text-primary/60 mb-3">{q.pergunta.pergunta}</p>
                                                <p className="text-[13px] font-bold text-slate-700 leading-relaxed italic">"{q.resposta || 'Não informado'}"</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2 flex flex-col items-center justify-center py-16 text-slate-300">
                                            <AlertCircle className="w-16 h-16 mb-6 opacity-20" />
                                            <p className="text-sm font-black uppercase ">Nenhuma observação registrada</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="academic" className="space-y-6">
                    <div className="grid gap-8 md:grid-cols-3">
                        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/20 bg-primary text-white overflow-hidden p-10 flex flex-col justify-between relative group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[60px] -mr-24 -mt-24 rounded-full group-hover:bg-white/20 transition-all duration-700" />

                            <div className="space-y-2 relative z-10">
                                <p className="text-sm font-black uppercase  text-white/70">Média Geral Acadêmica</p>
                                <p className="text-6xl font-black  drop-shadow-lg">{mediaGeral.toFixed(1)}</p>
                            </div>

                            <div className="pt-12 relative z-10">
                                <div className="flex justify-between items-end mb-3">
                                    <span className="text-sm font-black uppercase text-white/80">Desempenho Global</span>
                                    <span className="text-sm font-black">{Math.round(mediaGeral * 10)}%</span>
                                </div>
                                <Progress value={mediaGeral * 10} className="h-3 bg-white/20 transition-all [&>div]:bg-white" />
                                <p className="text-sm font-bold mt-4 text-white/60 uppercase">Baseado em {notas.length} avaliações</p>
                            </div>
                        </Card>

                        <Card className="md:col-span-2 rounded-[2.5rem] bg-white overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-sm font-black uppercase  text-slate-800 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    Histórico de Notas Recentes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-sm font-black uppercase text-slate-400">
                                                <th className="px-8 py-5">Disciplina / Conteúdo</th>
                                                <th className="px-8 py-5">Data Lançamento</th>
                                                <th className="px-8 py-5 text-center">Nota</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {notas.length > 0 ? notas.map((nota: any, idx: number) => (
                                                <tr key={idx} className="group hover:bg-slate-50/80 transition-all duration-300">
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[13px] font-black text-slate-800 group-hover:text-primary transition-colors">
                                                                {nota.turmaDisciplina?.disciplina?.nome || 'Disciplina'}
                                                            </span>
                                                            <span className="text-sm font-bold text-slate-400 uppercase">
                                                                {nota.atividadeTurma?.titulo || 'Avaliação Acadêmica'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-xs font-bold text-slate-500">{formatDisplayDate(nota.dataLancamento)}</span>
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        <Badge className={cn(
                                                            "rounded-xl font-black text-[12px] px-4 py-1.5 border-none shadow-sm",
                                                            nota.valor >= 7
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : "bg-red-100 text-red-700"
                                                        )}>
                                                            {nota.valor.toFixed(1)}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={3} className="px-8 py-16 text-center text-slate-300">
                                                        <p className="font-black uppercase  text-sm">Nenhum lançamento encontrado</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="report-card" className="space-y-6">
                    {user.aluno.boletim ? (
                        <BoletimCard matriculaAtiva={matriculaAtiva} user={user} mediaGeral={mediaGeral} nomeEscola={nomeEscola} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50">
                            <FileDown className="w-20 h-20 text-slate-200 mb-6 animate-bounce" />
                            <h3 className="text-xl font-black uppercase text-slate-800 mb-2">Boletim Indisponível</h3>
                            <p className="text-slate-400 font-bold max-w-sm text-center">Este aluno ainda não possui notas lançadas ou não está matriculado em uma turma com ciclos ativos.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="attendance" className="space-y-6">
                    <div className="grid gap-8 md:grid-cols-3">
                        <Card className="rounded-[2.5rem] bg-white overflow-hidden p-10 flex flex-col justify-center items-center text-center space-y-8">
                            <div className="relative w-44 h-44">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="88"
                                        cy="88"
                                        r="78"
                                        stroke="currentColor"
                                        strokeWidth="14"
                                        fill="transparent"
                                        className="text-slate-100"
                                    />
                                    <circle
                                        cx="88"
                                        cy="88"
                                        r="78"
                                        stroke="currentColor"
                                        strokeWidth="14"
                                        fill="transparent"
                                        strokeDasharray={490}
                                        strokeDashoffset={490 - (490 * mediaFrequencia) / 100}
                                        className="text-primary transition-all duration-1500 ease-in-out"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-black text-slate-800 ">{mediaFrequencia.toFixed(0)}%</span>
                                    <span className="text-sm font-black uppercase text-primary mt-1">Presença</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-[13px] font-black text-slate-800 uppercase">Frequência Escolar {mediaFrequencia >= 90 ? 'Excelente' : mediaFrequencia >= 75 ? 'Boa' : 'Baixa'}</h4>
                                <div className="text-xs font-bold text-slate-500 leading-relaxed px-4">
                                    <div className="flex flex-col gap-2">
                                        <p className="text-slate-700">
                                            Presença confirmada em <strong className="text-primary">{presencas}</strong> das <strong className="text-primary">{totalAulas}</strong> aulas totais do período.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="md:col-span-2 rounded-[2.5rem] bg-white overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-sm font-black uppercase text-slate-800 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    Registro de Frequência Diária
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-sm font-black uppercase text-slate-400">
                                                <th className="px-8 py-5">Data da Atividade</th>
                                                <th className="px-8 py-5">Disciplina Escolar</th>
                                                <th className="px-8 py-5 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {frequencias.length > 0 ? frequencias.slice(0, 10).map((f: any, idx: number) => (
                                                <tr key={idx} className="group hover:bg-slate-50/80 transition-all duration-300">
                                                    <td className="px-8 py-5">
                                                        <span className="text-xs font-bold text-slate-600">{formatDisplayDate(f.data)}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-xs font-black text-slate-800 group-hover:text-primary transition-colors">
                                                            {f.turmaDisciplina?.disciplina?.nome || 'Disciplina'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        {f.status === 'PRESENTE' ? (
                                                            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 font-black text-sm uppercase px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Presente
                                                            </div>
                                                        ) : f.status === 'AUSENTE' ? (
                                                            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 font-black text-sm uppercase px-3 py-1.5 rounded-xl border border-red-100 shadow-sm">
                                                                <XCircle className="w-3.5 h-3.5" /> Ausente
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 font-black text-sm uppercase px-3 py-1.5 rounded-xl border border-amber-100 shadow-sm">
                                                                <Clock className="w-3.5 h-3.5" /> Atraso
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={3} className="px-8 py-16 text-center text-slate-300">
                                                        <p className="font-black uppercase  text-sm">Nenhum registro localizado</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-6">
                    <Card className="rounded-[2.5rem] bg-white overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase text-slate-800 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-emerald-500">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                Histórico Financeiro
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden relative group hover:border-amber-200 transition-all">
                                        <div className="p-5 relative z-10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                                        <Clock className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Total Pendente</p>
                                                        <h4 className="text-xl font-black text-slate-800 tabular-nums">
                                                            {formatCurrency(totalPendente)}
                                                        </h4>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                                                    {Math.round((totalPendente / (totalPendente + totalPago || 1)) * 100)}%
                                                </span>
                                            </div>

                                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-amber-400 h-full rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${(totalPendente / (totalPendente + totalPago || 1)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden relative group hover:border-emerald-200 transition-all">
                                        <div className="p-5 relative z-10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Total Recebido</p>
                                                        <h4 className="text-xl font-black text-slate-800 tabular-nums">
                                                            {formatCurrency(totalPago)}
                                                        </h4>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                                    {Math.round((totalPago / (totalPendente + totalPago || 1)) * 100)}%
                                                </span>
                                            </div>

                                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${(totalPago / (totalPendente + totalPago || 1)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>

                            <FinancialList
                                itens={user.aluno.pendencias || []}
                                userRole="ADMINISTRADOR"
                                pagination={{
                                    page: 1,
                                    perPage: 100,
                                    total: user.aluno.pendencias?.length || 0,
                                    totalPages: 1
                                }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-start gap-4 p-2 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 bg-white shadow-sm shrink-0">
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-sm font-black uppercase text-slate-400 leading-none mb-1">{label}</span>
                <span className="text-xs font-bold text-slate-700 truncate">{value || 'N/A'}</span>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}