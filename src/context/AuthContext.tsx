"use client";

import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode, Dispatch, SetStateAction} from 'react'
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import type { User } from "~/types/user";
import { logoutUser } from '~/services/auth/auth.service';

const AUTH_COOKIE_NAME = 'auth_session_user';

export interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isAuthReady: boolean;
    logout: (tenantSlug: string) => Promise<void>;
    setUser: Dispatch<SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const isLoggedIn = !!user;
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            const userJson = Cookies.get(AUTH_COOKIE_NAME);

            if (userJson) {
                try {
                    const parsedUser: User = JSON.parse(userJson);
                    setUser(parsedUser);
                } catch (e) {
                    Cookies.remove(AUTH_COOKIE_NAME);
                    setUser(null);
                    console.error("Erro ao analisar dados do usuário no cookie:", e);
                }
            } else {
                setUser(null);
            }

            setIsAuthReady(true);
            router.push('/dashboard');
        };

        checkAuth();
    }, [router]);

    const logout = async (tenantSlug: string) => {
        try {
            await logoutUser();
            Cookies.remove(AUTH_COOKIE_NAME);
            setUser(null);
            const redirectPath = tenantSlug ? `/${tenantSlug}` : '/';
            window.location.href = redirectPath;
        } catch (e) {
            console.error("Erro ao fazer logout:", e);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn,
                logout,
                setUser,
                isAuthReady,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
