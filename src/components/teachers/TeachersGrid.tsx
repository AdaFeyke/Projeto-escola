"use client";

import { useState } from 'react';
import type { TeacherDetailed } from "~/services/teachers/teacher.service.types";
import TeacherCard from "./TeacherCard";
import TeacherFormModal from "./TeacherFormModal";
import {  UserPen } from "lucide-react";
import { PageHeader } from "../ui/PageHeader";
import type { ActionResponse } from '~/services/form/ActionResponse.types';

interface TeachersGridProps {
    teachers: TeacherDetailed[];
    isAdmin: boolean;
    createAction: (formData: FormData) => Promise<ActionResponse | undefined>;
    updateAction: (formData: FormData) => Promise<ActionResponse | undefined>;
    deleteAction: (formData: FormData) => Promise<ActionResponse | undefined>;
}

export default function TeachersGrid({ teachers, isAdmin, createAction, updateAction, deleteAction }: TeachersGridProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Professores"
                description="Gerencie o corpo docente da instituição"
                iconElement={<UserPen className="w-7 h-7 md:w-8 md:h-8" />}
                buttonLabel="Adicionar Professor"
                showButton={isAdmin}
                backHref="/dashboard"
                onButtonClick={() => setIsCreateModalOpen(true)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {teachers.length === 0 ? (
                    <p className="col-span-full text-center text-gray-500 py-10 rounded-lg">
                        Nenhum professor encontrado nesta escola.
                    </p>
                ) : (
                    teachers.map(teacher => (
                        <TeacherCard
                            key={teacher.id}
                            teacher={teacher}
                            isAdmin={isAdmin}
                            updateAction={updateAction}
                            deleteAction={deleteAction}
                        />
                    ))
                )}
            </div>

            {isCreateModalOpen && (
                <TeacherFormModal
                    title="Adicionar Novo Professor"
                    action={createAction}
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}
        </div>
    );
}