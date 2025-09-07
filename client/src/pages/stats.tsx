import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Users, Award, CheckCircle, BarChart3, TrendingUp, Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface SimpleStats {
  totalParticipants: number;
  completedSurveys: number;
  averageScore: number;
  topScoreRange: Array<{ range: string; count: number; percentage: number }>;
  mostCommonReasons: Array<{ reason: string; count: number }>;
  genderBreakdown: Array<{ gender: string; count: number; percentage: number }>;
  ageBreakdown: Array<{ range: string; count: number; percentage: number }>;
}

interface DetailedQuestionStats {
  questionStats: Array<{ questionId: number; questionText: string; answer: string; count: number }>;
  reasonStats: Array<{ questionId: number; questionText: string; reason: string; count: number }>;
}

export default function StatsPage() {
  const { data: stats, isLoading } = useQuery<SimpleStats>({
    queryKey: ["/api/stats/simple"],
  });

  const { data: questionStats, isLoading: isLoadingQuestions } = useQuery<DetailedQuestionStats>({
    queryKey: ["/api/stats/questions"],
  });

  if (isLoading || isLoadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Statistiken werden geladen...</div>
      </div>
    );
  }

  // Group question stats by question
  const groupedQuestions = questionStats?.questionStats.reduce((acc, stat) => {
    if (!acc[stat.questionId]) {
      acc[stat.questionId] = {
        questionText: stat.questionText,
        answers: []
      };
    }
    acc[stat.questionId].answers.push({ answer: stat.answer, count: stat.count });
    return acc;
  }, {} as Record<number, { questionText: string; answers: Array<{ answer: string; count: number }> }>);

  // Group reason stats by question
  const groupedReasons = questionStats?.reasonStats.reduce((acc, stat) => {
    if (!acc[stat.questionId]) {
      acc[stat.questionId] = [];
    }
    acc[stat.questionId].push({ reason: stat.reason, count: stat.count });
    return acc;
  }, {} as Record<number, Array<{ reason: string; count: number }>>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Nachhaltigkeits-Quiz Statistiken
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Entdecke wie andere Teilnehmer bei unserem Nachhaltigkeits-Check abschneiden
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="questions">Fragen im Detail</TabsTrigger>
            <TabsTrigger value="reasons">Begründungen</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {stats?.totalParticipants || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Gesamt Teilnehmer
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-accent" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {stats?.completedSurveys || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Vollständig abgeschlossen
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-chart-4/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-chart-4" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {stats?.averageScore || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Durchschnittswert
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-chart-2/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-chart-2" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {stats?.completedSurveys && stats?.totalParticipants 
                        ? Math.round((stats.completedSurveys / stats.totalParticipants) * 100) 
                        : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Abschlussquote
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Score Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Nachhaltigkeits-Score Verteilung
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {stats?.topScoreRange.map((range, index) => (
                      <div key={index} className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-foreground mb-2">
                          {range.count}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {range.range}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {range.percentage}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Age Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Altersverteilung</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats?.ageBreakdown.map((age, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 text-sm text-muted-foreground">
                          {age.range}
                        </div>
                        <div className="flex-1 bg-muted rounded-full h-3">
                          <div 
                            className="bg-chart-1 h-3 rounded-full transition-all duration-1000" 
                            style={{ width: `${age.percentage}%` }}
                          />
                        </div>
                        <div className="text-sm font-medium text-foreground">
                          {age.percentage}%
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Gender Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Geschlechterverteilung</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats?.genderBreakdown.map((gender, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 text-sm text-muted-foreground capitalize">
                          {gender.gender}
                        </div>
                        <div className="flex-1 bg-muted rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-1000 ${
                              index === 0 ? 'bg-chart-2' : 
                              index === 1 ? 'bg-chart-3' : 'bg-chart-4'
                            }`}
                            style={{ width: `${gender.percentage}%` }}
                          />
                        </div>
                        <div className="text-sm font-medium text-foreground">
                          {gender.percentage}%
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Detaillierte Fragenauswertung
                </h2>
                <p className="text-muted-foreground">
                  So haben alle Teilnehmer bei jeder einzelnen Frage geantwortet
                </p>
              </div>

              {groupedQuestions && Object.entries(groupedQuestions)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([questionId, question]) => {
                  const totalAnswers = question.answers.reduce((sum, answer) => sum + answer.count, 0);
                  const yesCount = question.answers.find(a => a.answer === 'yes')?.count || 0;
                  const noCount = question.answers.find(a => a.answer === 'no')?.count || 0;
                  const yesPercentage = totalAnswers > 0 ? Math.round((yesCount / totalAnswers) * 100) : 0;
                  const noPercentage = totalAnswers > 0 ? Math.round((noCount / totalAnswers) * 100) : 0;

                  return (
                    <Card key={questionId}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Frage {questionId}: {question.questionText}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                                Ja
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {yesCount} ({yesPercentage}%)
                              </span>
                            </div>
                            <Progress value={yesPercentage} className="h-3" />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                                Nein
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {noCount} ({noPercentage}%)
                              </span>
                            </div>
                            <Progress value={noPercentage} className="h-3" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </motion.div>
          </TabsContent>

          <TabsContent value="reasons" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Begründungen zu den Antworten
                </h2>
                <p className="text-muted-foreground">
                  Die häufigsten Begründungen für jede Frage
                </p>
              </div>

              {groupedReasons && Object.entries(groupedReasons)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([questionId, reasons]) => {
                  const questionText = groupedQuestions?.[parseInt(questionId)]?.questionText || `Frage ${questionId}`;
                  const totalReasons = reasons.reduce((sum, reason) => sum + reason.count, 0);

                  return (
                    <Card key={`reasons-${questionId}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5" />
                          Frage {questionId}: {questionText}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {reasons.slice(0, 5).map((reason, index) => {
                            const percentage = totalReasons > 0 ? Math.round((reason.count / totalReasons) * 100) : 0;
                            
                            return (
                              <div key={index} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-foreground">
                                    {reason.reason}
                                  </span>
                                  <Badge variant="outline">
                                    {reason.count}× ({percentage}%)
                                  </Badge>
                                </div>
                                <Progress value={percentage} className="h-2" />
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center py-8"
        >
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
            <p className="text-accent font-medium">
              🌱 Danke an alle, die bei unserem Nachhaltigkeits-Check mitgemacht haben!
            </p>
            <p className="text-muted-foreground mt-2">
              Gemeinsam können wir eine nachhaltigere Zukunft gestalten.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}