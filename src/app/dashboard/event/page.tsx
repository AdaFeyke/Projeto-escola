import { EventoService } from "~/services/events/event.service";
import { createEventoAction, updateEventoAction, deleteEventoAction } from "~/actions/event/event.actions";
import { getCurrentEscolaId } from "~/config/permission-manager";
import { EventsGrid } from "~/components/events/EventsGrid";

import { authorizeUser } from "~/config/permission-manager";

export default async function EventosPage() {
    const user = await authorizeUser('dashboard/event');
    const escolaId = await getCurrentEscolaId();
    const eventos = await EventoService.listByEscola(escolaId);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() + 30);
    dataLimite.setHours(23, 59, 59, 999);

    const stats = {
        totalEventos: eventos.length,
        proximosEventos: eventos.filter(e => {
            if (!e.dataEvento) return false;
            const dataEv = new Date(e.dataEvento);
            return dataEv >= hoje && dataEv <= dataLimite;
        }).length,
        totalInscritos: eventos.reduce((acc, curr) => acc + (curr.participantesCount || 0), 0),
        arrecadacaoReal: eventos.reduce((acc, curr) => {
            const pagos = curr.participantes.filter(p => p.pago).length;
            return acc + (Number(curr.valor) * pagos);
        }, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    };
    return (
        <>
            <EventsGrid
                eventos={eventos}
                createAction={createEventoAction}
                updateAction={updateEventoAction}
                deleteAction={deleteEventoAction} 
                role={user?.role}
                stats={stats}/>
        </>

    );
}