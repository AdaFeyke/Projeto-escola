import { ArrowDownCircle, ArrowUpCircle, AlertCircle, DollarSign, Wallet } from "lucide-react";
import { cn } from "~/lib/utils";

interface SummaryCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: string;
    colorClass: string;
    iconBgClass: string;
}

function SummaryCard({ title, value, icon, trend, colorClass, iconBgClass }: SummaryCardProps) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className={cn("absolute top-0 right-0 p-3 rounded-bl-2xl opacity-10 group-hover:opacity-20 transition-opacity", colorClass)}>
                {icon}
            </div>

            <div className="flex items-start justify-between mb-4">
                <div className={cn("p-3 rounded-xl", iconBgClass)}>
                    {icon}
                </div>
                {trend && (
                    <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-500")}>
                        {trend}
                    </span>
                )}
            </div>

            <div className="space-y-1">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-black text-slate-800">{value}</h3>
            </div>
        </div>
    );
}

export function FinancialSummaryCards({ resumo }: { resumo: any }) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
                title="Total Pendente"
                value={formatCurrency(resumo.pendente || 0)}
                icon={<AlertCircle className="w-6 h-6 text-amber-600" />}
                colorClass="bg-amber-500"
                iconBgClass="bg-amber-50"
            />
            <SummaryCard
                title="Em Atraso"
                value={formatCurrency(resumo.atrasado || 0)}
                icon={<ArrowDownCircle className="w-6 h-6 text-rose-600" />}
                colorClass="bg-rose-500"
                iconBgClass="bg-rose-50"
            />
            <SummaryCard
                title="Total Pago"
                value={formatCurrency(resumo.pago || 0)}
                icon={<ArrowUpCircle className="w-6 h-6 text-emerald-600" />}
                colorClass="bg-emerald-500"
                iconBgClass="bg-emerald-50"
            />
            <SummaryCard
                title="Próximos Vencimentos"
                value={formatCurrency(resumo.proximos || 0)}
                icon={<Wallet className="w-6 h-6 text-blue-600" />}
                colorClass="bg-blue-500"
                iconBgClass="bg-blue-50"
            />
        </div>
    );
}
