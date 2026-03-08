"use client";

import { UserPlus, Wallet, Calendar, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Activity {
  user: string;
  role: string;
  date: Date;
  image: string | null;
}

interface RecentActivityProps {
  activities: Activity[];
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "ALUNO": return <UserPlus className="w-4 h-4 text-blue-500" />;
    case "PROFESSOR": return <UserCheck className="w-4 h-4 text-green-500" />;
    default: return <Calendar className="w-4 h-4 text-purple-500" />;
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "ALUNO": return "Novo Aluno";
    case "PROFESSOR": return "Novo Professor";
    default: return "Novo Usuário";
  }
};

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-none">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:via-primary/10 before:to-transparent">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 italic">
              Nenhuma atividade recente.
            </p>
          ) : (
            activities.map((activity, index) => (
              <div key={index} className="relative flex items-start gap-4 group">
                <div className="relative z-10">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-2 ring-primary/10">
                    <AvatarImage src={activity.image || ""} />
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                      {activity.user.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                    {getRoleIcon(activity.role)}
                  </div>
                </div>

                <div className="flex-1 space-y-1 pt-0.5">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm font-bold text-gray-900 leading-none">
                      {activity.user}
                    </p>
                    <time className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: ptBR })}
                    </time>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {getRoleLabel(activity.role)} registrado no sistema
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}