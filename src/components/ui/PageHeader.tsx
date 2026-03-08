"use client";

import React, { type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";

interface PageHeaderProps {
  title: ReactNode;
  description?: string;
  iconElement?: ReactNode; 
  backHref?: string;
  
  buttonLabel?: string;
  onButtonClick?: () => void;
  showButton?: boolean;
  
  isPending?: boolean;
  children?: ReactNode; 
  action?: ReactNode;   
}

export function PageHeader({
  title,
  description,
  iconElement,
  backHref,
  buttonLabel,
  onButtonClick,
  showButton = true,
  isPending,
  children,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all">
      
      <div className="flex items-center gap-4 md:gap-5">
        {backHref && (
          <Link href={backHref} className="group">
            <Button
              variant="ghost"
              size="icon"
              className="relative shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-xl bg-slate-50 border border-slate-200 shadow-sm transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary active:scale-90"
            >
              <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
            </Button>
          </Link>
        )}

        {iconElement && (
          <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {iconElement}
          </div>
        )}

        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight truncate">
            {title}
          </h1>
          {description && (
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {isPending && (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100 animate-in fade-in zoom-in duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
              Sincronizando
            </span>
          </div>
        )}

        {children}
        {action}

        {buttonLabel && showButton && (
          <Button
            onClick={onButtonClick}
            className="w-full sm:w-auto h-12 px-8 "
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span className="whitespace-nowrap uppercase tracking-wider text-xs">
              {buttonLabel}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}