"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormModalProps {
  action?: (payload: FormData) => void;
  state: any;
  isPending?: boolean;
  submitLabel?: string;
  submitIcon?: React.ComponentType<{ className?: string }>;
  onSuccess?: () => void;
  contentClassName?: string;
  hideFooter?: boolean;
  children: React.ReactNode;
}

export const FormModal = forwardRef<HTMLFormElement, FormModalProps>(
  ({ action, state, isPending, submitLabel = "Salvar", submitIcon: SubmitIcon, onSuccess, contentClassName, hideFooter, children }, ref) => {


    const internalFormRef = useRef<HTMLFormElement>(null);

    useImperativeHandle(ref, () => internalFormRef.current!);

    const mountTimestamp = useRef<number | string | null>(state?.timestamp || null);

    useEffect(() => {
      mountTimestamp.current = state?.timestamp;
    }, []);

    useEffect(() => {
      if (!state?.message || state?.timestamp === mountTimestamp.current) return;

      if (state.success) {
        toast.success("Sucesso", { description: state.message });
        onSuccess?.();
      } else {
        toast.error("Erro", { description: state.message });
      }

      mountTimestamp.current = state?.timestamp;
    }, [state, onSuccess]);

    useEffect(() => {
      if (!state?.fieldErrors || !internalFormRef.current) return;

      const form = internalFormRef.current;
      const data = new FormData(form);

      for (const [name, value] of data.entries()) {
        const input = form.elements.namedItem(name) as HTMLInputElement | null;
        if (!input || input.type === "file" || input.type === "password") continue;

        if (input.type === "checkbox") {
          input.checked = value === "on";
        } else if (typeof value === "string") {
          input.value = value;
        }
      }
    }, [state?.fieldErrors]);

    const isNewState = state?.timestamp && state?.timestamp !== mountTimestamp.current;
    const showErrors = state?.fieldErrors && !isPending && isNewState;

    return (
      <form
        action={action}
        ref={internalFormRef}
        noValidate
        className="flex flex-col h-full overflow-hidden"
      >
        <div className={["flex-1 overflow-y-auto px-6 py-4 space-y-4", contentClassName].filter(Boolean).join(" ")}>
          {showErrors && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <ul className="list-inside space-y-1">
                {Object.entries(state.fieldErrors).map(([field, errors]) => (
                  <li key={field} className="text-xs text-destructive font-medium">
                    • <span className="capitalize">{field.replace('_', ' ')}</span>:
                    {Array.isArray(errors) ? errors[0] : (errors as string)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {children}
        </div>

        {!hideFooter && (
          <div className="p-4 border-t bg-slate-50/50 backdrop-blur-sm shrink-0 flex justify-end gap-2 px-6">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto min-w-[140px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  {SubmitIcon && <SubmitIcon className="w-4 h-4 mr-2" />}
                  {submitLabel}
                </>
              )}
            </Button>
          </div>
        )}

      </form>
    );
  }
);

FormModal.displayName = "FormModal";