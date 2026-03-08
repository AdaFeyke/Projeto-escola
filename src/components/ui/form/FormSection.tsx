import { Separator } from "~/components/ui/separator"; 

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">
        {title}
      </h3>
        <Separator/>
      {children}
    </div>
  );
}
