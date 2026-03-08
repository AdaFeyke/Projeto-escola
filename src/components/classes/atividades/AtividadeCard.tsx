import { Calendar, MoreVertical, Pencil, Trash2, GraduationCap, CheckCircle2, FileText, BarChart3, ArrowRight, ArrowRightCircle, Edit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { AlunosSheet } from "./AlunosSheet";

interface Aluno {
  id: string;
  nome: string;
  imagem?: string | null;
  matricula: string;
}

interface AtividadeProps {
  atv: any,
  alunos: Aluno[],
  usuarioId: string;
  onEdit?: (atv: any) => void;
  onDelete?: (id: string) => void;
}

const getTipoIcon = (tipo: string) => {
  switch (tipo) {
    case "PROVA": return <FileText className="w-4 h-4" />;
    case "SEMINARIO": return <BarChart3 className="w-4 h-4" />;
    default: return <Calendar className="w-4 h-4" />;
  }
};

export function AtividadeCard({ atv, alunos, usuarioId, onEdit, onDelete }: AtividadeProps) {
  const [showAlunos, setShowAlunos] = useState(false);

  return (
    <div className="group bg-white border rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 **h-fit** p-5">
      <div className="flex items-start justify-between relative z-10">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 aspect-square items-center justify-center rounded-2xl bg-slate-50 text-slate-500 ring-1 ring-slate-100 transition-all  group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30">
            {getTipoIcon(atv.tipo)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="secondary" className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-none ">
                {atv.tipo}
              </Badge>
              {atv.notas?.length > 0 && (
                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> AVALIADO
                </Badge>
              )}
            </div>
            <h4 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">
              {atv.titulo}
            </h4>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">
              {atv.descricao || "Sem descrição adicional"}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit?.(atv)}
            className="rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10"
          >
            <Edit className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete?.(atv.id)}
            className="rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-4">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tight">Data</span>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            {format(new Date(atv.data), "dd 'de' MMMM", { locale: ptBR })}
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tight">Valor</span>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
            {atv.valorMaximo.toFixed(1)} pts
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAlunos(true)}
          className="
              text-primary font-semibold
              hover:bg-primary/10
              rounded-xl px-3
            "
        >
          Lançar Notas <ArrowRightCircle className="w-3 h-3 ml-1" />
        </Button>
        <AlunosSheet
          isOpen={showAlunos}
          onClose={() => setShowAlunos(false)}
          atv={atv}
          alunos={alunos}
          usuarioId={usuarioId}
        />
      </div>
    </div >
  );
}