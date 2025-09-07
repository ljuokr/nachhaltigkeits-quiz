import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ParticipationChartProps {
  timeframe: string;
}

export default function ParticipationChart({ timeframe }: ParticipationChartProps) {
  const { data: trendData, isLoading } = useQuery({
    queryKey: ["/api/analytics/trend", { days: parseInt(timeframe) }],
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Teilnahme Trend</CardTitle>
        <Select defaultValue={timeframe}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Letzte 7 Tage</SelectItem>
            <SelectItem value="30">Letzte 30 Tage</SelectItem>
            <SelectItem value="90">Letzte 90 Tage</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-64" data-testid="participation-chart">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Chart wird geladen...</div>
            </div>
          ) : (
            <div className="h-full flex items-end justify-between gap-2 px-4">
              {/* Placeholder visualization */}
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-primary rounded-t flex-1"
                  style={{ 
                    height: `${Math.random() * 80 + 20}%`,
                    opacity: 0.4 + (Math.random() * 0.6)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
