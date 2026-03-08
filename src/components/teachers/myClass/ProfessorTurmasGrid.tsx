import { getProfessorDashboardData } from "~/services/teachers/teacher.service";
import { ProfessorTurmaCard } from "./ProfessorTurmaCard";
import { BookOpen } from "lucide-react";

export default async function ProfessorTurmasGrid() {
  const dados = await getProfessorDashboardData();

  if (!dados || dados.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed">
        <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium text-center">
          Nenhuma turma vinculada ao seu perfil para o ano letivo atual.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {dados.map((item) => (
        <ProfessorTurmaCard key={item.id} data={item} />
      ))}
    </div>
  );
}