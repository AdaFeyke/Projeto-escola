"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "~/hooks/ui/useConfirm"

import { toast } from "sonner";

import type { QuestionarioPergunta } from "@prisma/client";

import { StudentsToolbar } from "~/components/students/StudentsToolbar";
import { StudentsTable } from "~/components/students/StudentsTable";
import { StudentFormDialog } from "~/components/students/StudentFormDialog";
import { Card, CardContent } from "~/components/ui/card";
import { deleteStudentAction } from "~/actions/students/studentActions";

import { getAlunoDetails } from "~/services/students/aluno.service";
import type { AlunoTabela } from "~/services/students/aluno.service.types"
import { formatDisplayDate } from "~/utils/date-utils";
import { StudentsStatsCards } from "~/components/students/StudentsStatsCards";

interface StudentsClientWrapperProps {
    alunos: AlunoTabela[];
    questions: (QuestionarioPergunta)[];
    isAdmin: boolean;
    stats: any;
}

export function StudentsClientWrapper({ alunos, questions, isAdmin, stats }: StudentsClientWrapperProps) {
    const router = useRouter();
    const { confirm } = useConfirm();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const openEdit = async (student: AlunoTabela) => {
        setIsDialogOpen(true);
        setIsLoading(true);
        try {
            const fullData = await getAlunoDetails(student.id);
            setSelectedStudent(fullData);
        } catch (error) {
            toast.error("Erro ao carregar dados");
            setIsDialogOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    const openCreate = () => {
        setSelectedStudent(null);
        setIsDialogOpen(true);
    };

    const closeDialog = () => setIsDialogOpen(false);

    const deleteStudent = async (student: AlunoTabela) => {
        const confirmed = await confirm({
            title: "Confirmar Exclusão",
            description: `Tem certeza que deseja excluir o aluno "${student.nome}" nascido em "${formatDisplayDate(student.dataNascimento)}"?`,
            confirmText: "Sim, Excluir",
            cancelText: "Cancelar"
        });

        const result = await deleteStudentAction();
        if (confirmed) {
            if (result.success) {
                toast.success("Sucesso", { description: result.message });
            } else {
                toast.error("Erro", { description: result.message });
            }
        }
    };

    return (
        <div className="space-y-6">
            <StudentsToolbar isAdmin={isAdmin} onCreate={openCreate} />
            <StudentsStatsCards stats={stats}/>
            <Card>
                <CardContent>
                    <StudentsTable
                        alunos={alunos}
                        isAdmin={isAdmin}
                        onView={(id) => router.push(`/dashboard/students/${id}`)}
                        onEdit={openEdit}
                        onDelete={deleteStudent}
                    />
                </CardContent>
            </Card>

            <StudentFormDialog
                open={isDialogOpen}
                onClose={closeDialog}
                isLoadingData={isLoading}
                student={selectedStudent}
                perguntasEscola={questions}
            />
        </div>
    );
}