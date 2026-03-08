import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { getProfessorDashboardData } from "~/services/teachers/teacher.service";
import { AlunoCard } from "~/components/students/AlunoCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Users, ClipboardCheck, GraduationCap, ArrowLeft, ClipboardList } from "lucide-react";

import { SeletorClass } from "~/components/classes/SeletorClass";
import { getAlunosDaTurma } from "~/services/students/aluno.service";
import { ChamadaPresenca } from "~/components/classes/frequencia/ChamadaPresenca";
import { getAlunosEStatusFrequencia } from "~/services/classes/frequencia/frequencia.service";
import { GerenciadorAtividades } from "~/components/classes/atividades/GerenciarAtividades";
import { getAtividadesComNotas } from "~/services/classes/atividades/atividades.service";
import { authorizeUser, getCurrentEscolaId } from "~/config/permission-manager";
import prisma from "~/lib/prisma";
import { PageHeader } from "~/components/ui/PageHeader";

interface ClassPageProps {
  params: Promise<{ disciplinaId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ClassPage(props: ClassPageProps) {
  const user = await authorizeUser('/dashboard/classes/class');

  const params = await props.params;
  const turmaDisciplinaId = params.disciplinaId;

  const escolaId = await getCurrentEscolaId();

  const [alunos, frequenciaAlunos, todasTurmas, atividades, ciclos, vinculo] = await Promise.all([
    getAlunosDaTurma(turmaDisciplinaId),
    getAlunosEStatusFrequencia(turmaDisciplinaId),
    getProfessorDashboardData(),
    getAtividadesComNotas(turmaDisciplinaId),
    prisma.cicloLetivo.findMany({
      where: {
        escolaId,
        anoLetivo: { anoAtual: true }
      }
    }),
    prisma.turmaDisciplina.findUnique({
      where: { id: turmaDisciplinaId },
      select: { turmaId: true, disciplinaId: true }
    })
  ]);
  const turmaAtual = todasTurmas.find(t => t.id === turmaDisciplinaId);

  if (!turmaAtual) return <div>Turma não encontrada.</div>;

  const turmasParaSeletor = todasTurmas.map(t => ({
    id: t.id,
    disciplinaNome: t.disciplina.nome,
    turmaNome: t.turma.nome
  }));

  return (
    <>
      <PageHeader
        title="Minha Turma"
        iconElement={<GraduationCap className="w-7 h-7 md:w-8 md:h-8" />}
        description="Gerencie os alunos, faça chamadas e realize lançamentos de notas."
        backHref="/dashboard/classes/my"
      />
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">

          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-2 py-1 rounded">
                {turmaAtual.disciplina.sigla}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-tighter flex items-center gap-1">
                <GraduationCap className="w-4 h-4" /> {turmaAtual.turma.nome}
              </span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            {turmaAtual.disciplina.nome}
          </h1>
        </div>
        <div className="flex flex-col gap-2">
          <SeletorClass options={turmasParaSeletor} currentId={turmaDisciplinaId} />
        </div>
      </header>

      {alunos.length === 0 ? (
        <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed rounded-3xl">
          <ClipboardCheck className="w-12 h-12 mb-3 opacity-20" />
          <p>Nenhum aluno matriculado na turma.</p>
        </div>
      ) : (
        <Tabs defaultValue="alunos" className="w-full">
          <div className="bg-white/50 backdrop-blur-sm border border-gray-100 p-1.5 rounded-2xl shadow-sm mb-8 inline-block w-full md:w-auto">
            <TabsList className="flex flex-wrap md:flex-nowrap gap-1 bg-transparent h-auto p-0">
              {[
                { value: "alunos", label: "Alunos", icon: Users },
                { value: "chamada", label: "Chamada", icon: ClipboardCheck },
                { value: "notas", label: "Notas", icon: ClipboardList },
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

          <TabsContent value="alunos">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {alunos.map(aluno => (
                <AlunoCard
                  key={aluno.id}
                  aluno={{
                    ...aluno,
                    status: "ATIVO",
                    serie: turmaAtual.turma.serie.nome,
                    dataNascimento: aluno.dataNascimento
                      ? format(new Date(aluno.dataNascimento), "dd/MM/yyyy", { locale: ptBR })
                      : "---"
                  }}
                />
              ))}

            </div>
          </TabsContent>
          <TabsContent value="chamada">
            <ChamadaPresenca
              alunos={frequenciaAlunos}
              turmaDisciplinaId={turmaDisciplinaId}
            />
          </TabsContent>
          <TabsContent value="notas">
            <GerenciadorAtividades
              atividades={atividades}
              alunos={alunos}
              usuarioId={user.id}
              turmaId={vinculo?.turmaId || ""}
              disciplinaId={vinculo?.disciplinaId || ""}
              ciclos={ciclos}
            />
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}