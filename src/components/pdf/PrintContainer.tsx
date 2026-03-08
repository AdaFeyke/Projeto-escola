import { PrintWrapper } from "./PrintWrapper";

interface PrintProps {
  children: React.ReactNode;
  title?: string;
  filename?: string;
  buttonLabel?: string;
  nomeEscola?: string;
}

export function PrintContainer({ children, title, filename, buttonLabel, nomeEscola}: PrintProps) {
  return (
    <PrintWrapper filename={filename} buttonLabel={buttonLabel}>
      <div className="print:flex items-center justify-between border-b-2 border-primary pb-4 mb-8 hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{nomeEscola}</h1>
          <p className="text-sm font-bold text-slate-500">{title}</p>
        </div>
        <div className="text-right text-[10px] font-medium text-slate-400">
          Gerado em: {new Date().toLocaleDateString()}
        </div>
      </div>

      {children}
    </PrintWrapper>
  );
}