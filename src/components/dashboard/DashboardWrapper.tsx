'use client';

import React, { useState, useTransition, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    X, LogOut, Menu, ChevronDown,
    LayoutDashboard, UserCircle, Settings,
    Bell, Search, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logoutUser } from '~/services/auth/auth.service';
import { ALL_NAV_ITEMS, type NavItem, type PapelUsuario } from '~/config/route-permissions';
import { cn } from "~/lib/utils";
import { GlobalSearch } from "./GlobalSearch";

interface SidebarNavProps {
    role: PapelUsuario;
    onItemClick?: () => void;
    isMinimized: boolean;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ role, onItemClick, isMinimized }) => {
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const pathname = usePathname();

    const filteredNavItems = useMemo(() => {
        return ALL_NAV_ITEMS
            .filter(item => item.roles.includes(role))
            .map(item => ({
                ...item,
                children: item.children?.filter(child => child.roles.includes(role))
            }));
    }, [role]);

    const renderNavItem = (item: NavItem, isChild = false) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItem === item.name;
        const isActive = pathname === item.href || (hasChildren && item.children?.some(c => pathname === c.href));

        const baseItemClass = cn(
            "w-full group flex items-center rounded-xl transition-all duration-300 mb-1.5 relative overflow-hidden",
            isMinimized ? "justify-center px-0 h-12" : "px-4 py-3 gap-3",
            isActive
                ? "bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/20"
                : "text-slate-600 hover:bg-primary/5 hover:text-slate-900"
        );

        if (hasChildren && !isMinimized) {
            return (
                <div key={item.name} className="flex flex-col">
                    <button
                        onClick={() => setExpandedItem(isExpanded ? null : item.name)}
                        className={baseItemClass}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-primary group-hover:text-primary transition-colors")} />
                            <span className="text-sm tracking-tight">{item.name}</span>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 ml-auto transition-transform duration-300", isExpanded && "rotate-180")} />
                        {isActive && <motion.div layoutId="nav-active-pill" className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />}
                    </button>

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="ml-9 mt-1 flex flex-col border-l-2 border-slate-100 pl-2 gap-1">
                                    {item.children?.map(child => renderNavItem(child, true))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            );
        }

        return (
            <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                    if (onItemClick) onItemClick();
                }}
                className="block"
            >
                <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(baseItemClass, isChild && "py-2 text-xs")}
                >
                    <item.icon className={cn(
                        isChild ? "w-4 h-4" : "w-5 h-5",
                        isActive ? "text-primary" : "text-primary group-hover:text-primary transition-colors"
                    )} />
                    {!isMinimized && <span className="text-sm tracking-tight truncate">{item.name}</span>}
                    {isActive && <motion.div layoutId="nav-active-pill" className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />}
                </motion.div>
            </Link>
        );
    };

    return (
        <nav className={cn("py-4 space-y-1", isMinimized ? "px-2" : "px-4")}>
            <p className={cn(
                "text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 transition-opacity",
                isMinimized ? "opacity-0 h-0" : "px-4 opacity-100"
            )}>
                MENU PRINCIPAL
            </p>
            {filteredNavItems.map((item) => renderNavItem(item))}
        </nav>
    );
};

export default function DashboardWrapper({ children, user, nomeEscola = "Escola" }: DashboardWrapperProps) {
    const [isPending, startTransition] = useTransition();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        startTransition(async () => { await logoutUser(); });
    };

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <div
                className="fixed inset-y-0 left-0 w-1 z-[120] hidden lg:block"
                onMouseEnter={() => setIsSidebarVisible(true)}
            />

            <AnimatePresence>
                {(isSidebarVisible || isMobileOpen) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[100]"
                        onClick={() => {
                            setIsSidebarVisible(false);
                            setIsMobileOpen(false);
                        }}
                    />
                )}
            </AnimatePresence>

            <motion.aside
                onMouseLeave={() => setIsSidebarVisible(false)}
                initial={false}
                animate={{
                    x: (isSidebarVisible || isMobileOpen) ? 0 : -300,
                }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={cn(
                    "fixed inset-y-0 left-0 w-[280px] bg-white z-[110] flex flex-col border-r border-slate-200",
                    "shadow-[25px_0_50px_-12px_rgba(0,0,0,0.15)]"
                )}
            >
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
                    <div className="flex items-center">
                        <h1 className="font-bold text-primary truncate">{nomeEscola}</h1>
                    </div>
                    <button className="lg:hidden" onClick={() => setIsMobileOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-4 py-6">
                    <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border">
                            {user.imagem ? <img src={user.imagem} alt="" /> : <UserCircle className="text-slate-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{user.nome}</p>
                            <p className="text-[10px] font-bold text-primary uppercase">{user.role}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto no-scrollbar">
                    <SidebarNav
                        role={user.role}
                        isMinimized={false}
                        onItemClick={() => {
                            setIsMobileOpen(false);
                            setIsSidebarVisible(false);
                        }}
                    />
                </div>
                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        disabled={isPending}
                        className={`
                            w-full flex items-center justify-center gap-2 p-3 rounded-xl 
                            text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 
                            transition-all duration-200 disabled:opacity-50
                        `}
                        title="Deslogar"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <span>Sair</span>
                    </button>
                </div>
            </motion.aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className={cn(
                    "h-20 sticky top-0 z-[50] flex items-center justify-between px-6 lg:px-10 transition-all duration-300",
                    scrolled ? "bg-white/80 backdrop-blur-lg border-b border-slate-200 py-2 h-16 shadow-sm" : "bg-transparent"
                )}>
                    <div className="flex items-center gap-6">
                        <button
                            className="lg:hidden p-2 rounded-xl bg-white shadow-sm border border-slate-200 text-slate-600 hover:text-primary transition-colors"
                            onClick={() => setIsMobileOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="hidden lg:flex items-center gap-2 group cursor-pointer" onMouseEnter={() => setIsSidebarVisible(true)}>
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 shadow-sm">
                                <Menu className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-widest leading-none">Menu</span>
                        </div>

                        <nav className="hidden md:flex items-center gap-2 text-sm text-slate-400 font-medium">
                            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                            <ChevronRight className="w-4 h-4 opacity-50" />
                            <span className="text-slate-900 capitalize">{pathname.split('/').pop()?.replace(/-/g, ' ')}</span>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-6">
                        <GlobalSearch />

                        <div className="flex items-center gap-2">
                            <button className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                            </button>

                            <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block" />

                            <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors leading-none mb-1">{user.nome}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
                                </div>
                                <div className="h-11 w-11 p-0.5 relative">
                                    {user.imagem ? (
                                        <img src={user.imagem} alt={user.nome} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                                            {user.nome[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-grow p-6 lg:p-10 p-6 space-y-8 max-w-full overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}

interface DashboardWrapperProps {
    children: React.ReactNode;
    user: { nome: string, email: string, imagem: string, role: any };
    nomeEscola?: string
}