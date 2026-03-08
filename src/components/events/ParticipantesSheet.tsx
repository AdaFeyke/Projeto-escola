import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Badge } from "~/components/ui/badge";
import { Search, UserCheck, CreditCard } from "lucide-react";
import { Input } from "~/components/ui/input";

interface Participante {
  nome: string;
  imagem?: string;
  turma: string;
  matricula?: string;
  idade?: number | null;
  pago: boolean;
  confirmado: boolean;
}
interface Props {
  isOpen: boolean;
  onClose: () => void;
  eventoNome: string;
  participantes: Participante[];
}

export function ParticipantesSheet({ isOpen, onClose, eventoNome, participantes }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const participantesFiltrados = participantes?.filter((aluno) =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.turma.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l-primary/10">
        <SheetHeader className="p-6 bg-primary/[0.02] border-b">
          <SheetTitle className="text-2xl font-black text-slate-900 leading-tight">
            Lista de Presença
          </SheetTitle>
          <SheetDescription className="font-medium text-primary flex items-center gap-2">
            {eventoNome}
            <Badge variant="outline" className="rounded-full border-primary/20 text-[10px]">
              {participantes?.length} Alunos
            </Badge>
          </SheetDescription>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar aluno..."
              className="pl-10 rounded-xl border-slate-100 bg-white focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-2">
          <div className="p-4 space-y-3">
            {participantesFiltrados.map((aluno, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm ">
                    <AvatarImage src={aluno.imagem} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {aluno.nome.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                      {aluno.nome}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold tracking-tight">
                        {aluno.matricula || "####"}
                      </span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tighter">
                        {aluno.turma || "Turma n/d"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  {aluno.pago ? (
                    <div className="p-2 bg-green-50 rounded-full text-green-500" title="Pagamento Confirmado">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  ) : aluno.confirmado ? (
                    <Badge variant="destructive" className="text-[10px] text-blue-500 font-bold bg-blue-50 border-none shadow-none">
                      <CreditCard className="w-4 h-4" />

                      Aguardando Pagamento
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px] text-orange-500 font-bold bg-orange-50 border-none shadow-none">
                      Aguardando Confirmação
                    </Badge>
                  )}
                </div>
              </div>
            ))}

            {participantesFiltrados.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-10">
                Nenhum aluno encontrado.
              </p>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-slate-50/50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resumo</span>
            <span className="text-xs font-black text-slate-900">
              {participantes?.filter(p => p.pago).length} de {participantes?.length} pagos
            </span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(participantes?.filter(p => p.pago).length / (participantes?.length || 1)) * 100}%` }}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}