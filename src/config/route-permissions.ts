import { BookOpen, Users, Settings, Home, LayoutDashboard, Calendar, FileText, GraduationCap, UserPen, User, CalendarCheck2, Wallet } from "lucide-react";

export type PapelUsuario = 'ADMINISTRADOR' | 'PROFESSOR' | 'ALUNO';

export type NavItem = {
    name: string;
    href: string;
    icon: React.ElementType;
    roles: PapelUsuario[];
    children?: NavItem[];
};

export const ALL_NAV_ITEMS: NavItem[] = [
    { name: "Início", href: "/dashboard", icon: Home, roles: ['ADMINISTRADOR', 'PROFESSOR', 'ALUNO'] },
    { name: "Calendário", href: "/dashboard/calendar", icon: Calendar, roles: ['ADMINISTRADOR', 'PROFESSOR', 'ALUNO'] },
    { name: "Eventos", href: "/dashboard/event", icon: CalendarCheck2, roles: ['ADMINISTRADOR', 'PROFESSOR', 'ALUNO'] },
    {
        name: "Gerenciar Alunos",
        href: "/dashboard/students",
        icon: User,
        roles: ['ADMINISTRADOR'],
        children: [
            { name: "Alunos", href: "/dashboard/students", icon: Users, roles: ['ADMINISTRADOR'] },
            { name: "Matrículas", href: "/dashboard/enrollments", icon: GraduationCap, roles: ['ADMINISTRADOR'] },
        ]
    },
    { name: "Gerenciar Turmas", href: "/dashboard/classes", icon: BookOpen, roles: ['ADMINISTRADOR'] },
    { name: "Gerenciar Professores", href: "/dashboard/teachers", icon: UserPen, roles: ['ADMINISTRADOR'] },
    { name: "Relatórios", href: "/dashboard/reports", icon: FileText, roles: ['ADMINISTRADOR'] },
    { name: "Minhas Turmas", href: "/dashboard/classes/my", icon: BookOpen, roles: ['PROFESSOR'] },
    { name: "Minhas Notas", href: "/dashboard/grades", icon: GraduationCap, roles: ['ALUNO'] },
    { name: "Planejamento Pedagógico", href: "/dashboard/pedagogical-planning", icon: FileText, roles: ['ADMINISTRADOR', 'PROFESSOR'] },
    {
        name: "Financeiro",
        href: "/dashboard/financial",
        icon: Wallet,
        roles: ['ADMINISTRADOR', 'ALUNO'],
        children: [
            { name: "Mensalidades", href: "/dashboard/financial", icon: Wallet, roles: ['ADMINISTRADOR', 'ALUNO'] },
            { name: "Gastos Extras", href: "/dashboard/financial/extra-expenses", icon: FileText, roles: ['ADMINISTRADOR'] },
        ]
    },
    { name: "Configurações", href: "/dashboard/settings", icon: Settings, roles: ['ADMINISTRADOR', 'PROFESSOR', 'ALUNO'] },

];

export type RoutePermissions = Record<string, PapelUsuario[]>;

export function generateRoutePermissions(items: NavItem[]): RoutePermissions {
    const permissions: RoutePermissions = {};

    function flatten(navItems: NavItem[]) {
        for (const item of navItems) {
            permissions[item.href] = item.roles;
            if (item.children && item.children.length > 0) {
                flatten(item.children);
            }
        }
    }

    flatten(items);
    return permissions;
}

export const ROUTE_PERMISSIONS = generateRoutePermissions(ALL_NAV_ITEMS);