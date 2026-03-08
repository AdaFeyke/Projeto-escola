"use client";

import { useState } from 'react';
import type { TeacherDetailed } from "~/services/teachers/teacher.service.types";
import { Button } from "~/components/ui/button";
import { Mail, Briefcase, DollarSign, Edit, Trash2 } from "lucide-react";
import ProfessorFormModal from "./TeacherFormModal";
import type { ActionResponse } from '~/services/form/ActionResponse.types';
import { toast } from 'sonner';

interface TeacherCardProps {
    teacher: TeacherDetailed;
    isAdmin: boolean;
    updateAction: (formData: FormData) => Promise<ActionResponse | undefined>;
    deleteAction: (formData: FormData) => Promise<ActionResponse | undefined>;
}

const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

export default function TeacherCard({ teacher, isAdmin, updateAction, deleteAction }: TeacherCardProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Confirma a exclusão de ${teacher.usuario.nome}?`)) return;

        setIsDeleting(true);
        const formData = new FormData();
        formData.append('teacherId', teacher.id);

        try {
            const response = await deleteAction(formData);
            if (response?.success) {
                toast.success('Professor excluído com sucesso!');
            }
        } catch (e) {
            toast.error('Erro ao excluir professor!');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-white border rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300">
            <div className="p-5 space-y-3">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full shrink-0 bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl">
                        {teacher.usuario.nome ? teacher.usuario.nome[0] : 'T'}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">{teacher.usuario.nome}</h3>
                        <p className="text-sm text-gray-500">
                            {teacher.tipoContrato === 'CLT' ? 'Efetivo' : teacher.tipoContrato}
                        </p>
                    </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 pt-2 border-t mt-4">
                    <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{teacher.usuario.email}</span>
                    </div>
                    <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                        <span>CPF: {teacher.cpf}</span>
                    </div>
                    <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium text-green-700">
                            {formatarMoeda(Number(teacher.salarioBase))} (Base)
                        </span>
                    </div>
                </div>
            </div>

            {isAdmin && (
                <div className="flex justify-end p-3 bg-gray-50 border-t space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsEditModalOpen(true)}
                        title="Editar Turma"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        title="Excluir Turma"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>

                </div>
            )}

            {isEditModalOpen && (
                <ProfessorFormModal
                    title={`Editar: ${teacher.usuario.nome}`}
                    action={updateAction}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    professorData={teacher}
                />
            )}
        </div>
    );
}