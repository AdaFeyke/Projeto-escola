"use client";

import { Users } from "lucide-react";
import { PageHeader } from "../ui/PageHeader";

interface StudentsToolbarProps {
  isAdmin: boolean;
  onCreate: () => void;
}

export function StudentsToolbar({ isAdmin, onCreate }: StudentsToolbarProps) {
  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alunos"
        description="Gerencie seus alunos"
        iconElement={<Users className="w-7 h-7 md:w-8 md:h-8" />}
        backHref="/dashboard" 
        buttonLabel="Novo Aluno"
        onButtonClick={() => onCreate()}
      />
    </div>
  );
}
