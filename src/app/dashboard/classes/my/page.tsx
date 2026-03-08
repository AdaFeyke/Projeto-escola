import { GraduationCap } from "lucide-react";
import ProfessorTurmasGrid from "~/components/teachers/myClass/ProfessorTurmasGrid";
import { PageHeader } from "~/components/ui/PageHeader";

export default async function MyClassPage() {

    return (
        <div className="space-y-8 pb-20">
            <PageHeader
                title="Minhas Turmas"
                iconElement={<GraduationCap className="w-7 h-7 md:w-8 md:h-8" />}
                description="Gerencie suas turmas e disciplinas."
                backHref="/dashboard/classes"
            />
            <ProfessorTurmasGrid />
        </div>
    );
}