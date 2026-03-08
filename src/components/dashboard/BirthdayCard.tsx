"use client";

import { Cake } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BirthdayUser {
    nome: string | null;
    dataNascimento: Date | null;
    imagem: string | null;
}

interface BirthdayCardProps {
    birthdays: BirthdayUser[];
}

export function BirthdayCard({ birthdays }: BirthdayCardProps) {
    if (birthdays.length === 0) return null;

    return (
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Cake className="w-5 h-5 text-pink-500" /> Aniversariantes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {birthdays.map((user, index) => (
                        <div key={index} className="flex items-center gap-4 group">
                            <Avatar className="h-10 w-10 border-2 border-pink-100 group-hover:border-pink-300 transition-colors">
                                <AvatarImage src={user.imagem || ""} />
                                <AvatarFallback className="bg-pink-50 text-pink-700">
                                    {user.nome?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {user.nome}
                                </p>
                                <p className="text-xs text-muted-foreground font-medium">
                                    {user.dataNascimento ? format(new Date(user.dataNascimento), "d 'de' MMMM", { locale: ptBR }) : ""}
                                </p>
                            </div>
                            <div className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                Em breve
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
