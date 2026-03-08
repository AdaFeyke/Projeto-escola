"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface WelcomeHeaderProps {
    userName: string;
}

export function WelcomeHeader({ userName }: WelcomeHeaderProps) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [greeting, setGreeting] = useState("");

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        const hour = currentTime.getHours();
        if (hour < 12) setGreeting("Bom dia");
        else if (hour < 18) setGreeting("Boa tarde");
        else setGreeting("Boa noite");
        return () => clearInterval(timer);
    }, [currentTime]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-primary text-white mb-6 md:mb-10 group"
        >
            <div className="relative p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
                <div className="space-y-3 md:space-y-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter leading-tight md:leading-none">
                            {greeting}, <br />
                            {userName.split(' ')[0]}!
                        </h1>
                    </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t border-white/10 pt-6 md:pt-0 md:border-0">
                    <div className="flex flex-col md:items-end">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 md:hidden text-white/60" />
                            <span className="text-4xl md:text-7xl font-black tracking-tighter tabular-nums leading-none">
                                {format(currentTime, "HH:mm")}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 px-4 py-2 md:px-5 md:py-3 rounded-xl md:rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md">
                        <CalendarIcon className="w-4 h-4 md:w-5 md:h-5 text-white/80" />
                        <span className="text-xs md:text-base font-bold whitespace-nowrap capitalize">
                            {format(currentTime, "eee, dd 'de' MMM", { locale: ptBR })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </motion.div>
    );
}