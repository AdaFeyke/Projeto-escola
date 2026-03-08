import { getUserFromCookie } from "~/services/auth/auth.service"; 
import prisma from "~/lib/prisma";
import { redirect } from 'next/navigation';

type PapelUsuario = 'ADMINISTRADOR' | 'PROFESSOR' | 'ALUNO'; 

interface AuthSession {
    id: string;
    nome: string;
    email: string;
    role: PapelUsuario;
    escolaId: string;
}

/**
 * Busca a sessão do usuário no cookie e garante que o papel (role) é válido.
 * Redireciona para /login se não houver sessão.
 * * @returns {Promise<AuthSession>} A sessão autenticada.
 */
export async function getAuthenticatedSession(): Promise<AuthSession> {
    // Tenta obter a sessão do cookie (que deve incluir role e escolaId)
    const session = await getUserFromCookie() as AuthSession | null; 

    if (!session) {
        console.log("Sessão não encontrada. Redirecionando para login.");
        redirect('/login');
    }
    
    // 🚨 Validação essencial: O layout já faz a maioria disso, mas é bom garantir.
    if (!session.id || !session.role || !session.escolaId) {
         console.log("Dados da sessão incompletos. Redirecionando para login.");
         redirect('/login');
    }

    return session;
}


/**
 * Verifica se a sessão do usuário possui a permissão necessária.
 * * @param allowedRoles Lista de papéis permitidos.
 * @returns A sessão autenticada.
 */
export async function enforceUserPermissions(allowedRoles: PapelUsuario[]): Promise<AuthSession> {
    const session = await getAuthenticatedSession();
    
    // Verifica se o papel do usuário está na lista de papéis permitidos
    if (!allowedRoles.includes(session.role)) {
        console.log(`Acesso negado: Usuário ${session.id} com papel ${session.role} tentou acessar rota restrita.`);
        // Redireciona para uma página de "Acesso Negado"
        redirect('/dashboard/unauthorized'); 
    }

    return session;
}