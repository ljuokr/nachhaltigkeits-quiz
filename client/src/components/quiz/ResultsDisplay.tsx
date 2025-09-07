import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

interface ResultsDisplayProps {
  score: number;
  yesCount: number;
  noCount: number;
  onRestart: () => void;
}

export default function ResultsDisplay({ score, yesCount, noCount, onRestart }: ResultsDisplayProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const increment = score / 50;
      const interval = setInterval(() => {
        current += increment;
        if (current >= score) {
          current = score;
          clearInterval(interval);
        }
        setAnimatedScore(Math.round(current));
      }, 20);
    }, 500);

    return () => clearTimeout(timer);
  }, [score]);

  return (
    <Card className="shadow-2xl">
      <CardHeader className="text-center space-y-4">
        <CardTitle className="text-2xl font-bold">
          🎉 Deine Ergebnisse
        </CardTitle>
        <motion.div 
          className="text-5xl font-bold gradient-bg bg-clip-text text-transparent"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          data-testid="score-display"
        >
          {animatedScore}%
        </motion.div>
        <div className="w-full bg-secondary rounded-full h-4">
          <motion.div 
            className="bg-gradient-to-r from-accent to-primary h-4 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${animatedScore}%` }}
            transition={{ duration: 1, delay: 0.8 }}
            data-testid="score-bar-fill"
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground" data-testid="yes-count">
              {yesCount}
            </div>
            <div className="text-sm text-muted-foreground">Ja‑Antworten</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground" data-testid="no-count">
              {noCount}
            </div>
            <div className="text-sm text-muted-foreground">Nein‑Antworten</div>
          </div>
        </div>

        <motion.div 
          className="bg-accent/10 border border-accent/20 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <div className="flex items-center gap-2 text-accent font-medium">
            <CheckCircle className="w-5 h-5" />
            <span data-testid="success-message">Daten erfolgreich gespeichert</span>
          </div>
        </motion.div>

        <div className="space-y-3">
          <Link href="/stats">
            <Button 
              variant="outline"
              className="w-full border-primary/20 hover:bg-primary/10 font-medium"
              data-testid="button-view-stats"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Gesamtstatistiken ansehen
            </Button>
          </Link>
          
          <Button 
            onClick={onRestart}
            className="w-full gradient-bg hover:opacity-90 font-bold"
            data-testid="button-restart"
          >
            Nochmal spielen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
