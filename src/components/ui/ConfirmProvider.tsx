"use client";

import React, { createContext, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "~/components/ui/alert-dialog";

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<
    ((value: boolean) => void) | null
  >(null);

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleClose = (result: boolean) => {
    setOpen(false);
    resolver?.(result);
    setResolver(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <AlertDialog open={open} onOpenChange={() => handleClose(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {options.title ?? "Tem certeza?"}
            </AlertDialogTitle>
            {options.description && (
              <AlertDialogDescription>
                {options.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleClose(false)}>
              {options.cancelText ?? "Cancelar"}
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() => handleClose(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              {options.confirmText ?? "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}
