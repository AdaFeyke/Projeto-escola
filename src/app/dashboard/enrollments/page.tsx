import { authorizeUser } from "~/config/permission-manager";
import { EnrollmentStepper } from "~/components/enrollments/EnrollmentStepper";
import { PageHeader } from "~/components/ui/PageHeader";
import { getAlunosByEscola } from "~/services/students/aluno.service";
import { getClassesYearByEscola } from "~/services/classes/class.service";
import { getEscolaQuestions } from "~/services/questions/questions.service";
import { GraduationCap } from "lucide-react";

export default async function EnrollmentsPage() {
    await authorizeUser('/dashboard/enrollments');

    const alunos = await getAlunosByEscola();
    const turmasValidas = await getClassesYearByEscola();
    const perguntas = await getEscolaQuestions();

    return (
        <>
            <PageHeader
                title="Matrículas"
                iconElement={<GraduationCap className="w-7 h-7 md:w-8 md:h-8" />} 
                description="Realize a matrícula dos alunos para uma turma específica."
                backHref="/dashboard"
            />
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <EnrollmentStepper alunos={alunos} turmas={turmasValidas} perguntas={perguntas} />
            </div>
        </>
    );
}