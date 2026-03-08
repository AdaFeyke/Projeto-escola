import { authorizeUser } from "~/config/permission-manager";
import { TeacherService } from "~/services/teachers/teacher.service";

import TeachersGrid from "~/components/teachers/TeachersGrid";
import { deleteTeacherAction, updateTeacherAction, createTeacherAction } from "~/actions/teacher/teacher.actions";

import type { TeacherDetailed } from "~/services/teachers/teacher.service.types";

export default async function TeachersPage() {
    const user = await authorizeUser('/dashboard/teachers');
    const isAdmin = user.role === 'ADMINISTRADOR';

    const teachers: TeacherDetailed[] = await TeacherService.listProfessoresByEscola() ?? [];

    return (
        <>
            <TeachersGrid
                teachers={teachers}
                isAdmin={isAdmin}
                createAction={createTeacherAction}
                updateAction={updateTeacherAction}
                deleteAction={deleteTeacherAction}
            />
        </>
    );
}