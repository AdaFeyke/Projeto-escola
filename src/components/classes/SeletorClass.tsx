"use client";

import { useRouter } from "next/navigation";

interface TurmaOption {
  id: string;
  disciplinaNome: string;
  turmaNome: string;
}

export function SeletorClass({ options, currentId }: { options: TurmaOption[], currentId: string }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-1.5 w-full md:w-fit">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
        Trocar Discplina
      </label>
      <select
        value={currentId}
        onChange={(e) => router.push(`/dashboard/classes/class/${e.target.value}`)}
        className="bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-700 shadow-sm hover:border-primary/30 transition-all outline-none w-full md:min-w-[300px] cursor-pointer text-sm md:text-base appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.disciplinaNome} ({opt.turmaNome})
          </option>
        ))}
      </select>
    </div>
  );
}