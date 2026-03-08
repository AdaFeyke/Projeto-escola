"use server";

import { revalidatePath } from "next/cache";
import { EventoService } from "~/services/events/event.service";
import { checkAdminPermissionReturnAction, getCurrentEscolaId } from "~/config/permission-manager";
import { Prisma } from "@prisma/client";
import { type ActionResponse, Action } from "~/services/form/ActionResponse.types";

export async function createEventoAction(
  prevState: ActionResponse,
  formData: FormData
) {
  try {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;  

    const escolaId = await getCurrentEscolaId();

    await EventoService.create(escolaId, {
      nome: formData.get("nome") as string,
      descricao: formData.get("descricao") as string,
      dataEvento: new Date(formData.get("dataEvento") as string),
      local: formData.get("local") as string,
      valor: new Prisma.Decimal((formData.get("valor") as string) || "0"),
      vagas: formData.get("vagas")
        ? Number(formData.get("vagas"))
        : undefined,
      dataLimite: formData.get("dataLimite")
        ? new Date(formData.get("dataLimite") as string)
        : null,
    });

    revalidatePath("/dashboard/eventos");
    return Action.success("Evento criado com sucesso.");
  } catch (error: any) {
    return Action.error(error.message);
  }
}

export async function updateEventoAction(
  prevState: ActionResponse,
  formData: FormData
) {
  try {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;  
    
    await EventoService.update({
      id: formData.get("eventoId") as string,
      nome: formData.get("nome") as string,
      descricao: formData.get("descricao") as string,
      dataEvento: new Date(formData.get("dataEvento") as string),
      local: formData.get("local") as string,
      valor: new Prisma.Decimal((formData.get("valor") as string) || "0"),
      vagas: formData.get("vagas")
        ? Number(formData.get("vagas"))
        : undefined,
      dataLimite: formData.get("dataLimite")
        ? new Date(formData.get("dataLimite") as string)
        : null,
    });

    revalidatePath("/dashboard/eventos");
    return Action.success("Evento atualizado com sucesso.");
  } catch (error: any) {
    return Action.error(error.message);
  }
}

export async function deleteEventoAction(formData: FormData) {
  try {
    const authError = await checkAdminPermissionReturnAction();
    if (authError) return authError;  
    
    await EventoService.delete(formData.get("eventoId") as string);
    revalidatePath("/dashboard/eventos");
    return Action.success("Evento removido.");
  } catch (error: any) {
    return Action.error(error.message);
  }
}
