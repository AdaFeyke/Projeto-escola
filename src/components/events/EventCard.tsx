import { useState } from "react";
import {
  Calendar,
  MapPin,
  Edit,
  Trash2,
  ArrowRight,
  Users
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

import type { EventoDetailed } from "~/services/events/event.service.types";
import { ParticipantesSheet } from "./ParticipantesSheet";
import { Accordion, AccordionItem } from "@radix-ui/react-accordion";

interface Props {
  evento: EventoDetailed;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function EventoCard({ evento, onEdit, onDelete, isDeleting }: Props) {
  const [showParticipantes, setShowParticipantes] = useState(false);
  const participantesPreview = evento.participantes.slice(0, 4) || [];

  return (
    <Accordion 
      type="single"
      collapsible
      className="group bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
    >
      <AccordionItem
        key={evento.id}
        value={evento.id}
      >
        <div className="p-7 flex flex-col h-full gap-6">
          <header className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h3 className="
              text-2xl font-black tracking-tight text-slate-900
              group-hover:text-primary transition-colors
            ">
                {evento.nome}
              </h3>
              {evento.descricao && (
                <p
                  className="
                    text-sm text-slate-500 leading-relaxed
                    line-clamp-2
                  "
                >
                  {evento.descricao}
                </p>
              )}

              <div className="flex items-center gap-2">
                <Badge
                  className="bg-primary/10 text-primary border-none font-bold px-3 py-1 rounded-full shrink-0"
                >
                  {Number(evento.valor) > 0
                    ? `R$ ${Number(evento.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : "Gratuito"}
                </Badge>

                {evento.vagas != 0 && (
                  <Badge
                    className="bg-slate-100 text-slate-600 border-none font-bold px-3 py-1 rounded-full shrink-0"
                  >
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span className="text-[11px]">
                        {evento.participantesCount} / {evento.vagas} vagas
                      </span>
                    </div>
                  </Badge>
                )}
              </div>
            </div>
          </header>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 text-xs font-semibold text-slate-600">
              <Calendar className="w-4 h-4 text-primary" />
              {new Date(evento.dataEvento).toLocaleDateString("pt-BR")}
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 text-xs font-semibold text-slate-600">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="truncate max-w-[140px]">
                {evento.local || "Escola"}
              </span>
            </div>
          </div>

          <div className="
          flex items-center justify-between
          bg-primary/[0.04]
          border border-primary/10
          rounded-2xl px-5 py-4
        ">
            <div className="flex items-center -space-x-3">
              {participantesPreview.map((p: any, i: number) => (
                <Avatar key={i} className="w-8 h-8 border-2 border-white shadow-sm">
                  <AvatarImage src={p?.imagem} className="object-cover" />
                  <AvatarFallback className="bg-primary text-white font-bold text-xs">
                    {p.nome.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}

              {evento.participantesCount > 4 && (
                <div className="
                w-8 h-8 rounded-full
                bg-white border-2 border-white
                text-xs font-black text-primary
                flex items-center justify-center
                shadow-sm
              ">
                  +{evento.participantesCount - 4}
                </div>
              )}
              {evento.participantesCount == 0 && (
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                  Aguardando participantes
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowParticipantes(true)}
              className="
              text-primary font-semibold
              hover:bg-primary/10
              rounded-xl px-3
            "
            >
              Ver lista <ArrowRight className="w-3 h-3 ml-1" />
            </Button>

            <ParticipantesSheet
              isOpen={showParticipantes}
              onClose={() => setShowParticipantes(false)}
              eventoNome={evento.nome}
              participantes={evento.participantes}
            />
          </div>

          <footer className="flex items-center justify-between pt-3">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10"
              >
                <Edit className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                disabled={isDeleting}
                className="rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <Button
              className="
              bg-primary hover:bg-primary/90
              text-white font-bold
              rounded-xl px-6 h-10
              transition-all active:scale-95
            "
            >
              Gerenciar
            </Button>
          </footer>
        </div>
      </AccordionItem>
    </Accordion>
  );
}
