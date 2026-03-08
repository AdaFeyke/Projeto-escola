"use client";

import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

import {
  GraduationCap,
  Fingerprint,
  Layers,
  Cake,
  ExternalLink,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { useMemo } from "react";

interface Aluno {
  id: string;
  matricula: string;
  nome: string;
  email: string;
  serie: string;
  imagem?: string | null;
  status: "ATIVO" | "INATIVO" | "PENDENTE";
  dataNascimento: string;
}

interface AlunoCardProps {
  aluno: Aluno;
  onClick?: (id: string) => void;
}

export function AlunoCard({ aluno, onClick }: AlunoCardProps) {
  const initials = useMemo(() => {
    return aluno.nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [aluno.nome]);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg border-slate-200 py-0",
        onClick && "cursor-pointer"
      )}
      onClick={() => onClick?.(aluno.id)}
    >
      <div className="relative flex items-center justify-end p-5 pb-2">
        <div className="flex gap-2">
          <GraduationCap className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
          {onClick && <ExternalLink className="h-3 w-3 text-slate-300" />}
        </div>
      </div>

      <CardContent className="relative space-y-5 px-5 pb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-white shadow-sm ring-2 ring-slate-100 transition-all group-hover:ring-primary/30">
              <AvatarImage src={aluno.imagem ?? ""} alt={aluno.nome} className="object-cover" />
              <AvatarFallback className="bg-slate-100 text-slate-600 font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-md ring-2 ring-white">
              <GraduationCap className="h-3 w-3" />
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-primary transition-colors" title={aluno.nome}>
              {aluno.nome}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Cake className="h-3.5 w-3.5 shrink-0" />
              <span className="text-slate-700">{aluno.dataNascimento}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoItem
            icon={<Fingerprint className="h-3.5 w-3.5" />}
            label="Matrícula"
            value={aluno.matricula}
          />
          <InfoItem
            icon={<Layers className="h-3.5 w-3.5" />}
            label="Série"
            value={aluno.serie}
          />
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 transition-colors group-hover:bg-white group-hover:border-primary/10">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight text-slate-400">
        <span className="text-primary/60">{icon}</span>
        {label}
      </div>
      <p className="truncate text-xs font-bold text-slate-700">{value}</p>
    </div>
  );
}