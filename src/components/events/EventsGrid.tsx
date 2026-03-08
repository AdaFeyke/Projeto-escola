"use client";

import { useState, useTransition } from "react";
import { Plus, Sparkles, Search, CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { EventoCard } from "./EventCard";
import { EventoFormModal } from "./EventFormModal";
import { Input } from "~/components/ui/input";

import type {
  EventoDetailed,
  ActionResponse,
} from "~/services/events/event.service.types";
import { PageHeader } from "../ui/PageHeader";
import { EventsStatsCards } from "./EventsStatsCards";

interface EventsGridProps {
  eventos: any[];
  createAction: any;
  updateAction: any;
  deleteAction: (formData: FormData) => Promise<ActionResponse>;
  role: string;
  stats: any;
}

export function EventsGrid({
  eventos,
  createAction,
  updateAction,
  deleteAction,
  role,
  stats,
}: EventsGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<EventoDetailed | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const filteredEventos = eventos.filter(e =>
    e.nome.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingEvento(null);
    setIsModalOpen(true);
  };

  const openEdit = (evento: any) => {
    setEditingEvento(evento);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvento(null);
  };

  const handleDelete = (evento: any) => {
    if (!confirm(`Deseja excluir o evento "${evento.nome}"?`)) return;

    startDeleteTransition(async () => {
      const formData = new FormData();
      formData.append("eventoId", evento.id);
      const result = await deleteAction(formData);

      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Eventos"
        description="Organize seus eventos e convide alunos para participar"
        iconElement={<CalendarIcon className="w-7 h-7 md:w-8 md:h-8" />}
        backHref="/dashboard"
        buttonLabel="Novo Evento"
        showButton={role === 'ADMINISTRADOR'}
        onButtonClick={openCreate}
      />

      {role === 'ADMINISTRADOR' && (
        <>
          <EventsStatsCards stats={stats} />
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="relative w-full sm:max-w-xs">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors`} />
              <Input
                placeholder="Buscar por nome"
                className="pl-10 h-12 rounded-2xl border-1 border-slate-200 shadow-sm focus-visible:ring-primary focus-visible:border-primary transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      {filteredEventos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <Sparkles className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">Nenhum evento encontrado</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredEventos.map((evento) => (
            <EventoCard
              key={evento.id}
              evento={evento}
              onEdit={() => openEdit(evento)}
              onDelete={() => handleDelete(evento)}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}

      <EventoFormModal
        evento={editingEvento}
        action={editingEvento ? updateAction : createAction}
        onClose={closeModal}
        open={isModalOpen}
        isLoadingData={isLoading}
      />
    </div>
  );
}