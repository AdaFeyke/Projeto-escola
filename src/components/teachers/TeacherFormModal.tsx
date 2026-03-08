"use client";

import React, { useState } from "react";
import type { TeacherDetailed } from "~/services/teachers/teacher.service.types";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import type { ActionResponse } from "~/services/form/ActionResponse.types";

const formatDateToInput = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0] ?? "";
};

interface ProfessorFormModalProps {
  title: string;
  action: (formData: FormData) => Promise<ActionResponse | undefined>;
  isOpen: boolean;
  onClose: () => void;
  professorData?: TeacherDetailed;
}

export default function TeacherFormModal({
  title,
  action,
  isOpen,
  onClose,
  professorData,
}: ProfessorFormModalProps) {
  const isEditing = !!professorData;
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: professorData?.usuario.nome || "",
    email: professorData?.usuario.email || "",
    senhaHash: "",
    cpf: professorData?.cpf || "",
    salarioBase: professorData?.salarioBase.toString() || "",
    tipoContrato: professorData?.tipoContrato || "",
    dataInicioContrato: formatDateToInput(professorData?.dataInicioContrato),
    dataFimContrato: formatDateToInput(professorData?.dataFimContrato),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formEntries = new FormData(e.currentTarget);

    if (!isEditing && !formEntries.get("senhaHash")) {
      toast.error("A senha inicial é obrigatória.", {
        description: "Insira a senha para criar o professor.",
      });
      setIsLoading(false);
      return;
    }

    try {
      await action(formEntries);

      toast.success(`${title} concluído.`, {
        description: "As informações foram salvas com sucesso.",
      });

      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao salvar professor.", {
        description: error.message || "Erro inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para continuar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {isEditing && (
            <input type="hidden" name="teacherId" value={professorData.id} />
          )}

          {/* Dados Pessoais */}
          <h3 className="text-md font-semibold text-gray-700 pt-2">Dados Pessoais</h3>

          <Input
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Nome Completo"
            autoComplete="off"
            required
          />

          <Input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            autoComplete="off"
            required
            type="email"
          />

          <Input
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            placeholder="CPF"
            autoComplete="off"
            required
          />

          <Input
            name="senhaHash"
            value={formData.senhaHash}
            onChange={handleChange}
            placeholder={isEditing ? "Deixe vazio para manter a senha" : "Senha Inicial"}
            autoComplete="off"
            required={!isEditing}
            type="password"
          />

          {/* Contratuais */}
          <h3 className="text-md font-semibold text-gray-700 pt-4 border-t">Detalhes Contratuais</h3>

          <Input
            name="salarioBase"
            value={formData.salarioBase}
            onChange={handleChange}
            placeholder="Salário Base (R$)"
            autoComplete="off"
            required
            type="number"
            step="0.01"
          />

          <input
            type="hidden"
            name="tipoContrato"
            value={formData.tipoContrato}
          />
          <Select
            value={formData.tipoContrato}
            onValueChange={(newValue) => handleSelectChange("tipoContrato", newValue)}
            name="tipoContrato"
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o Tipo de Contrato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLT">CLT</SelectItem>
              <SelectItem value="PJ">PJ - Pessoa Jurídica</SelectItem>
              <SelectItem value="TEMPORARIO">Temporário</SelectItem>
            </SelectContent>
          </Select>

          <label className="block text-sm font-medium text-gray-700">Início do Contrato:</label>
          <Input
            name="dataInicioContrato"
            value={formData.dataInicioContrato}
            onChange={handleChange}
            required
            type="date"
          />

          <label className="block text-sm font-medium text-gray-700">Término do Contrato (Opcional):</label>
          <Input
            name="dataFimContrato"
            value={formData.dataFimContrato || ""}
            onChange={handleChange}
            type="date"
          />

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Adicionar Professor"}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
}
