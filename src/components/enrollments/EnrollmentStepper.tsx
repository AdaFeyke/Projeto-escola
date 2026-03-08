"use client";

import * as React from "react";
import { toast } from "sonner";

import { StudentFormDialog } from "../students/StudentFormDialog";

import { searchStudentsAction } from "~/actions/students/studentActions";
import { enrollStudent } from "~/actions/enrollStudent/enrollStudent.Actions";

import { useDebounce } from "~/hooks/use-debounce";

import { useState, useEffect, useActionState } from "react";
import { ArrowLeft, ArrowRight, UserCheck, Check, User as UserIcon, BookOpen, Search, Loader2, Calendar, Users, Plus, GraduationCap, School, ArrowRightCircle, Info, Fingerprint } from "lucide-react";

import { Button } from "~/components/ui/button";
import { SelectionCard } from "./SelectionCard";

import type { ClassDetailed } from "~/services/classes/class.service.types";
import { Input } from "../ui/input";
import type { QuestionarioPergunta } from "@prisma/client";

const steps = [
    { id: 1, name: "Selecionar Aluno", icon: UserCheck },
    { id: 2, name: "Selecionar Turma", icon: BookOpen },
    { id: 3, name: "Revisar e Confirmar", icon: Check },
];

interface EnrollmentStepperProps {
    alunos: ({ id: string | null, nome: string | null, email: string | null, imagem: string | null, dataNascimento: any })[];
    turmas: (ClassDetailed)[];
    perguntas: (QuestionarioPergunta)[];
}

export function EnrollmentStepper({ alunos, turmas, perguntas }: EnrollmentStepperProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedAlunoId, setSelectedAlunoId] = useState<string | null>(null);
    const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);

    const [state, formAction, isPending] = useActionState(enrollStudent, {
        success: false,
        message: "",
    });

    const selectedAluno = alunos.find(a => a.id === selectedAlunoId);
    const selectedTurma = turmas.find(t => t.id === selectedTurmaId);

    const nextStep = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setCurrentStep(prev => Math.min(prev + 1, steps.length));
    };
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    useEffect(() => {
        if (!state.message) return;

        if (state.success) {
            toast.success("Sucesso!", {
                description: state.message,
            });
            setCurrentStep(1);
            setSelectedAlunoId(null);
            setSelectedTurmaId(null);
            setSearchQuery("");
        } else {
            toast.error("Erro na Matrícula", {
                description: state.message,
            });
        }
    }, [state]);

    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState(alunos);
    const debouncedSearch = useDebounce(searchQuery, 400);

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearch.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            const results = await searchStudentsAction(debouncedSearch);
            setSearchResults(results);
            setIsSearching(false);
        };
        performSearch();
    }, [debouncedSearch]);

    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

    const handleStudentCreated = (newStudent: any) => {
        if (selectedAlunoId !== newStudent.id) {
            setSearchResults([newStudent]);
            setSelectedAlunoId(newStudent.id);
            setSearchQuery(newStudent.nome);
            setIsStudentModalOpen(false);
            setCurrentStep(2);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="relative max-w-lg mx-auto group">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${isSearching ? 'text-primary' : 'text-gray-400'}`} />
                            <Input
                                placeholder="Buscar por nome"
                                className="pl-10 h-12 rounded-2xl border-1 border-slate-200 shadow-sm focus-visible:ring-primary focus-visible:border-primary transition-all"
                                value={searchQuery || ""}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {searchResults.map((aluno, index) => (
                                <SelectionCard
                                    key={aluno.id || `temp-${index}`}
                                    title={aluno.nome || ""}
                                    icon={UserIcon}
                                    imagem={aluno.imagem}
                                    subtitle={aluno.email || ""}
                                    isSelected={selectedAlunoId === aluno.id}
                                    onClick={() => setSelectedAlunoId(aluno.id)}
                                    details={
                                        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 bg-slate-100 w-fit px-2 py-1 rounded-md">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {aluno.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR') : 'Data não informada'}
                                        </div>
                                    }
                                />
                            ))}

                            {!isSearching && (
                                <button
                                    key="add-new-student-button"
                                    type="button"
                                    onClick={() => setIsStudentModalOpen(true)}
                                    className="group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 p-6 transition-all hover:border-primary/50 hover:bg-primary/5"
                                >
                                    <Plus className="h-6 w-6 text-slate-400 group-hover:text-primary mb-2" />
                                    <span className="text-sm font-semibold text-slate-600 group-hover:text-primary">
                                        Cadastrar novo aluno
                                    </span>
                                </button>
                            )}
                        </div>

                        <StudentFormDialog
                            open={isStudentModalOpen}
                            onClose={() => setIsStudentModalOpen(false)}
                            isLoadingData={false}
                            student={null}
                            perguntasEscola={perguntas}
                            onStudentCreated={handleStudentCreated}
                        />
                    </div>
                );
            case 2:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {turmas.map(turma => (
                            <SelectionCard
                                key={turma.id}
                                icon={BookOpen}
                                title={turma.nome}
                                subtitle={''}
                                isSelected={selectedTurmaId === turma.id}
                                onClick={() => setSelectedTurmaId(turma.id)}
                                details={
                                    <div className="flex flex-wrap gap-3 items-center mt-4">
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-white font-bold text-[10px] tracking-wider uppercase shadow-sm">
                                            <GraduationCap className="w-3.5 h-3.5" />
                                            {turma.serie.nome}
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-[11px] tracking-wide uppercase">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {turma.anoLetivo.ano}
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-[11px] font-semibold">
                                            <Users className="w-3.5 h-3.5 text-slate-400" />
                                            <span>
                                                {turma.alunosCount} {turma.alunosCount === 1 ? "aluno" : "alunos"}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {turma.turmaDisciplinas.map((discplina) => (
                                                <div
                                                    key={discplina.disciplina.id}
                                                    className="group flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-primary/50 hover:shadow-sm transition-all duration-200"
                                                >
                                                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-[11px] font-medium text-slate-600 group-hover:text-primary transition-colors">
                                                        {discplina.disciplina.nome}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                }
                            />
                        ))}
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6 max-w-lg mx-auto p-8 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
                        {/* Header com Status */}
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Vínculo de Matrícula</h3>
                                <p className="text-sm text-slate-500 font-medium">Confirme os dados</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <UserIcon className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Estudante</span>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-lg font-bold text-slate-800 leading-tight">
                                        {selectedAluno?.nome}
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-white border border-slate-200 shadow-sm">
                                        <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-[11px] font-medium text-slate-500">RA: </span>
                                        <span className="text-[11px] font-bold text-primary animate-pulse">Gerando ao confirmar...</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 px-2">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                                <ArrowRightCircle className="w-5 h-5 text-slate-300" />
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <School className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Destino: {selectedTurma?.serie?.nome}</span>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-lg font-bold text-slate-800">
                                        {selectedTurma?.nome}
                                    </p>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                            <BookOpen className="w-3 h-3" />
                                            Grade Curricular Vinculada
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedTurma?.turmaDisciplinas?.map((td: any) => (
                                                <span
                                                    key={td.id}
                                                    className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 font-medium"
                                                >
                                                    {td.disciplina.nome}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-blue-700 leading-relaxed">
                                A confirmação registrará o aluno no <strong>Ano Letivo de {selectedTurma?.anoLetivo?.ano}</strong>. O número de matrícula (RA) será gerado automaticamente pelo sistema após a conclusão deste passo.
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-gray-200 after:top-1/2 after:-translate-y-1/2 after:z-0">
                {steps.map((step, index) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    return (
                        <div key={step.id} className="flex flex-col items-center z-10 w-1/3">
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all duration-300
                                ${isCompleted
                                    ? "bg-primary text-white"
                                    : isActive
                                        ? "bg-primary text-white ring-4 ring-primary/20"
                                        : "bg-white text-gray-500 border border-gray-300"
                                }
                            `}>
                                {isCompleted ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                            </div>
                            <p className={`mt-2 text-center text-xs sm:text-sm font-medium ${isActive ? 'text-primary' : 'text-gray-600'}`}>
                                {step.name}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="py-8 min-h-[400px]">
                <form action={formAction} id="enrollment-form">
                    <input type="hidden" name="alunoId" value={selectedAlunoId || ""} />
                    <input type="hidden" name="turmaId" value={selectedTurmaId || ""} />

                    {renderStepContent()}
                </form>
            </div>

            <div className="flex justify-between border-t pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Anterior
                </Button>

                {currentStep < steps.length ? (
                    <Button
                        type="button"
                        onClick={nextStep}
                        disabled={
                            (currentStep === 1 && !selectedAlunoId) ||
                            (currentStep === 2 && !selectedTurmaId)
                        }
                    >
                        Próximo
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button
                        type="submit"
                        form="enrollment-form"
                        disabled={!selectedAlunoId || !selectedTurmaId || isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processando...
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5 mr-2" />
                                Confirmar Matrícula
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}