import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check, Clock } from "lucide-react";
import { RecentResponse } from "@/types/quiz";

interface RecentResponsesProps {
  data: RecentResponse[] | undefined;
  loading: boolean;
}

export default function RecentResponses({ data, loading }: RecentResponsesProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('de-DE');
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-accent/10 text-accent';
    if (score >= 50) return 'bg-chart-4/10 text-chart-4';
    return 'bg-destructive/10 text-destructive';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Neueste Antworten</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Zeitstempel
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Alter
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Geschlecht
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Score
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border" data-testid="recent-responses-table">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="animate-pulse bg-muted h-4 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                data?.slice(0, 10).map((response, index) => (
                  <tr key={index} className="hover:bg-muted/30" data-testid={`response-row-${index}`}>
                    <td className="px-6 py-4 text-foreground">
                      {formatDate(response.completedAt)}
                    </td>
                    <td className="px-6 py-4 text-foreground">{response.age}</td>
                    <td className="px-6 py-4 text-foreground">{response.gender}</td>
                    <td className="px-6 py-4">
                      <Badge className={`text-xs font-medium ${getScoreColor(response.score)}`}>
                        {response.score}%
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        className={`text-xs font-medium ${
                          response.isCompleted 
                            ? 'bg-accent/10 text-accent' 
                            : 'bg-chart-4/10 text-chart-4'
                        }`}
                      >
                        {response.isCompleted ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Vollständig
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Abgebrochen
                          </>
                        )}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
          <span>
            Zeige 1-{Math.min(data?.length || 0, 10)} von {data?.length || 0} Einträgen
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled data-testid="button-prev-page">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" data-testid="button-next-page">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
