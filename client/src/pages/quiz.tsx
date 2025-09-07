import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingForm from "@/components/quiz/OnboardingForm";
import QuizCard from "@/components/quiz/QuizCard";
import ReasonModal from "@/components/quiz/ReasonModal";
import ResultsDisplay from "@/components/quiz/ResultsDisplay";
import { Question, QuizResponse, QuizSession } from "@/types/quiz";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const questions: Question[] = [
  { 
    id: 1, 
    text: 'Nutze ich regelmässig den ÖV, das Velo oder gehe zu Fuss statt mit dem Auto zu fahren?', 
    yesReasons: ['spart CO₂', 'ist günstiger', 'fördert die Gesundheit'], 
    noReasons: ['keine passende Verbindung', 'Zeitdruck', 'körperliche Einschränkungen'] 
  },
  { 
    id: 2, 
    text: 'Kaufe ich Lebensmittel oder Produkte aus regionaler Herkunft?', 
    yesReasons: ['kurze Transportwege', 'Unterstützung lokaler Produzenten', 'frischere Produkte'], 
    noReasons: ['höhere Preise', 'eingeschränkte Auswahl', 'fehlende Verfügbarkeit'] 
  },
  { 
    id: 3, 
    text: 'Schalte ich elektrische Geräte und Licht aus, wenn ich sie nicht brauche?', 
    yesReasons: ['senkt Stromverbrauch', 'spart Kosten', 'verlängert Lebensdauer der Geräte'], 
    noReasons: ['Bequemlichkeit', 'Geräte schwer erreichbar', 'Gewohnheit'] 
  },
  { 
    id: 4, 
    text: 'Stelle ich die Heizung im Winter nicht höher als nötig?', 
    yesReasons: ['spart Energie', 'reduziert Heizkosten', 'fördert bewusstes Wohnen'], 
    noReasons: ['hoher Wärmebedarf', 'schlechte Isolation', 'Komfort wichtiger'] 
  },
  { 
    id: 5, 
    text: 'Verkürze ich meine Duschzeit, um Wasser zu sparen?', 
    yesReasons: ['spart Wasser', 'spart Energie fürs Erwärmen', 'schont die Umwelt'], 
    noReasons: ['Entspannung wichtig', 'Gewohnheit', 'kein Bewusstsein für Wasserverbrauch'] 
  },
  { 
    id: 6, 
    text: 'Kaufe ich Kleidung nur, wenn ich sie wirklich brauche?', 
    yesReasons: ['vermeidet Überproduktion', 'spart Geld', 'weniger Abfall'], 
    noReasons: ['Modeinteresse', 'Impulskäufe', 'günstige Preise verleiten'] 
  },
  { 
    id: 7, 
    text: 'Verwende ich Mehrwegflaschen, Taschen oder Behälter anstelle von Einwegprodukten?', 
    yesReasons: ['reduziert Müll', 'spart Ressourcen', 'langfristig günstiger'], 
    noReasons: ['Spontankäufe', 'fehlende Mitnahme', 'Einweg praktischer'] 
  },
  { 
    id: 8, 
    text: 'Esse ich mindestens an einigen Tagen pro Woche kein Fleisch?', 
    yesReasons: ['geringerer CO₂‑Fussabdruck', 'gesünder', 'Tierwohl'], 
    noReasons: ['Gewohnheit', 'Geschmack', 'Mangel an Alternativen'] 
  },
  { 
    id: 9, 
    text: 'Vermeide ich unnötige Flugreisen?', 
    yesReasons: ['weniger CO₂‑Emissionen', 'Stressvermeidung', 'Förderung lokaler Reisen'], 
    noReasons: ['Beruf erfordert Flüge', 'Familienbesuche', 'fehlende Alternativen'] 
  },
  { 
    id: 10, 
    text: 'Trenne ich meinen Abfall und recycle konsequent?', 
    yesReasons: ['schont Ressourcen', 'reduziert Restmüll', 'unterstützt Kreislaufwirtschaft'], 
    noReasons: ['zu aufwendig', 'fehlende Infrastruktur', 'Unklarheit bei der Trennung'] 
  }
];

export default function Quiz() {
  const [gameState, setGameState] = useState<'onboarding' | 'quiz' | 'reason' | 'results'>('onboarding');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [pendingResponse, setPendingResponse] = useState<{ answer: 'yes' | 'no'; questionIndex: number } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const generateSessionId = () => {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startQuiz = async (age: number, gender: string) => {
    try {
      const sessionId = generateSessionId();
      const shuffled = shuffleArray(questions);
      
      const sessionData = {
        sessionId,
        age,
        gender,
        totalQuestions: shuffled.length,
      };

      await apiRequest('POST', '/api/quiz/start', sessionData);

      const newSession: QuizSession = {
        sessionId,
        age,
        gender,
        responses: [],
        isComplete: false,
      };

      setQuizSession(newSession);
      setShuffledQuestions(shuffled);
      setCurrentQuestionIndex(0);
      setGameState('quiz');

      toast({
        title: "Quiz gestartet",
        description: "Viel Erfolg bei den Fragen!",
      });
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast({
        title: "Fehler",
        description: "Quiz konnte nicht gestartet werden.",
        variant: "destructive",
      });
    }
  };

  const handleAnswer = (answer: 'yes' | 'no') => {
    setPendingResponse({ answer, questionIndex: currentQuestionIndex });
    setGameState('reason');
  };

  const handleReasonSubmit = async (reasons: string[]) => {
    if (!pendingResponse || !quizSession) return;

    try {
      const currentQuestion = shuffledQuestions[pendingResponse.questionIndex];
      
      const responseData = {
        sessionId: quizSession.sessionId,
        questionNumber: pendingResponse.questionIndex + 1,
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        answer: pendingResponse.answer,
        reasons,
      };

      await apiRequest('POST', '/api/quiz/response', responseData);

      const newResponse: QuizResponse = {
        questionId: currentQuestion.id,
        question: currentQuestion.text,
        answer: pendingResponse.answer,
        reasons,
      };

      const updatedResponses = [...quizSession.responses, newResponse];
      setQuizSession({ ...quizSession, responses: updatedResponses });

      if (currentQuestionIndex + 1 >= shuffledQuestions.length) {
        await apiRequest('POST', '/api/quiz/complete', { sessionId: quizSession.sessionId });
        setQuizSession({ ...quizSession, responses: updatedResponses, isComplete: true });
        setGameState('results');
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setGameState('quiz');
      }

      setPendingResponse(null);
    } catch (error) {
      console.error('Error saving response:', error);
      toast({
        title: "Fehler",
        description: "Antwort konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const getScore = () => {
    if (!quizSession) return 0;
    const yesCount = quizSession.responses.filter(r => r.answer === 'yes').length;
    return Math.round((yesCount / shuffledQuestions.length) * 100);
  };

  const restartQuiz = () => {
    setGameState('onboarding');
    setCurrentQuestionIndex(0);
    setQuizSession(null);
    setShuffledQuestions([]);
    setPendingResponse(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Connection Status */}
      <div className="fixed top-4 right-4 z-40">
        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
          isOnline ? 'online-indicator' : 'offline-indicator'
        }`}>
          <div className="w-2 h-2 bg-current rounded-full loading-dot"></div>
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      <div className="container mx-auto max-w-md px-4 py-8 min-h-screen flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {gameState === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <OnboardingForm onStart={startQuiz} />
            </motion.div>
          )}

          {gameState === 'quiz' && shuffledQuestions.length > 0 && (
            <motion.div
              key={`quiz-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.3 }}
            >
              <QuizCard
                question={shuffledQuestions[currentQuestionIndex]}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={shuffledQuestions.length}
                onAnswer={handleAnswer}
                data-testid={`quiz-card-${currentQuestionIndex}`}
              />
            </motion.div>
          )}

          {gameState === 'results' && quizSession && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <ResultsDisplay
                score={getScore()}
                yesCount={quizSession.responses.filter(r => r.answer === 'yes').length}
                noCount={quizSession.responses.filter(r => r.answer === 'no').length}
                onRestart={restartQuiz}
                data-testid="results-display"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {gameState === 'reason' && pendingResponse && (
          <ReasonModal
            answer={pendingResponse.answer}
            question={shuffledQuestions[pendingResponse.questionIndex]}
            onSubmit={handleReasonSubmit}
            onClose={() => setGameState('quiz')}
            data-testid="reason-modal"
          />
        )}
      </div>
    </div>
  );
}
