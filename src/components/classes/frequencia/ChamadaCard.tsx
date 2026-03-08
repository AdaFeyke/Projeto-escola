"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Check, X, Clock, RotateCcw, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

type StatusPresenca = "PRESENTE" | "AUSENTE" | "ATRASO";

interface Aluno {
  id: string;
  nome: string;
  imagem?: string | null;
  matricula: string;
}

interface TinderChamadaProps {
  alunos: Aluno[];
  onFinish: (data: Record<string, StatusPresenca>) => void;
  onClose?: () => void;
}

export function ChamadaCard({ alunos = [], onFinish, onClose }: TinderChamadaProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, StatusPresenca>>({});

  // Proteção: Se a lista estiver vazia, fecha o modal ou avisa
  if (alunos.length === 0) {
    onClose?.();
    return null;
  }

  const alunoAtual = alunos[currentIndex];
  const x = useMotionValue(0);
  
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0, 1, 1, 1, 0]);

  const handleSwipe = (status: StatusPresenca) => {
    if (!alunoAtual) return;
    
    const novasRespostas = { ...respostas, [alunoAtual.id]: status };
    setRespostas(novasRespostas);

    if (currentIndex < alunos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Importante: Passamos os dados finais e encerramos
      onFinish(novasRespostas);
    }
    x.set(0); 
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50/80 backdrop-blur-md flex items-center justify-center p-4">
      {/* Botão Fechar */}
      <button onClick={onClose} className="absolute top-6 right-6 z-[110] p-3 bg-white shadow-xl rounded-full hover:scale-110">
        <XCircle className="w-6 h-6 text-slate-400" />
      </button>

      <div className="relative w-full max-w-sm h-[550px]">
        <AnimatePresence mode="popLayout">
          {/* O SEGREDO: Só renderiza se alunoAtual existir */}
          {alunoAtual && (
            <motion.div
              key={alunoAtual.id}
              style={{ x, rotate, opacity }}
              drag="x" 
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 120) handleSwipe("PRESENTE");
                else if (info.offset.x < -120) handleSwipe("AUSENTE");
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ 
                x: x.get() > 0 ? 500 : x.get() < 0 ? -500 : 0, 
                opacity: 0, 
                transition: { duration: 0.3 } 
              }}
              className="will-change-transform absolute inset-0 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col items-center justify-between p-8 touch-none"
            >
              {/* Feedbacks de Cores (CSS Inline para performance) */}
              <motion.div 
                style={{ opacity: useTransform(x, [20, 100], [0, 1]) }} 
                className="absolute inset-0 bg-green-500/10 pointer-events-none rounded-[2.5rem]" 
              />
              <motion.div 
                style={{ opacity: useTransform(x, [-20, -100], [0, 1]) }} 
                className="absolute inset-0 bg-red-500/10 pointer-events-none rounded-[2.5rem]" 
              />

              {/* Avatar e Info */}
              <div className="flex flex-col items-center text-center space-y-6 mt-4 pointer-events-none">
                <Avatar className="h-40 w-40 border-8 border-slate-50 shadow-inner">
                  <AvatarImage src={alunoAtual.imagem ?? ""} className="object-cover" />
                  <AvatarFallback className="text-4xl font-black bg-slate-100 text-slate-300">
                    {alunoAtual.nome[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">
                    {alunoAtual.nome}
                  </h2>
                  <p className="text-slate-400 font-mono text-xs mt-1 uppercase tracking-widest">
                    {alunoAtual.matricula}
                  </p>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 w-full justify-center items-center relative z-20">
                <button onClick={() => handleSwipe("AUSENTE")} className="p-5 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90">
                  <X className="w-8 h-8 stroke-[3px]" />
                </button>
                <button onClick={() => handleSwipe("ATRASO")} className="p-4 rounded-full bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white transition-all active:scale-90">
                  <Clock className="w-6 h-6 stroke-[3px]" />
                </button>
                <button onClick={() => handleSwipe("PRESENTE")} className="p-5 rounded-full bg-green-500 text-white shadow-lg shadow-green-200 hover:scale-105 active:scale-90 transition-all">
                  <Check className="w-8 h-8 stroke-[3px]" />
                </button>
              </div>

              {/* Progresso */}
              <div className="w-full space-y-2">
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <motion.div 
                    className="bg-primary h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / alunos.length) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">
                  Aluno {currentIndex + 1} de {alunos.length}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}