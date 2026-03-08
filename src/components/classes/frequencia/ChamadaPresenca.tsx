"use client";

import { useState, useMemo } from "react";
import { ListChecks, Check, X, Clock, Play } from "lucide-react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { ChamadaCard } from "./ChamadaCard";
import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { salvarChamadaAction } from "~/actions/classes/frequencia/frequencia.action";

type StatusPresenca = "PRESENTE" | "AUSENTE" | "ATRASO";

interface Aluno {
  id: string;
  nome: string;
  imagem: string;
  matricula: string;
  statusInicial?: StatusPresenca | null;
}

interface Props {
  alunos: Aluno[];
  turmaDisciplinaId: string
}

export function ChamadaPresenca({ alunos = [], turmaDisciplinaId }: Props) {
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);
  const [isSalvando, setIsSalvando] = useState(false);

  const [presencas, setPresencas] = useState<Record<string, StatusPresenca>>(() => {
    const records: Record<string, StatusPresenca> = {};
    alunos.forEach((a) => {
      if (a.statusInicial) records[a.id] = a.statusInicial;
    });
    return records;
  });

  const toggleStatus = async (alunoId: string, status: StatusPresenca) => {
    setPresencas((prev) => ({ ...prev, [alunoId]: status }));

    try {
      const resultado = await salvarChamadaAction(turmaDisciplinaId, {
        [alunoId]: status,
      });

      if (!resultado.success) {
        toast.error("Erro ao salvar: " + alunoId);
      }
      toast.success("Frequência registrada");

    } catch (error) {
      console.log(error)
      toast.error("Falha na conexão ao salvar presença.");
    }
  };
  const chamadaCompleta = Object.keys(presencas).length === alunos.length && alunos.length > 0;

  const alunosRestantes = useMemo(() =>
    alunos.filter(a => !presencas[a.id]),
    [alunos, presencas]);


  const handleFinalizarChamada = async (dadosFinais: Record<string, StatusPresenca>) => {
    setIsSalvando(true);
    setPresencas(dadosFinais);

    const resultado = await salvarChamadaAction(turmaDisciplinaId, dadosFinais);

    if (resultado.success) {
      toast.success(resultado.message);
      setIsSwipeOpen(false);
    } else {
      toast.error(resultado.message);
    }

    setIsSalvando(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-2 z-30 flex items-center justify-between bg-white/90 backdrop-blur-md p-4 rounded-[2rem] border">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <ListChecks className="w-5 h-5" />
          </div>
          <h2 className="font-black text-slate-800 hidden sm:block">Chamada Diária</h2>
        </div>

        <Button
          onClick={() => setIsSwipeOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-10 px-5 gap-2 transition-all active:scale-95"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{'Realizar Chamada'}</span>
        </Button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full border-collapse">
            <thead className="hidden sm:table-header-group bg-slate-50/50 border-b">
              <tr>
                <th className="p-6 font-black uppercase text-[10px] tracking-widest text-slate-500 text-left">Aluno</th>
                <th className="p-6 font-black uppercase text-[10px] tracking-widest text-slate-500 text-right">Status</th>
              </tr>
            </thead>

            <tbody className="block sm:table-row-group divide-y divide-slate-100">
              {alunos.map((aluno) => {
                const status = presencas[aluno.id];

                return (
                  <tr
                    key={aluno.id}
                    className="flex flex-col sm:table-row hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="block sm:table-cell p-4 sm:p-6 align-middle">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 rounded-full border shrink-0">
                          <AvatarImage src={aluno.imagem} className="object-cover" />
                          <AvatarFallback className="bg-slate-100 flex items-center justify-center font-bold">
                            {aluno.nome[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-700 break-words sm:truncate leading-tight">
                            {aluno.nome}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {aluno.matricula}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="block sm:table-cell p-4 sm:p-6 pt-0 sm:pt-6 align-middle">
                      <div className="flex justify-start sm:justify-end gap-2 sm:gap-3">
                        <StatusButton
                          active={status === "AUSENTE"}
                          variant="red"
                          onClick={() => toggleStatus(aluno.id, "AUSENTE")}
                          icon={<X className="w-5 h-5 stroke-[3px]" />}
                        />
                        <StatusButton
                          active={status === "ATRASO"}
                          variant="amber"
                          onClick={() => toggleStatus(aluno.id, "ATRASO")}
                          icon={<Clock className="w-5 h-5 stroke-[3px]" />}
                        />
                        <StatusButton
                          active={status === "PRESENTE"}
                          variant="green"
                          onClick={() => toggleStatus(aluno.id, "PRESENTE")}
                          icon={<Check className="w-5 h-5 stroke-[3px]" />}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 sm:p-6 bg-slate-50 border-t flex flex-wrap justify-center gap-4 sm:gap-8">
          <Counter label="PRESENTES" count={Object.values(presencas).filter(v => v === "PRESENTE").length} color="bg-green-500" textColor="text-green-600" />
          <Counter label="FALTAS" count={Object.values(presencas).filter(v => v === "AUSENTE").length} color="bg-red-500" textColor="text-red-600" />
          <Counter label="ATRASOS" count={Object.values(presencas).filter(v => v === "ATRASO").length} color="bg-amber-500" textColor="text-amber-600" />
        </div>
      </div>

      {isSwipeOpen && (
        <>
          {chamadaCompleta ? (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm rounded-[2.5rem] bg-white p-8 text-center shadow-2xl animate-in zoom-in">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-500">
                  <Check className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-800">Chamada Concluída</h2>
                <p className="mt-2 text-slate-500">A frequência de hoje está completa.</p>
                <Button onClick={() => setIsSwipeOpen(false)} className="mt-6 w-full rounded-2xl h-14 font-bold text-lg">
                  Ver Resumo
                </Button>
              </div>
            </div>
          ) : (
            <ChamadaCard
              alunos={alunosRestantes}
              onClose={() => setIsSwipeOpen(false)}
              onFinish={handleFinalizarChamada}
            />
          )}
        </>
      )}
    </div>
  );
}

function StatusButton({ active, variant, onClick, icon }: any) {
  const colors = {
    red: active ? "bg-red-500 text-white shadow-lg shadow-red-200" : "bg-slate-100 text-slate-400 opacity-40 hover:bg-red-50 hover:text-red-500",
    amber: active ? "bg-amber-500 text-white shadow-lg shadow-amber-200" : "bg-slate-100 text-slate-400 opacity-40 hover:bg-amber-50 hover:text-amber-500",
    green: active ? "bg-green-500 text-white shadow-lg shadow-green-200" : "bg-slate-100 text-slate-400 opacity-40 hover:bg-green-50 hover:text-green-500",
  };
  return (
    <button onClick={onClick} className={cn("p-2.5 rounded-full transition-all duration-300 active:scale-90", colors[variant as keyof typeof colors])}>
      {icon}
    </button>
  );
}

function Counter({ label, count, color, textColor }: any) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
      <div className={cn("w-2 h-2 rounded-full", color)} />
      {label}: <span className={cn("text-sm ml-1", textColor)}>{count}</span>
    </div>
  );
}