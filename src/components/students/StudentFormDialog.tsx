"use client";

import { useActionState, useState, useRef, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { UserCircle, AlertCircle, School, Save, Plus, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"; // TabsContent removido propositalmente para controle manual
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";

import { createStudent, updateStudent } from "~/actions/students/studentActions";
import { BaseModal } from "../ui/modal/BaseModal";
import { FormModal } from "../ui/modal/FormModal";
import { FormSection } from "../ui/form/FormSection";
import { FormGrid } from "../ui/form/FormGrid";
import { PhotoUpload } from "./PhotoUpload";

import { PatternFormat } from "react-number-format";
import { cn } from "~/lib/utils";

interface ResponsavelForm {
  id: string;
  nome: string;
  telefone: string;
  parentesco: string;
  isNew?: boolean;
}

interface StudentFormDialogProps {
  open: boolean;
  onClose: () => void;
  isLoadingData: boolean;
  student: any | null;
  perguntasEscola: any[];
  onStudentCreated?: (student: any) => void;
}

// --- Helpers ---
const formatDateToInput = (date?: Date | string | null) => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const FieldWrapper = ({ label, error, children, required, className, help }: any) => {
  const errorMessage =
    !error ? null : Array.isArray(error) ? error[0] : typeof error === "string" ? error : String(error);

  return (
    <div className={cn("space-y-1.5 w-full relative", className)}>
      <Label
        className={cn(
          "text-xs font-bold uppercase tracking-wider text-slate-600 flex justify-between",
          errorMessage && "text-destructive"
        )}
      >
        <span>
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      </Label>
      {children}
      {errorMessage && (
        <p className="text-[11px] font-medium text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 absolute -bottom-5 left-0 z-10 bg-white px-1 py-0.5 rounded shadow-sm border border-red-100">
          <AlertCircle className="w-3 h-3" /> {errorMessage}
        </p>
      )}
      {help && !errorMessage && <p className="text-[10px] text-slate-400">{help}</p>}
    </div>
  );
};

export function StudentFormDialog({ open, onClose, isLoadingData, student, perguntasEscola, onStudentCreated }: StudentFormDialogProps) {
  const isEditing = !!student;
  const formKey = student?.id ? `edit-${student.id}` : 'create-new';

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar Aluno" : "Cadastrar Aluno"}
      description={isEditing ? "Atualize os dados e clique em salvar." : "Preencha os dados do novo aluno."}
    >
      {isLoadingData ? (
        <div className="p-8 space-y-6 flex flex-col items-center">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="w-full space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ) : (
        <StudentFormDialogForm
          key={formKey}
          student={student}
          perguntasEscola={perguntasEscola}
          onClose={onClose}
          onStudentCreated={onStudentCreated}
        />
      )}
    </BaseModal>
  );
}

function StudentFormDialogForm({
  student,
  perguntasEscola,
  onClose,
  onStudentCreated,
}: Pick<StudentFormDialogProps, "student" | "perguntasEscola" | "onStudentCreated"> & { onClose: () => void }) {
  const isEditing = !!student;
  const formRef = useRef<HTMLFormElement>(null);
  const [activeTab, setActiveTab] = useState("dados");
  const [removeImage, setRemoveImage] = useState(false);

  const [responsaveis, setResponsaveis] = useState<ResponsavelForm[]>(() => {
    if (student?.aluno?.responsaveisAluno?.length) {
      return student.aluno.responsaveisAluno.map((ra: any) => ({
        id: ra.id,
        nome: ra.nome || "",
        telefone: ra.telefone || "",
        parentesco: ra.parentesco || "",
        isNew: false,
      }));
    }
    return [{ id: uuidv4(), nome: "", telefone: "", parentesco: "", isNew: true }];
  });

  const [respostasIniciais] = useState<Record<string, string>>(() => {
    const respostasMap: Record<string, string> = {};
    const respostas = student?.aluno?.questionarioResposta ?? [];
    for (const r of respostas) {
      const perguntaId = r.perguntaId ?? r.pergunta?.id;
      if (!perguntaId) continue;
      respostasMap[perguntaId] = r.resposta ?? "";
    }
    return respostasMap;
  });

  const [state, formAction, isPending] = useActionState(
    isEditing ? updateStudent : createStudent,
    { success: false, message: "", timestamp: 0 }
  );

  const fieldToTabMap: Record<string, string> = useMemo(
    () => ({
      nome: "dados",
      email: "dados",
      dataNascimento: "dados",
      naturalidade: "dados",
      nacionalidade: "dados",
      cep: "dados",
      ruaEndereco: "dados",
      numeroEndereco: "dados",
      bairroEndereco: "dados",
      cidadeEndereco: "dados",
      estadoEndereco: "dados",
      anoTransferido: "dados",
      escolaTransferida: "dados",
    }),
    []
  );

  // Calcula erros por aba para exibir indicador visual
  const getTabErrors = (tab: string) => {
    if (!state?.fieldErrors) return false;
    return Object.keys(state.fieldErrors).some((field) => {
      if (field.startsWith("resp_") && tab === "responsavel") return true;
      if (field.startsWith("resposta_") && tab === "questionario") return true;
      return fieldToTabMap[field] === tab;
    });
  };

  useEffect(() => {
    const fieldErrors = state?.fieldErrors as Record<string, unknown> | undefined;
    if (!fieldErrors) return;

    const firstErrorField = Object.keys(fieldErrors)[0];
    if (!firstErrorField) return;

    let targetTab = "dados";
    if (firstErrorField.startsWith("resp_")) targetTab = "responsavel";
    else if (firstErrorField.startsWith("resposta_")) targetTab = "questionario";
    else targetTab = (fieldToTabMap as any)[firstErrorField] || "dados";

    setActiveTab(targetTab);

    setTimeout(() => {
      const input = formRef.current?.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }, [state?.fieldErrors, fieldToTabMap]);

  const handleCEPChange = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, "");
    if (cleanCEP.length === 8) {
      try {
        const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCEP}`);
        const data = await res.json();
        if (!data.errors && formRef.current) {
          const fields = {
            ruaEndereco: data.street,
            bairroEndereco: data.neighborhood,
            cidadeEndereco: data.city,
            estadoEndereco: data.state,
          };
          Object.entries(fields).forEach(([name, val]) => {
            const input = formRef.current?.querySelector(`[name="${name}"]`) as HTMLInputElement;
            if (input) input.value = val || "";
          });
        }
      } catch (err) {
        console.error("Erro ao buscar CEP", err);
      }
    }
  };

  return (
    <FormModal
      ref={formRef}
      action={formAction}
      state={state}
      isPending={isPending}
      submitLabel={isEditing ? "Salvar Alterações" : "Cadastrar Aluno"}
      submitIcon={Save}
      contentClassName="max-h-[80vh] overflow-y-auto pr-2"
      onSuccess={() => {
        if (!isEditing && state?.data) onStudentCreated?.(state.data);
        onClose();
      }}
    >
      <input type="hidden" name="studentId" value={student?.id || ""} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sticky z-10 top-0 bg-white mb-6 shadow-sm border border-slate-100/50 rounded-lg p-1">
          <TabsTrigger value="dados" className="relative data-[state=active]:bg-primary/5 data-[state=active]:text-primary group">
            Dados
            {getTabErrors("dados") && <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          </TabsTrigger>
          <TabsTrigger value="responsavel" className="relative data-[state=active]:bg-primary/5 data-[state=active]:text-primary group">
            Responsáveis
            {getTabErrors("responsavel") && <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          </TabsTrigger>
          <TabsTrigger value="questionario" className="relative data-[state=active]:bg-primary/5 data-[state=active]:text-primary group">
            Questionário
            {getTabErrors("questionario") && <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          </TabsTrigger>
        </TabsList>

        {/* 
            IMPLEMENTAÇÃO MANUAL DAS ABAS:
            Usamos divs ocultas (hidden) em vez de TabsContent para garantir que
            os inputs PERMANEÇAM no DOM e sejam submetidos mesmo quando a aba não está ativa.
        */}
        <div className={cn("space-y-6 px-1", activeTab !== "dados" && "hidden")}>
          <div className="flex flex-col items-center justify-center pb-4">
            <input type="hidden" name="remove_image" value={removeImage ? "true" : "false"} />
            <PhotoUpload
              defaultImage={student?.imagem}
              onFileSelect={(file) => setRemoveImage(!file)}
            />
            <p className="text-[10px] text-slate-400 mt-2">Clique para alterar a foto</p>
          </div>

          <FormSection title="Informações Pessoais">
            <FieldWrapper label="Nome Completo" error={state?.fieldErrors?.nome} required>
              <Input name="nome" placeholder="Nome do aluno" defaultValue={state?.values?.nome ?? student?.nome} required />
            </FieldWrapper>

            <FieldWrapper label="E-mail" error={state?.fieldErrors?.email} required>
              <Input
                name="email"
                type="email"
                placeholder="email@escola.com"
                defaultValue={state?.values?.email ?? student?.email}
                required
              />
            </FieldWrapper>

            <FormGrid>
              <FieldWrapper label="Nascimento" error={state?.fieldErrors?.dataNascimento} required>
                <Input
                  type="date"
                  name="dataNascimento"
                  defaultValue={state?.values?.dataNascimento ?? formatDateToInput(student?.dataNascimento)}
                  required
                  max={new Date().toISOString().split("T")[0]}
                />
              </FieldWrapper>
              <FieldWrapper label="Naturalidade" error={state?.fieldErrors?.naturalidade}>
                <Input
                  name="naturalidade"
                  placeholder="Cidade"
                  defaultValue={state?.values?.naturalidade ?? student?.aluno?.naturalidade}
                />
              </FieldWrapper>
              <FieldWrapper label="Nacionalidade" error={state?.fieldErrors?.nacionalidade}>
                <Input
                  name="nacionalidade"
                  placeholder="País"
                  defaultValue={state?.values?.nacionalidade ?? student?.aluno?.nacionalidade}
                />
              </FieldWrapper>
            </FormGrid>
          </FormSection>

          <FormSection title="Endereço">
            <FormGrid>
              <FieldWrapper label="CEP" error={state?.fieldErrors?.cep}>
                <PatternFormat
                  customInput={Input}
                  name="cep"
                  format="#####-###"
                  placeholder="00000-000"
                  defaultValue={state?.values?.cep ?? student?.aluno?.cep}
                  onValueChange={(v) => handleCEPChange(v.value)}
                />
              </FieldWrapper>
              <div className="col-span-1 md:col-span-2">
                <FieldWrapper label="Logradouro" error={state?.fieldErrors?.ruaEndereco}>
                  <Input
                    name="ruaEndereco"
                    placeholder="Rua, Avenida..."
                    defaultValue={state?.values?.ruaEndereco ?? student?.aluno?.ruaEndereco}
                  />
                </FieldWrapper>
              </div>
              <FieldWrapper label="Número" error={state?.fieldErrors?.numeroEndereco}>
                <Input
                  name="numeroEndereco"
                  placeholder="Nº"
                  defaultValue={state?.values?.numeroEndereco ?? student?.aluno?.numeroEndereco}
                />
              </FieldWrapper>
              <FieldWrapper label="Bairro" error={state?.fieldErrors?.bairroEndereco}>
                <Input
                  name="bairroEndereco"
                  placeholder="Bairro"
                  defaultValue={state?.values?.bairroEndereco ?? student?.aluno?.bairroEndereco}
                />
              </FieldWrapper>
              <FieldWrapper label="Cidade" error={state?.fieldErrors?.cidadeEndereco}>
                <Input
                  name="cidadeEndereco"
                  placeholder="Cidade"
                  defaultValue={state?.values?.cidadeEndereco ?? student?.aluno?.cidadeEndereco}
                />
              </FieldWrapper>
              <FieldWrapper label="UF" error={state?.fieldErrors?.estadoEndereco}>
                <Input
                  name="estadoEndereco"
                  placeholder="UF"
                  maxLength={2}
                  className="uppercase"
                  defaultValue={state?.values?.estadoEndereco ?? student?.aluno?.estadoEndereco}
                />
              </FieldWrapper>
            </FormGrid>
          </FormSection>

          <FormSection title="Histórico (Opcional)">
            <FormGrid>
              <div className="col-span-1 md:col-span-2">
                <FieldWrapper label="Escola Anterior" error={state?.fieldErrors?.escolaTransferida}>
                  <Input
                    name="escolaTransferida"
                    placeholder="Nome da escola de origem"
                    defaultValue={state?.values?.escolaTransferida ?? student?.aluno?.escolaTransferida}
                  />
                </FieldWrapper>
              </div>
              <FieldWrapper label="Ano Transf." error={state?.fieldErrors?.anoTransferido}>
                <Input
                  type="number"
                  name="anoTransferido"
                  placeholder="Ano"
                  defaultValue={state?.values?.anoTransferido ?? student?.aluno?.anoTransferido}
                />
              </FieldWrapper>
            </FormGrid>
          </FormSection>
        </div>

        <div className={cn("space-y-4 px-1", activeTab !== "responsavel" && "hidden")}>
          <div className="flex flex-col gap-4">
            {responsaveis.map((resp, index) => (
              <div
                key={resp.id}
                className="p-5 border rounded-xl bg-slate-50/50 space-y-4 relative border-l-4 border-l-primary/70 hover:border-l-primary transition-all"
              >
                <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-2 mb-2">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <UserCircle className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-widest">Responsável {index + 1}</span>
                  </div>
                  {responsaveis.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-slate-400 hover:text-red-500"
                      onClick={() => setResponsaveis(responsaveis.filter((r) => r.id !== resp.id))}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                <FieldWrapper label="Nome Completo" required error={state?.fieldErrors?.[`resp_nome_${index}`]}>
                  <Input
                    name={`resp_nome_${index}`}
                    placeholder="Nome do pai, mãe ou responsável"
                    defaultValue={resp.nome}
                    required
                    className="bg-white"
                  />
                </FieldWrapper>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldWrapper label="Telefone" required error={state?.fieldErrors?.[`resp_telefone_${index}`]}>
                    <PatternFormat
                      customInput={Input}
                      name={`resp_telefone_${index}`}
                      format="(##) # ####-####"
                      mask="_"
                      placeholder="(99) 9 9999-9999"
                      defaultValue={resp.telefone}
                      required
                      className="bg-white"
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Parentesco" required error={state?.fieldErrors?.[`resp_parentesco_${index}`]}>
                    <Input
                      name={`resp_parentesco_${index}`}
                      placeholder="Ex: Pai, Mãe"
                      defaultValue={resp.parentesco}
                      required
                      className="bg-white"
                    />
                  </FieldWrapper>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed py-8 text-slate-500 hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all"
            onClick={() => setResponsaveis([...responsaveis, { id: uuidv4(), nome: "", telefone: "", parentesco: "", isNew: true }])}
          >
            <Plus className="w-5 h-5 mr-2" /> Adicionar Novo Responsável
          </Button>
          <input type="hidden" name="total_responsaveis" value={responsaveis.length} />
        </div>

        <div className={cn("space-y-4 px-1", activeTab !== "questionario" && "hidden")}>
          <div className="space-y-4">
            {perguntasEscola.length > 0 ? (
              perguntasEscola.map((p) => (
                <div key={p.id} className="p-4 border rounded-xl bg-slate-50/50 hover:bg-white transition-all shadow-sm">
                  <FieldWrapper label={p.pergunta}>
                    <input type="hidden" name={`pergunta_id_${p.id}`} value={p.id} />

                    {p.tipo === "TEXTO" ? (
                      <Textarea
                        name={`resposta_${p.id}`}
                        placeholder="Sua resposta..."
                        className="bg-white min-h-[80px] resize-none focus:ring-primary"
                        defaultValue={state?.values?.[`resposta_${p.id}`] ?? respostasIniciais[p.id] ?? ""}
                      />
                    ) : (
                      <div className="relative">
                        <select
                          name={`resposta_${p.id}`}
                          className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                          defaultValue={state?.values?.[`resposta_${p.id}`] ?? respostasIniciais[p.id] ?? "NAO"}
                        >
                          <option value="SIM">Sim</option>
                          <option value="NAO">Não</option>
                          <option value="NAO_SABEMOS">Não Informado</option>
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none opacity-50">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </FieldWrapper>
                </div>
              ))
            ) : (
              <div className="text-center py-16 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed rounded-xl bg-slate-50/30">
                <School className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">Nenhuma pergunta extra configurada.</p>
                <p className="text-xs opacity-70">A escola não possui questionário ativo.</p>
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </FormModal>
  );
}