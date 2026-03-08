"use client";

import { Calendar, AlertTriangle, Info, Bell, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AlertaProps {
  alertas: {
    id: string;
    titulo: string;
    mensagem: string;
    tipo: "INFO" | "AVISO" | "URGENTE";
  }[];
}

export function AlertasDashboard({ alertas }: AlertaProps) {
  const styles = {
    URGENTE: {
      container: "border-rose-200 bg-rose-50/30 dark:bg-rose-950/20",
      iconContainer: "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400",
      badge: "bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/20",
      glow: "bg-rose-500/10",
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    AVISO: {
      container: "border-amber-200 bg-amber-50/30 dark:bg-amber-950/20",
      iconContainer: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
      badge: "bg-amber-500 text-white shadow-lg shadow-amber-200 dark:shadow-amber-900/20",
      glow: "bg-amber-500/10",
      icon: <Calendar className="w-5 h-5" />,
    },
    INFO: {
      container: "border-sky-200 bg-sky-50/30 dark:bg-sky-950/20",
      iconContainer: "bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400",
      badge: "bg-sky-600 text-white shadow-lg shadow-sky-200 dark:shadow-sky-900/20",
      glow: "bg-sky-500/10",
      icon: <Info className="w-5 h-5" />,
    },
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-none">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">Central de Notificações</CardTitle>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Comunicados Importantes</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 relative">
        <AnimatePresence mode="popLayout">
          {alertas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 p-12 text-center"
            >
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">Tudo em ordem!</p>
              <p className="text-sm text-muted-foreground max-w-[240px] mx-auto mt-2">
                Não há alertas ou notificações pendentes no momento.
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {alertas.map((alerta, index) => {
                const style = styles[alerta.tipo];

                return (
                  <motion.div
                    key={alerta.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className={cn(
                      "group relative flex gap-5 rounded-2xl border-2 p-5 transition-all duration-300",
                      style.container,
                      "hover:shadow-xl hover:shadow-gray-200/40 dark:hover:shadow-none"
                    )}
                  >
                    {/* Visual Accent */}
                    <div className={cn("absolute inset-y-0 left-0 w-1.5 rounded-l-full",
                      alerta.tipo === 'URGENTE' ? 'bg-rose-500' :
                        alerta.tipo === 'AVISO' ? 'bg-amber-500' : 'bg-sky-500'
                    )} />

                    <div className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-inner",
                      style.iconContainer
                    )}>
                      {style.icon}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                            {alerta.titulo}
                          </h4>
                          <span className={cn(
                            "rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter",
                            style.badge
                          )}>
                            {alerta.tipo}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                          Notificação
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                        {alerta.mensagem}
                      </p>
                    </div>

                    <div className={cn(
                      "pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition group-hover:opacity-100",
                      style.glow
                    )} />
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
