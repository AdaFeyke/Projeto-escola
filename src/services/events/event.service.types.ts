
export interface EventoCreateInput {
  nome: string;
  descricao?: string;
  dataEvento: Date | string;
  local?: string;
  valor: number | any;
  vagas?: number;
  dataLimite?: Date | string | null;
}

export interface EventoUpdateInput extends EventoCreateInput {
  id: string;
}

export interface EventoDetailed {
  id: string;
  nome: string;
  descricao?: string | null;
  dataEvento: Date | string;
  local?: string | null;
  valor: number | any;
  vagas?: number | null;
  dataLimite?: Date | string | null;
  criadoEm: Date | string;
  participantes: any;

  participantesCount: number;
}


export type ActionResponse = {
  success: boolean;
  message: string;
  timestamp?: number;
};