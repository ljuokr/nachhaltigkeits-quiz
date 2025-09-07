export interface Question {
  id: number;
  text: string;
  yesReasons: string[];
  noReasons: string[];
}

export interface QuizResponse {
  questionId: number;
  question: string;
  answer: 'yes' | 'no';
  reasons: string[];
}

export interface QuizSession {
  sessionId: string;
  age: number;
  gender: string;
  responses: QuizResponse[];
  isComplete: boolean;
}

export interface AnalyticsOverview {
  totalParticipants: number;
  completionRate: number;
  avgScore: number;
  todayParticipants: number;
}

export interface Demographics {
  ageDistribution: Array<{ ageGroup: string; count: number; percentage: number }>;
  genderDistribution: Array<{ gender: string; count: number; percentage: number }>;
}

export interface QuestionStat {
  questionId: number;
  questionText: string;
  yesPercentage: number;
}

export interface RecentResponse {
  sessionId: string;
  age: number;
  gender: string;
  score: number;
  completedAt: Date | null;
  isCompleted: boolean;
}
