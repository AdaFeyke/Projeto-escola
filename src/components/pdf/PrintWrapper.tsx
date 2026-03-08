"use client";

import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "~/lib/utils";

interface PrintWrapperProps {
  children: React.ReactNode;
  filename?: string;
  buttonLabel?: string;
  className?: string;
}

export function PrintWrapper({
  children,
  filename = "documento",
  buttonLabel = "Exportar PDF",
  className,
}: PrintWrapperProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: filename,
  });

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex justify-end no-print">
        <Button
          onClick={() => handlePrint()}
          variant="outline"
          className="font-bold gap-2 border-slate-200 shadow-sm bg-white"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          {buttonLabel}
        </Button>
      </div>

      <div 
        ref={contentRef} 
        className="print:m-0 print:p-0 print:bg-white w-full"
      >
        {children}
      </div>
    </div>
  );
}