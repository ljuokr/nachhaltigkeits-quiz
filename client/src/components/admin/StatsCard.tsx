import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: string;
  subtitle?: string;
}

export default function StatsCard({ title, value, icon, change, subtitle }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
        <div className="flex items-center mt-4 text-sm">
          {change && (
            <>
              <span className="text-accent">{change}</span>
              <span className="text-muted-foreground ml-2">vs. letzte Woche</span>
            </>
          )}
          {subtitle && (
            <span className="text-muted-foreground">{subtitle}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
