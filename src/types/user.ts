export interface User {
  id: string;
  nome: string | null;
  email: string;
  emailVerificado: Date | null;
  imagem: string | null;
  dataHoraCadastro: Date;
  senhaHash: string;
  status: 'ATIVO' | 'INATIVO' | 'SUSPENSO'; 
  deletedAt: Date | null;
}