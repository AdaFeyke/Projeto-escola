import type { User } from '~/types/user'
  
export interface Aluno {
  usuario: User;

  id: string;
  matricula: string;
  usuarioId: string;

  dataNascimento: Date | null;
  endereco: string | null;
  anoTransferido: number | null;
  escolaTransferida: string | null;
  turmaId: string | null;

  turma: { nome: string } | null;
  notas: any[];
  frequencias: any[];
  turmaDisciplinas: any[];
  responsaveisAluno: any[];

  questionario: {
    pergunta: string;
    resposta: string;
    tipo: string | null;
  };

}


