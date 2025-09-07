import {
  users,
  quizSessions,
  questionResponses,
  type User,
  type UpsertUser,
  type QuizSession,
  type InsertQuizSession,
  type QuestionResponse,
  type InsertQuestionResponse,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, avg, sql, isNotNull } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Quiz operations
  createQuizSession(session: InsertQuizSession): Promise<QuizSession>;
  getQuizSession(sessionId: string): Promise<QuizSession | undefined>;
  completeQuizSession(sessionId: string): Promise<void>;
  
  // Response operations
  createQuestionResponse(response: InsertQuestionResponse): Promise<QuestionResponse>;
  getSessionResponses(sessionId: string): Promise<QuestionResponse[]>;
  
  // Analytics operations
  getTotalParticipants(): Promise<number>;
  getCompletionRate(): Promise<number>;
  getAverageScore(): Promise<number>;
  getTodayParticipants(): Promise<number>;
  getAgeDistribution(): Promise<Array<{ ageGroup: string; count: number; percentage: number }>>;
  getGenderDistribution(): Promise<Array<{ gender: string; count: number; percentage: number }>>;
  getQuestionStats(): Promise<Array<{ questionId: number; questionText: string; yesPercentage: number }>>;
  getRecentResponses(limit?: number): Promise<Array<{
    sessionId: string;
    age: number;
    gender: string;
    score: number;
    completedAt: Date | null;
    isCompleted: boolean;
  }>>;
  getTopReasons(): Promise<Array<{ reason: string; count: number }>>;
  getParticipationTrend(days: number): Promise<Array<{ date: string; count: number }>>;
  
  // Simple statistics methods
  getSimpleStats(): Promise<{
    totalParticipants: number;
    completedSurveys: number;
    averageScore: number;
    topScoreRange: { range: string; count: number; percentage: number }[];
    mostCommonReasons: { reason: string; count: number }[];
    genderBreakdown: { gender: string; count: number; percentage: number }[];
    ageBreakdown: { range: string; count: number; percentage: number }[];
  }>;
  
  // Detailed question statistics
  getDetailedQuestionStats(): Promise<{
    questionStats: Array<{ questionId: number; questionText: string; answer: string; count: number }>;
    reasonStats: Array<{ questionId: number; questionText: string; reason: string; count: number }>;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Quiz operations
  async createQuizSession(session: InsertQuizSession): Promise<QuizSession> {
    const [quizSession] = await db
      .insert(quizSessions)
      .values(session)
      .returning();
    return quizSession;
  }

  async getQuizSession(sessionId: string): Promise<QuizSession | undefined> {
    const [session] = await db
      .select()
      .from(quizSessions)
      .where(eq(quizSessions.sessionId, sessionId));
    return session;
  }

  async completeQuizSession(sessionId: string): Promise<void> {
    await db
      .update(quizSessions)
      .set({ completedAt: new Date() })
      .where(eq(quizSessions.sessionId, sessionId));
  }

  // Response operations
  async createQuestionResponse(response: InsertQuestionResponse): Promise<QuestionResponse> {
    const [questionResponse] = await db
      .insert(questionResponses)
      .values(response)
      .returning();
    return questionResponse;
  }

  async getSessionResponses(sessionId: string): Promise<QuestionResponse[]> {
    return await db
      .select()
      .from(questionResponses)
      .where(eq(questionResponses.sessionId, sessionId))
      .orderBy(questionResponses.questionNumber);
  }

  // Analytics operations
  async getTotalParticipants(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(quizSessions);
    return result.count;
  }

  async getCompletionRate(): Promise<number> {
    const [total] = await db
      .select({ count: count() })
      .from(quizSessions);
      
    const [completed] = await db
      .select({ count: count() })
      .from(quizSessions)
      .where(sql`completed_at IS NOT NULL`);
      
    return total.count > 0 ? Math.round((completed.count / total.count) * 100) : 0;
  }

  async getAverageScore(): Promise<number> {
    const sessions = await db
      .select({
        sessionId: quizSessions.sessionId,
        totalQuestions: quizSessions.totalQuestions,
      })
      .from(quizSessions)
      .where(sql`completed_at IS NOT NULL`);

    if (sessions.length === 0) return 0;

    let totalScore = 0;
    for (const session of sessions) {
      const responses = await this.getSessionResponses(session.sessionId);
      const yesCount = responses.filter(r => r.answer === 'yes').length;
      const score = (yesCount / session.totalQuestions) * 100;
      totalScore += score;
    }

    return Math.round(totalScore / sessions.length);
  }

  async getTodayParticipants(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [result] = await db
      .select({ count: count() })
      .from(quizSessions)
      .where(sql`created_at >= ${today}`);
    return result.count;
  }

  async getAgeDistribution(): Promise<Array<{ ageGroup: string; count: number; percentage: number }>> {
    const [total] = await db
      .select({ count: count() })
      .from(quizSessions);

    if (total.count === 0) return [];

    const results = await db.execute(sql`
      SELECT 
        CASE 
          WHEN age BETWEEN 16 AND 24 THEN '16-24'
          WHEN age BETWEEN 25 AND 34 THEN '25-34'
          WHEN age BETWEEN 35 AND 44 THEN '35-44'
          ELSE '45+'
        END as age_group,
        COUNT(*) as count
      FROM quiz_sessions
      GROUP BY age_group
      ORDER BY age_group
    `);

    return results.rows.map((row: any) => ({
      ageGroup: row.age_group,
      count: parseInt(row.count),
      percentage: Math.round((parseInt(row.count) / total.count) * 100),
    }));
  }

  async getGenderDistribution(): Promise<Array<{ gender: string; count: number; percentage: number }>> {
    const [total] = await db
      .select({ count: count() })
      .from(quizSessions);

    if (total.count === 0) return [];

    const results = await db.execute(sql`
      SELECT gender, COUNT(*) as count
      FROM quiz_sessions
      GROUP BY gender
      ORDER BY count DESC
    `);

    return results.rows.map((row: any) => ({
      gender: row.gender,
      count: parseInt(row.count),
      percentage: Math.round((parseInt(row.count) / total.count) * 100),
    }));
  }

  async getQuestionStats(): Promise<Array<{ questionId: number; questionText: string; yesPercentage: number }>> {
    const results = await db.execute(sql`
      SELECT 
        question_id,
        question_text,
        COUNT(CASE WHEN answer = 'yes' THEN 1 END) * 100.0 / COUNT(*) as yes_percentage
      FROM question_responses
      GROUP BY question_id, question_text
      ORDER BY question_id
    `);

    return results.rows.map((row: any) => ({
      questionId: parseInt(row.question_id),
      questionText: row.question_text,
      yesPercentage: Math.round(parseFloat(row.yes_percentage)),
    }));
  }

  async getRecentResponses(limit = 10): Promise<Array<{
    sessionId: string;
    age: number;
    gender: string;
    score: number;
    completedAt: Date | null;
    isCompleted: boolean;
  }>> {
    const sessions = await db
      .select()
      .from(quizSessions)
      .orderBy(desc(quizSessions.createdAt))
      .limit(limit);

    const results = [];
    for (const session of sessions) {
      const responses = await this.getSessionResponses(session.sessionId);
      const yesCount = responses.filter(r => r.answer === 'yes').length;
      const score = responses.length > 0 ? Math.round((yesCount / responses.length) * 100) : 0;
      
      results.push({
        sessionId: session.sessionId,
        age: session.age,
        gender: session.gender,
        score,
        completedAt: session.completedAt,
        isCompleted: !!session.completedAt,
      });
    }

    return results;
  }

  async getTopReasons(): Promise<Array<{ reason: string; count: number }>> {
    const results = await db.execute(sql`
      SELECT reason, COUNT(*) as count
      FROM (
        SELECT UNNEST(reasons) as reason
        FROM question_responses
        WHERE array_length(reasons, 1) > 0
      ) reasons_table
      GROUP BY reason
      ORDER BY count DESC
      LIMIT 10
    `);

    return results.rows.map((row: any) => ({
      reason: row.reason,
      count: parseInt(row.count),
    }));
  }

  async getParticipationTrend(days: number): Promise<Array<{ date: string; count: number }>> {
    const results = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM quiz_sessions
      WHERE created_at >= NOW() - INTERVAL '${sql.raw(days.toString())} days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    return results.rows.map((row: any) => ({
      date: row.date,
      count: parseInt(row.count),
    }));
  }

  // Simple aggregated statistics
  async getSimpleStats() {
    // Get basic counts
    const [totalParticipants] = await db
      .select({ count: count() })
      .from(quizSessions);
    
    const [completedSurveys] = await db
      .select({ count: count() })
      .from(quizSessions)
      .where(sql`completed_at IS NOT NULL`);
    
    // Get average score
    const avgScore = await this.getAverageScore();
    
    // Score ranges
    const sessions = await db
      .select({
        sessionId: quizSessions.sessionId,
        totalQuestions: quizSessions.totalQuestions,
      })
      .from(quizSessions)
      .where(sql`completed_at IS NOT NULL`);
    
    let scoreRanges = { '0-30%': 0, '31-60%': 0, '61-80%': 0, '81-100%': 0 };
    
    for (const session of sessions) {
      const responses = await this.getSessionResponses(session.sessionId);
      const yesCount = responses.filter(r => r.answer === 'yes').length;
      const score = (yesCount / session.totalQuestions) * 100;
      
      if (score <= 30) scoreRanges['0-30%']++;
      else if (score <= 60) scoreRanges['31-60%']++;
      else if (score <= 80) scoreRanges['61-80%']++;
      else scoreRanges['81-100%']++;
    }
    
    const totalCompleted = sessions.length;
    const topScoreRange = Object.entries(scoreRanges).map(([range, count]) => ({
      range,
      count,
      percentage: totalCompleted > 0 ? Math.round((count / totalCompleted) * 100) : 0
    }));
    
    // Top reasons
    const topReasons = await this.getTopReasons();
    
    // Gender breakdown
    const genderBreakdown = await this.getGenderDistribution();
    
    // Age breakdown  
    const ageDistribution = await this.getAgeDistribution();
    const ageBreakdown = ageDistribution.map(item => ({
      range: item.ageGroup,
      count: item.count,
      percentage: item.percentage
    }));
    
    return {
      totalParticipants: totalParticipants.count,
      completedSurveys: completedSurveys.count,
      averageScore: avgScore,
      topScoreRange,
      mostCommonReasons: topReasons.slice(0, 5),
      genderBreakdown,
      ageBreakdown
    };
  }

  // Detailed question statistics implementation
  async getDetailedQuestionStats() {
    // Get answer statistics for each question
    const questionStats = await db
      .select({
        questionId: questionResponses.questionId,
        questionText: questionResponses.questionText,
        answer: questionResponses.answer,
        count: sql<number>`count(*)`
      })
      .from(questionResponses)
      .groupBy(questionResponses.questionId, questionResponses.questionText, questionResponses.answer)
      .orderBy(questionResponses.questionId);

    // Get reason statistics - handling array column properly
    const reasonStats = await db.execute(sql`
      SELECT 
        question_id,
        question_text,
        UNNEST(reasons) as reason,
        COUNT(*) as count
      FROM question_responses
      WHERE array_length(reasons, 1) > 0
      GROUP BY question_id, question_text, UNNEST(reasons)
      ORDER BY question_id, count DESC
    `);

    const formattedReasonStats = reasonStats.rows.map((row: any) => ({
      questionId: parseInt(row.question_id),
      questionText: row.question_text,
      reason: row.reason,
      count: parseInt(row.count)
    }));

    return {
      questionStats,
      reasonStats: formattedReasonStats
    };
  }
}

export const storage = new DatabaseStorage();
