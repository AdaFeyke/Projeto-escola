import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";

interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function BaseModal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: BaseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn(sizes[size], "max-h-[90vh] w-[95vw] flex flex-col p-0 overflow-hidden grid grid-rows-[auto_1fr]")}>
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-hidden h-full">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}