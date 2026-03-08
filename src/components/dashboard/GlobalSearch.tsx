"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import {
    Search, User, Users, LayoutDashboard,
    Plus, Loader2, Sparkles, GraduationCap, History, X
} from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "~/components/ui/command";
import { DialogTitle } from "~/components/ui/dialog";
import { searchGlobal, type SearchResult } from "~/actions/search/global-search.action";

export function GlobalSearch() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [recentSearches, setRecentSearches] = React.useState<SearchResult[]>([]);
    const router = useRouter();

    React.useEffect(() => {
        const saved = localStorage.getItem("recent-searches");
        if (saved) setRecentSearches(JSON.parse(saved).slice(0, 3));
    }, [open]);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const debouncedSearch = useDebouncedCallback(async (value: string) => {
        if (value.length < 2) {
            setResults([]);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        try {
            const data = await searchGlobal(value);
            setResults(data);
        } finally {
            setIsSearching(false);
        }
    }, 300);

    const onInputChange = (value: string) => {
        setQuery(value);
        debouncedSearch(value);
    };

    const handleNavigation = React.useCallback((item: SearchResult) => {
        if (item.category !== "actions") {
            const updated = [item, ...recentSearches.filter(r => r.id !== item.id)].slice(0, 3);
            setRecentSearches(updated);
            localStorage.setItem("recent-searches", JSON.stringify(updated));
        }

        setOpen(false);
        setQuery("");
        router.push(item.href);
    }, [router, recentSearches]);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="group relative flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm text-slate-500 transition-all hover:bg-white hover:border-primary/30 hover:ring-4 hover:ring-primary/5 sm:w-64"
            >
                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 group-hover:text-primary transition-colors" />
                    <span>Buscar</span>
                </div>
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400">
                    <span className="text-[8px]">Ctrl + K</span>
                </kbd>
            </button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <VisuallyHidden.Root>
                    <DialogTitle>Busca Global do Sistema</DialogTitle>
                </VisuallyHidden.Root>

                <CommandInput
                    placeholder="Busque alunos, professores ou turmas..."
                    value={query}
                    onValueChange={onInputChange}
                />

                <CommandList className="max-h-[450px]">
                    {isSearching && (
                        <div className="flex items-center justify-center p-8 text-slate-400">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span className="text-sm">Consultando banco de dados...</span>
                        </div>
                    )}

                    {!isSearching && query.length >= 2 && results.length === 0 && (
                        <CommandEmpty>Nenhum resultado para "{query}".</CommandEmpty>
                    )}

                    <div className={isSearching ? "opacity-40 pointer-events-none transition-opacity" : "transition-opacity"}>

                        {query.length < 2 && recentSearches.length > 0 && (
                            <CommandGroup heading="Recentemente acessado">
                                {recentSearches.map((item) => (
                                    <CommandItem
                                        key={`recent-${item.id}`}
                                        onSelect={() => handleNavigation(item)}
                                        className="flex items-center gap-3 p-3 cursor-pointer"
                                    >
                                        <History className="w-4 h-4 text-slate-400" />
                                        <div className="flex flex-col flex-1 truncate">
                                            <span className="text-sm font-medium truncate">{item.title}</span>
                                            <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{item.category}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {results.length > 0 && (
                            <GroupSection items={results} onSelect={handleNavigation} />
                        )}

                        <CommandSeparator />

                        <CommandGroup heading="Atalhos do Sistema">
                            <QuickAction
                                icon={<LayoutDashboard className="w-4 h-4" />}
                                label="Dashboard Principal"
                                onSelect={() => handleNavigation({ href: "/dashboard", category: "actions" } as any)}
                            />
                            <QuickAction
                                icon={<Plus className="w-4 h-4 text-emerald-600" />}
                                label="Novo Aluno"
                                onSelect={() => handleNavigation({ href: "/dashboard/students/new", category: "actions" } as any)}
                            />
                            <QuickAction
                                icon={<GraduationCap className="w-4 h-4 text-blue-600" />}
                                label="Matricular Aluno"
                                onSelect={() => handleNavigation({ href: "/dashboard/enrollments", category: "actions" } as any)}
                            />
                        </CommandGroup>
                    </div>
                </CommandList>
            </CommandDialog>
        </>
    );
}

function QuickAction({ icon, label, onSelect }: any) {
    return (
        <CommandItem
            onSelect={onSelect}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer aria-selected:bg-slate-100"
        >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white">
                {icon}
            </div>
            <span className="flex-1 font-medium text-slate-700">{label}</span>
        </CommandItem>
    );
}

function GroupSection({ items, onSelect }: { items: SearchResult[], onSelect: (item: SearchResult) => void }) {
    const categories = {
        students: { label: "Alunos", icon: User, color: "bg-orange-50 text-orange-600" },
        teachers: { label: "Professores", icon: Sparkles, color: "bg-purple-50 text-purple-600" },
        classes: { label: "Turmas", icon: Users, color: "bg-blue-50 text-blue-600" },
    };

    return (
        <>
            {Object.entries(categories).map(([key, config]) => {
                const filtered = items.filter(i => i.category === key);
                if (filtered.length === 0) return null;

                return (
                    <CommandGroup key={key} heading={config.label}>
                        {filtered.map((item) => (
                            <CommandItem
                                key={item.id}
                                value={item.title + item.id}
                                onSelect={() => onSelect(item)}
                                className="flex items-center gap-3 p-3 cursor-pointer group/item"
                            >
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${config.color}`}>
                                    {item.image ? (
                                        <img src={item.image} alt="" className="h-full w-full object-cover rounded-full" />
                                    ) : (
                                        <config.icon className="h-5 w-5 rounded-full" />
                                    )}
                                </div>
                                <div className="flex flex-col flex-1 overflow-hidden">
                                    <span className="text-sm font-bold text-slate-800 truncate">{item.title}</span>
                                    <span className="text-[11px] text-slate-500 truncate">{item.description}</span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                );
            })}
        </>
    );
}