import { authorizeUser } from "~/config/permission-manager";

import { StudentsClientWrapper } from './StudentsClientWrapper';
import { getAlunosByEscola, getStudentsStats } from "~/services/students/aluno.service";

import { getEscolaQuestions } from "~/services/questions/questions.service"

export default async function StudentsServerPage() {
    const user = await authorizeUser('/dashboard/students');
    
    const alunos = await getAlunosByEscola();
    const stats = await getStudentsStats();
    const questions = await getEscolaQuestions();

    const isAdmin = user?.role === 'ADMINISTRADOR';
    return (
        <>             
            <StudentsClientWrapper
                alunos={alunos}
                isAdmin={isAdmin}
                questions={questions}
                stats={stats}
            />
        </>
    );
}