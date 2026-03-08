import { authorizeUser } from "~/config/permission-manager";

import { createClassAction, updateClassAction, deleteClassAction } from "~/actions/classes/class.actions";

import { getClassesByEscola, getSeriesAndAnoLetivos } from "~/services/classes/class.service";
import { getDisciplinasByEscola } from "~/services/disciplines/disciplines.service";
import { TeacherService } from "~/services/teachers/teacher.service";

import ClassesGrid from "~/components/classes/ClassesGrid";

export default async function ClassesPage() {
    const user = await authorizeUser('/dashboard/classes');

    const [classes, { series, anosLetivos }, disciplinas, professores] = await Promise.all([
        getClassesByEscola() ?? [],
        getSeriesAndAnoLetivos(),
        getDisciplinasByEscola() ?? [],
        TeacherService.listProfessoresByEscola() ?? [],
    ]);

    const isAdmin = user.role === 'ADMINISTRADOR';

    return (
        <>
            <ClassesGrid
                classes={classes}
                series={series}
                anosLetivos={anosLetivos}
                disciplinas={disciplinas}
                professores={professores}
                isAdmin={isAdmin}
                createAction={createClassAction}
                updateAction={updateClassAction}
                deleteAction={deleteClassAction}
            />
        </>

    );
}