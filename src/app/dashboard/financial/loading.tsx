import { Skeleton } from "~/components/ui/skeleton";
import { PageHeader } from "~/components/ui/PageHeader";
import { Wallet } from "lucide-react";

export default function FinancialLoading() {
    return (
        <div className="space-y-8 pb-20">
            <PageHeader
                title={'Financeiro'}
                iconElement={<Wallet className="w-7 h-7 md:w-8 md:h-8" />}
                description="Gestão de pagamentos e pendências escolares"
                backHref="/dashboard"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-32 flex flex-col justify-between">
                        <div className="flex justify-between">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-8 w-32" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="h-11 w-full max-w-md rounded-xl bg-slate-100 animate-pulse" />

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-lg" />
                </div>

                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
