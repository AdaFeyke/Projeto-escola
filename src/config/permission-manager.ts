import { redirect } from 'next/navigation';
import { getUserFromCookie } from '~/services/auth/auth.service';
import { ROUTE_PERMISSIONS, type PapelUsuario } from '~/config/route-permissions';
import { Action } from '~/services/form/ActionResponse.types';

interface AuthSession {
    id: string;
    nome: string;
    email: string;
    imagem: string;
    role: PapelUsuario;
    escolaId: string;
}

export async function authorizeUser(pathname: string): Promise<AuthSession> {
    const session = await getUserFromCookie() as AuthSession | null;

    if (!session || !session.id || !session.role) {
        console.log(`[AUTH] Sessão não encontrada ou inválida para ${pathname}. Redirecionando para login.`);
        redirect('/login');
    }
    const allowedRoles = ROUTE_PERMISSIONS[pathname] || ROUTE_PERMISSIONS[pathname.replace(/\/$/, '')];

    if (!allowedRoles) {
        console.log(`[AUTH] Rota ${pathname} não mapeada. Acesso concedido por padrão (logado).`);
        return session;
    }

    if (!allowedRoles.includes(session.role)) {
        console.log(`[AUTH] Acesso negado: Usuário ${session.id} (${session.role}) tentou acessar ${pathname}.`);
        redirect('/dashboard/unauthorized');
    }

    console.log(`[AUTH] Acesso permitido: Usuário ${session.id} (${session.role}) em ${pathname}.`);
    return session;
}

export async function getCurrentEscolaId(): Promise<string> {
    const { escolaId } = await getUserFromCookie();
    return escolaId;
}

export async function getUserSession(): Promise<AuthSession> {
    const session = await getUserFromCookie() as AuthSession | null;

    if (!session || !session.id || !session.role) {
        redirect('/login');
    }
    return await getUserFromCookie() as AuthSession;
}

export async function checkAdminPermissionReturnAction() {
    const { role } = await getUserSession();
    
    if (role !== 'ADMINISTRADOR') {
        return Action.error("Acesso negado: Você não tem permissão de administrador.");
    }
    return null; 
}

