"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '~/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const AUTH_COOKIE_NAME = 'auth_session_user';

const LoginSchema = z.object({
    email: z.string().email("Formato de email inválido."),
    password: z.string().min(1, "A senha é obrigatória."),
});

const RegisterSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
    email: z.string().email("Formato de email inválido."),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export async function loginUser(prevState: any, formData: FormData) {
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    };

    try {
        const cookieStore = await cookies();

        LoginSchema.parse(data);

        const user = await prisma.user.findUnique({
            where: { email: data.email },
            select: {
                id: true,
                email: true,
                nome: true,
                imagem: true,
                senhaHash: true,
                status: true,
                escolas: {
                    select: {
                        papel: true,
                        escolaId: true,
                    },
                    orderBy: { criadoEm: 'asc' },
                    take: 1,
                }
            },
        });

        if (!user || !(await bcrypt.compare(data.password, user.senhaHash))) {
            return { error: true, message: "Credenciais inválidas. Verifique seu e-mail e senha." };
        }

        const primeiraEscola = user.escolas[0];

        if (!primeiraEscola) {
            return { error: true, message: "Acesso negado. Usuário sem vínculo escolar ativo." };
        }
        if (user.status !== "ATIVO") {
            return {
                error: true,
                message: `Acesso negado. Usuário ${user.status.toLowerCase()}.`
            };
        }
        const userSession = {
            id: user.id,
            nome: user.nome,
            email: user.email,
            imagem: user.imagem,
            role: primeiraEscola.papel,
            escolaId: primeiraEscola.escolaId,
        };

        cookieStore.set(
            AUTH_COOKIE_NAME,
            JSON.stringify(userSession),
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24 * 7,
                path: "/",
            }
        );

        redirect("/dashboard");

    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: true, message: "Verifique os campos", fieldErrors: error.flatten().fieldErrors };
        }

        if (typeof error === 'object' && error !== null && 'digest' in error && typeof error.digest === 'string' && error.digest.includes('NEXT_REDIRECT')) {
            throw error;
        }

        console.error("Erro desconhecido no login:", error);
        return { error: true, message: "Erro interno do servidor ao tentar fazer login." };
    }
}

export async function registerUser(prevState: any, formData: FormData) {
    const data = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    };

    try {
        RegisterSchema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: true, message: "Erro de validação", fieldErrors: error.flatten().fieldErrors };
        }
        return { error: true, message: "Ocorreu um erro desconhecido." };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
        const newUser = await prisma.user.create({
            data: {
                nome: data.name,
                email: data.email,
                senhaHash: hashedPassword,
            },
        });

        console.log(`Novo usuário cadastrado com sucesso: ${newUser.email}`);

        redirect(`/dashboard`);

    } catch (error: any) {
        if (typeof error === 'object' && error !== null && 'digest' in error && typeof error.digest === 'string' && error.digest.includes('NEXT_REDIRECT')) {
            throw error;
        }

        if (error.code === 'P2002' && error.meta?.target.includes('email')) {
            return { error: true, message: "Este e-mail já está em uso. Tente outro ou faça login." };
        }
        console.error("Erro ao cadastrar usuário:", error);
        return { error: true, message: "Erro interno do servidor ao tentar cadastrar." };
    }
}

export async function logoutUser() {
    try {
        const cookieStore = await cookies();

        cookieStore.delete(AUTH_COOKIE_NAME);
    } catch (error) {
        console.error("Erro ao remover cookie de sessão:", error);
        return { success: false, message: "Falha ao limpar sessão." };
    }

    return { success: true };
}

export async function getUserFromCookie() {
    const cookie = (await cookies()).get(AUTH_COOKIE_NAME);
    if (!cookie) return null;

    try {
        return JSON.parse(cookie.value);
    } catch {
        return null;
    }
}