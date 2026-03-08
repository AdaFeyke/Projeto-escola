"use client";
import { cn } from "~/lib/utils";

export function LegendCard({ label, description, color, icon }: any) {
  return (
    <div className={cn("p-4 rounded-2xl border-2 flex items-center gap-4 transition-all", color)}>
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm font-extrabold text-slate-800 truncate">{label}</p>
        <p className="text-[11px] text-slate-500 font-medium leading-tight">{description}</p>
      </div>
    </div>
  );
}