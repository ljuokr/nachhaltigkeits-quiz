import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionStat } from "@/types/quiz";

interface QuestionPerformanceProps {
  data: QuestionStat[] | undefined;
  loading: boolean;
}

export default function QuestionPerformance({ data, loading }: QuestionPerformanceProps) {
  const getShortTitle = (text: string) => {
    if (text.includes('ÖV') || text.includes('Velo')) return 'ÖV/Velo nutzen';
    if (text.includes('regional')) return 'Regionale Produkte';
    if (text.includes('Geräte') || text.includes('Licht')) return 'Geräte ausschalten';
    if (text.includes('Heizung')) return 'Heizung sparen';
    if (text.includes('Dusch')) return 'Duschzeit verkürzen';
    if (text.includes('Kleidung')) return 'Bewusst einkaufen';
    if (text.includes('Mehrweg')) return 'Mehrweg nutzen';
    if (text.includes('Fleisch')) return 'Weniger Fleisch';
    if (text.includes('Flug')) return 'Flugreisen vermeiden';
    if (text.includes('Abfall')) return 'Abfall trennen';
    return text.substring(0, 30) + '...';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fragen Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-4 rounded mb-2" />
                <div className="bg-muted h-2 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4" data-testid="question-performance">
            {data?.slice(0, 5).map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {getShortTitle(stat.questionText)}
                  </p>
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${stat.yesPercentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground ml-4">
                  {stat.yesPercentage}%
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
