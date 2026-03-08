import { FileText, Printer, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "~/components/ui/button";

export const BoletimCard = ({ user, matriculaAtiva, mediaGeral, nomeEscola }: any) => {
    const mediaEscolar = 6;
    return (
        <Card className="rounded-[2.5rem] bg-white overflow-hidden" id="boletim-area">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 print:hidden">
                <CardTitle className="text-sm font-black uppercase text-slate-800 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-inner">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    Boletim Escolar do Aluno
                </CardTitle>

                <Button
                    onClick={() => window.print()}
                    variant="outline"
                    className="rounded-xl font-black uppercase text-xs gap-2 border-slate-200 hover:bg-slate-50 transition-all"
                >
                    <Printer className="w-4 h-4" />
                    Imprimir
                </Button>
            </CardHeader>

            <CardContent className="p-0">
                <div className="p-10 border-b-4 border-double border-slate-200 bg-white">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-14 h-14 bg-primary flex items-center justify-center rounded-lg">
                                    <FileText className="text-white w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 uppercase">Escola {nomeEscola}</h2>
                                    <p className="text-sm text-slate-500 font-medium">Boletim de Desempenho Escolar</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-3 gap-x-12">
                                <div className="border-l-2 border-slate-100 pl-4">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Estudante</span>
                                    <span className="text-sm font-bold text-slate-800 uppercase">{user.nome}</span>
                                </div>
                                <div className="border-l-2 border-slate-100 pl-4">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Matrícula</span>
                                    <span className="text-sm font-bold text-slate-800">{matriculaAtiva?.numero}</span>
                                </div>
                                <div className="border-l-2 border-slate-100 pl-4">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Turma</span>
                                    <span className="text-sm font-bold text-slate-800 uppercase">{matriculaAtiva?.turma?.nome}</span>
                                </div>
                                <div className="border-l-2 border-slate-100 pl-4">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Ano Letivo</span>
                                    <span className="text-sm font-bold text-slate-800">{matriculaAtiva?.turma?.anoLetivo?.ano || '2024'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right flex flex-col items-end print:hidden">
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg min-w-[180px]">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Data de Emissão</p>
                                <p className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString('pt-BR')}</p>
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold uppercase px-2">Regular</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b-2 border-slate-200">
                                <th className="px-8 py-5 w-[35%]">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Componente Curricular</span>
                                </th>
                                {user.aluno.boletim.ciclos.map((ciclo: any) => (
                                    <th key={ciclo.id} className="px-4 py-5 text-center border-l border-slate-200 bg-slate-50/50">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-slate-700 text-[11px] font-black uppercase">{ciclo.nome}</span>
                                            <div className="grid grid-cols-1 text-[8px] font-bold text-slate-400">
                                                <span>Nota</span>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-5 text-center border-l-2 border-slate-200 bg-slate-100/50">
                                    <span className="text-slate-900 text-[11px] font-black uppercase">Média Final</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {user.aluno.boletim.disciplinas.map((disc: any) => {
                                const notasValidas = disc.notasPorCiclo.filter((n: any) => n.mediaAluno !== null);
                                const mediaFinal = notasValidas.length > 0
                                    ? notasValidas.reduce((sum: number, n: any) => sum + n.mediaAluno, 0) / notasValidas.length
                                    : null;

                                return (
                                    <tr key={disc.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-4">
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                                                {disc.nome}
                                            </span>
                                        </td>
                                        {disc.notasPorCiclo.map((nota: any, nIdx: number) => (
                                            <td key={nIdx} className="px-4 py-4 text-center border-l border-slate-100/50">
                                                <div className="grid grid-cols-1 items-center">
                                                    <span className={cn(
                                                        "text-sm font-bold",
                                                        nota.mediaAluno !== null
                                                            ? (nota.mediaAluno >= mediaEscolar ? "text-emerald-700" : "text-red-600")
                                                            : "text-slate-300"
                                                    )}>
                                                        {nota.mediaAluno !== null ? nota.mediaAluno.toFixed(1) : '-'}
                                                    </span>
                                                </div>
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 text-center border-l-2 border-slate-200 bg-slate-50/30">
                                            <span className={cn(
                                                "text-sm font-black",
                                                mediaFinal !== null
                                                    ? (mediaFinal >= mediaEscolar ? "text-emerald-700" : "text-red-700")
                                                    : "text-slate-300"
                                            )}>
                                                {mediaFinal !== null ? mediaFinal.toFixed(1) : '-'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>

                        <tfoot>
                            <tr className="border-t-2 border-slate-200">
                                <td className="px-8 py-5">
                                    <span className="text-sm font-bold text-slate-500">MÉDIA</span>
                                </td>

                                {user.aluno.boletim.ciclos.map((ciclo: any, cIdx: number) => {
                                    const notasCiclo = user.aluno.boletim.disciplinas
                                        .map((d: any) => d.notasPorCiclo[cIdx]?.mediaAluno)
                                        .filter((n: any) => n !== null && n !== undefined);

                                    const mediaCiclo = notasCiclo.length > 0
                                        ? notasCiclo.reduce((a: number, b: number) => a + b, 0) / notasCiclo.length
                                        : null;

                                    const corTexto = mediaCiclo !== null
                                        ? (mediaCiclo >= mediaEscolar ? "text-emerald-700" : "text-red-600")
                                        : "text-slate-400";

                                    return (
                                        <td key={ciclo.id} className="px-4 py-5 text-center border-l border-slate-100">
                                            <span className={`text-sm font-bold ${corTexto}`}>
                                                {mediaCiclo !== null ? mediaCiclo.toFixed(1) : '-'}
                                            </span>
                                        </td>
                                    );
                                })}

                                <td className="px-6 py-5 text-center">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold leading-none mb-1">MÉDIA GERAL</span>
                                        <span className={`text-lg font-black ${mediaGeral >= mediaEscolar ? "text-emerald-700" : "text-red-600"}`}>
                                            {mediaGeral.toFixed(1)}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="hidden print:flex justify-between items-end p-10 mt-8 border-t border-slate-100">
                    <div className="space-y-1">
                        <div className="w-48 h-px bg-slate-400 mb-2" />
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Assinatura da Coordenação</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                    </div>

                </div>
            </CardContent>

            <style dangerouslySetInnerHTML={{
                __html: `
          @media print {
            /* Esconde tudo no site */
            body * { visibility: hidden; }
            /* Mostra apenas a div do boletim e seus filhos */
            #boletim-area, #boletim-area * { visibility: visible; }
            /* Posiciona o boletim no topo da folha */
            #boletim-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              border: none !important;
              box-shadow: none !important;
            }
            @page { size: portrait; margin: 0; }
            .print\\:hidden { display: none !important; }
            /* Garante que cores de fundo apareçam (ex: azul do cabeçalho) */
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        `}} />
        </Card >
    );
};