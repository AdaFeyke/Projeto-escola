"use client";

import { createContext, useContext, useState, useMemo } from 'react';
import type { Escola, PapelUsuario } from '@prisma/client';

interface SchoolContextType {
  escolaAtiva: Escola | null;
  papelNaEscola: PapelUsuario | null;
  escolasDoUsuario: Escola[];
  selecionarEscola: (escola: Escola, papel: PapelUsuario) => void;
  isLoading: boolean;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

interface MultiSchoolProviderProps {
  escolas: Escola[];
  initialRole: PapelUsuario | null;
  children: React.ReactNode;
}

export const MultiSchoolProvider: React.FC<MultiSchoolProviderProps> = ({ escolas, initialRole, children }) => {
  const [escolaAtiva, setEscolaAtiva] = useState<Escola | null>(
    escolas.length === 1 ? (escolas[0] ?? null) : null
  );
  const [papelNaEscola, setPapelNaEscola] = useState<PapelUsuario | null>(initialRole);
  const [isLoading, setIsLoading] = useState(false);

  const selecionarEscola = (escola: Escola, papel: PapelUsuario) => {
    setIsLoading(true);
    setEscolaAtiva(escola);
    setPapelNaEscola(papel);
    setIsLoading(false);
  };

  const contextValue = useMemo(() => ({
    escolaAtiva,
    papelNaEscola,
    escolasDoUsuario: escolas,
    selecionarEscola,
    isLoading,
  }), [escolaAtiva, papelNaEscola, escolas, isLoading]);

  return (
    <SchoolContext.Provider value={contextValue}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchoolContext = () => {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchoolContext must be used within a MultiSchoolProvider');
  }
  return context;
};