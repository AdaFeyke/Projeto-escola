"use client";

import { useActionState, useTransition, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { loginUser } from "~/services/auth/auth.service";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

import { AlertCircle, Loader2, LogIn } from "lucide-react";

const initialState = {
    error: false,
    message: "",
    fieldErrors: {} as Record<string, string[] | undefined>,
};

export default function LoginForm() {
    const [state, formAction] = useActionState(loginUser, initialState);
    const [isPending, startTransition] = useTransition();
    const [isLocalLoading, setIsLocalLoading] = useState(false);

    const isLoading = isPending || isLocalLoading;

    const getError = (fieldName: string) => state.fieldErrors?.[fieldName]?.[0];

    const handleSubmit = async (formData: FormData) => {
        setIsLocalLoading(true);

        startTransition(async () => {
            const result = (await formAction(formData)) as unknown as { error?: string } | null;

            if (result?.error) {
                setIsLocalLoading(false);
            }
        });
    };

    if (state.error && isLocalLoading) {
        setIsLocalLoading(false);
    }

    return (
        <form
            action={handleSubmit}
            className="space-y-6 p-6 rounded-xl bg-card text-card-foreground"
        >
            {/* ERRO GLOBAL */}
            <AnimatePresence>
                {state.error && state.message && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-2 text-sm p-3 rounded-lg border border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300"
                    >
                        <AlertCircle className="h-5 w-5" />
                        <span>{state.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" name="email" placeholder="nome@email.com" required />
                {getError("email") && (<p className="mt-1 text-xs text-red-500">{getError("email")}</p>)}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input type="password" id="password" name="password" placeholder="••••••••" required />
                {getError("password") && (<p className="mt-1 text-xs text-red-500">{getError("password")}</p>)}
            </div>

            <Button
                type="submit"
                className="w-full h-11 flex items-center justify-center gap-2 relative overflow-hidden"
                disabled={isLoading}
            >
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.span
                            key="loading"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex items-center gap-2"
                        >
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Autenticando...
                        </motion.span>
                    ) : (
                        <motion.span
                            key="default"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-2"
                        >
                            <LogIn className="h-5 w-5" />
                            Entrar
                        </motion.span>
                    )}
                </AnimatePresence>
            </Button>

            <div className="text-center">
                <a
                    href="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    Esqueceu sua senha?
                </a>
            </div>
        </form>
    );
}