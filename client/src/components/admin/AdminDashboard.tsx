import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Leaf, CheckCircle, Calendar, BarChart3, Download, FileSpreadsheet } from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import ParticipationChart from "@/components/admin/ParticipationChart";
import QuestionPerformance from "@/components/admin/QuestionPerformance";
import RecentResponses from "@/components/admin/RecentResponses";
import { AnalyticsOverview, Demographics } from "@/types/quiz";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("7");
  const { toast } = useToast();

  const { data: overview, isLoading: overviewLoading } = useQuery<AnalyticsOverview>({
    queryKey: ["/api/analytics/overview"],
  });

  const { data: demographics, isLoading: demographicsLoading } = useQuery<Demographics>({
    queryKey: ["/api/analytics/demographics"],
  });

  const { data: questionStats, isLoading: questionsLoading } = useQuery({
    queryKey: ["/api/analytics/questions"],
  });

  const { data: recentResponses, isLoading: recentLoading } = useQuery({
    queryKey: ["/api/analytics/recent"],
  });

  const { data: topReasons, isLoading: reasonsLoading } = useQuery({
    queryKey: ["/api/analytics/reasons"],
  });

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/export/csv', {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sustainability-quiz-export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export erfolgreich",
        description: "CSV-Datei wurde heruntergeladen.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Fehler",
        description: "Datei konnte nicht exportiert werden.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  if (overviewLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Dashboard wird geladen...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Analytics Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Letztes Update: <span data-testid="last-update">vor 5 Min.</span>
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Gesamt Teilnehmer"
            value={overview?.totalParticipants || 0}
            icon={<Users className="w-6 h-6" />}
            change="+12%"
            data-testid="stat-total-participants"
          />
          <StatsCard
            title="Ø Nachhaltigkeit"
            value={`${overview?.avgScore || 0}%`}
            icon={<Leaf className="w-6 h-6" />}
            change="+3%"
            data-testid="stat-avg-sustainability"
          />
          <StatsCard
            title="Completion Rate"
            value={`${overview?.completionRate || 0}%`}
            icon={<CheckCircle className="w-6 h-6" />}
            change="+5%"
            data-testid="stat-completion-rate"
          />
          <StatsCard
            title="Heute"
            value={overview?.todayParticipants || 0}
            icon={<Calendar className="w-6 h-6" />}
            subtitle="Neue Teilnehmer"
            data-testid="stat-today-participants"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ParticipationChart timeframe={selectedTimeframe} />
          <QuestionPerformance data={questionStats} loading={questionsLoading} />
        </div>

        {/* Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Age Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Altersverteilung</CardTitle>
            </CardHeader>
            <CardContent>
              {demographicsLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-muted h-6 rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {demographics?.ageDistribution.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{item.ageGroup}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className="bg-chart-1 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gender Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Geschlechterverteilung</CardTitle>
            </CardHeader>
            <CardContent>
              {demographicsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-muted h-6 rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {demographics?.genderDistribution.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{item.gender}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              index === 0 ? 'bg-chart-1' : 
                              index === 1 ? 'bg-chart-2' : 'bg-chart-3'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Reasons */}
          <Card>
            <CardHeader>
              <CardTitle>Top Gründe</CardTitle>
            </CardHeader>
            <CardContent>
              {reasonsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-muted h-6 rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {(topReasons as any[])?.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{item.reason}</span>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Data Export */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daten Export</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportCSV}
                  data-testid="button-export-csv"
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV Export
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportCSV}
                  data-testid="button-export-excel"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Excel Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Zeitraum:</label>
                <div className="flex gap-2">
                  <input type="date" className="flex-1 p-2 text-sm border border-border rounded bg-background" />
                  <span className="flex items-center text-muted-foreground">bis</span>
                  <input type="date" className="flex-1 p-2 text-sm border border-border rounded bg-background" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Filter:</label>
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Alle Altersgruppen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Altersgruppen</SelectItem>
                      <SelectItem value="16-24">16-24</SelectItem>
                      <SelectItem value="25-34">25-34</SelectItem>
                      <SelectItem value="35-44">35-44</SelectItem>
                      <SelectItem value="45+">45+</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Alle Geschlechter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Geschlechter</SelectItem>
                      <SelectItem value="männlich">Männlich</SelectItem>
                      <SelectItem value="weiblich">Weiblich</SelectItem>
                      <SelectItem value="divers">Divers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Responses */}
        <RecentResponses data={recentResponses} loading={recentLoading} />
      </div>
    </div>
  );
}
