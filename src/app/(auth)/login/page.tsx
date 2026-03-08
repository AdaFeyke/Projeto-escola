"use client";

import React, { useRef } from 'react';
import { motion, } from 'framer-motion';
import LoginForm from '~/components/auth/LoginForm';
import { School, } from 'lucide-react';

export default function LoginPage() {
    const constraintsRef = useRef(null);

    const letters = [
        { char: "D", color: "from-sky-300 via-blue-400 to-blue-500", delay: 0.1, x: -240, y: 30, rotate: 1 },
        { char: "O", color: "from-pink-300 via-rose-400 to-rose-500", delay: 0.2, x: -80, y: 50, rotate: 6 },
        { char: "C", color: "from-amber-200 via-yellow-300 to-yellow-400", delay: 0.3, x: 80, y: 40, rotate: 4 },
        { char: "E", color: "from-emerald-400 via-green-500 to-green-700", delay: 0.4, x: 240, y: 20, rotate: 1 },
    ];
    return (
        <div className="grid lg:grid-cols-2 min-h-screen w-full overflow-hidden bg-white font-sans">
            <div
                ref={constraintsRef}
                className="hidden lg:flex flex-col items-center justify-center relative bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-slate-50 via-white to-blue-50 overflow-hidden select-none"
            >
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-300/50 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/50 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-20 text-center space-y-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm"
                    >
                        <School className="w-4 h-4 text-slate-600" />
                        <span className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase">Gestão Escolar</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-7xl font-black text-primary mb-4 tracking-tighter"
                    >
                        <span className="text-pink-600 text-6xl">
                            Escola
                        </span>
                        {' '}
                        <span className="text-blue-400">
                            Algodão
                        </span>
                    </motion.h2>
                </div>

                <div className="relative h-[400px] w-full flex items-center justify-center z-20">
                    {letters.map((item, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.1 }}
                            initial={{ y: 400, opacity: 0 }}
                            animate={{
                                x: item.x,
                                y: item.y,
                                rotate: item.rotate,
                                opacity: 1,
                                transition: {
                                    type: "spring",
                                    stiffness: 80,
                                    damping: 15,
                                    delay: item.delay + 0.5
                                }
                            }}
                            className={`
                                absolute 
                                w-1/4 md:w-1/5 lg:w-36 
                                aspect-square
                                flex items-center justify-center 
                                rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.1)] 
                                bg-gradient-to-br ${item.color}
                                cursor-grab active:cursor-grabbing
                            `}
                        >
                            <div className="absolute inset-2 bg-gradient-to-br from-white/30 to-transparent rounded-[0.4rem] pointer-events-none" />
                            <span className="text-white text-[clamp(2rem,10vw,5rem)] font-black drop-shadow-md">
                                {item.char}
                            </span>
                        </motion.div>
                    ))}
                </div>
                    <span className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase">A doce maneira de aprender</span>


            </div>

            {/* COLUNA 2: FORMULÁRIO MINIMALISTA E CHIC */}
            <div className="flex items-center justify-center p-8 lg:p-24 relative bg-white">
                <div className="w-full max-w-sm space-y-8">

                    <div className="lg:hidden flex flex-col items-center mb-12">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-4">
                            <School className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800">Algodão Doce</h1>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Bem-vindo de volta</h3>
                        <p className="text-slate-500 font-medium">Insira suas credenciais para acessar o painel.</p>
                    </div>

                    <div className="mt-8">
                        <LoginForm />
                    </div>

                    <footer className="pt-12 flex flex-col gap-4">
                        <div className="h-[1px] w-full bg-slate-100" />
                        <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 uppercase tracking-widest justify-center">
                            <span>© 2026 Algodão Doce</span>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}