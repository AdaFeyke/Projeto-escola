import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon; 
  color: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon,
  color, 
  description 
}: StatsCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 tracking-tight">
            {value}
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
            {description}
        </p>
      </CardContent>
    </Card>
  );
}