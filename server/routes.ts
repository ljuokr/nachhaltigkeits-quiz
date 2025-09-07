import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertQuizSessionSchema, insertQuestionResponseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Quiz routes
  app.post('/api/quiz/start', async (req, res) => {
    try {
      const sessionData = insertQuizSessionSchema.parse(req.body);
      const session = await storage.createQuizSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating quiz session:", error);
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  app.post('/api/quiz/response', async (req, res) => {
    try {
      const responseData = insertQuestionResponseSchema.parse(req.body);
      const response = await storage.createQuestionResponse(responseData);
      res.json(response);
    } catch (error) {
      console.error("Error saving response:", error);
      res.status(400).json({ message: "Invalid response data" });
    }
  });

  app.post('/api/quiz/complete', async (req, res) => {
    try {
      const { sessionId } = z.object({ sessionId: z.string() }).parse(req.body);
      await storage.completeQuizSession(sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error completing quiz session:", error);
      res.status(400).json({ message: "Invalid session ID" });
    }
  });

  app.get('/api/quiz/session/:sessionId/responses', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const responses = await storage.getSessionResponses(sessionId);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching session responses:", error);
      res.status(500).json({ message: "Failed to fetch responses" });
    }
  });

  // Analytics routes (protected)
  app.get('/api/analytics/overview', isAuthenticated, async (req, res) => {
    try {
      const [totalParticipants, completionRate, avgScore, todayParticipants] = await Promise.all([
        storage.getTotalParticipants(),
        storage.getCompletionRate(),
        storage.getAverageScore(),
        storage.getTodayParticipants(),
      ]);

      res.json({
        totalParticipants,
        completionRate,
        avgScore,
        todayParticipants,
      });
    } catch (error) {
      console.error("Error fetching analytics overview:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/analytics/demographics', isAuthenticated, async (req, res) => {
    try {
      const [ageDistribution, genderDistribution] = await Promise.all([
        storage.getAgeDistribution(),
        storage.getGenderDistribution(),
      ]);

      res.json({
        ageDistribution,
        genderDistribution,
      });
    } catch (error) {
      console.error("Error fetching demographics:", error);
      res.status(500).json({ message: "Failed to fetch demographics" });
    }
  });

  app.get('/api/analytics/questions', isAuthenticated, async (req, res) => {
    try {
      const questionStats = await storage.getQuestionStats();
      res.json(questionStats);
    } catch (error) {
      console.error("Error fetching question stats:", error);
      res.status(500).json({ message: "Failed to fetch question stats" });
    }
  });

  app.get('/api/analytics/recent', isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const recentResponses = await storage.getRecentResponses(limit);
      res.json(recentResponses);
    } catch (error) {
      console.error("Error fetching recent responses:", error);
      res.status(500).json({ message: "Failed to fetch recent responses" });
    }
  });

  app.get('/api/analytics/reasons', isAuthenticated, async (req, res) => {
    try {
      const topReasons = await storage.getTopReasons();
      res.json(topReasons);
    } catch (error) {
      console.error("Error fetching top reasons:", error);
      res.status(500).json({ message: "Failed to fetch reasons" });
    }
  });

  app.get('/api/analytics/trend', isAuthenticated, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const trend = await storage.getParticipationTrend(days);
      res.json(trend);
    } catch (error) {
      console.error("Error fetching participation trend:", error);
      res.status(500).json({ message: "Failed to fetch trend" });
    }
  });

  // Simple aggregated statistics (public endpoint)
  app.get('/api/stats/simple', async (req, res) => {
    try {
      const stats = await storage.getSimpleStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching simple stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Detailed question statistics (public endpoint)
  app.get('/api/stats/questions', async (req, res) => {
    try {
      const stats = await storage.getDetailedQuestionStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching detailed question stats:", error);
      res.status(500).json({ message: "Failed to fetch question statistics" });
    }
  });

  // Export routes (protected)
  app.get('/api/export/csv', isAuthenticated, async (req, res) => {
    try {
      const responses = await storage.getRecentResponses(10000); // Get all
      
      const csvHeader = 'Zeitstempel,Alter,Geschlecht,Score,Status\n';
      const csvRows = responses.map(r => 
        `${r.completedAt?.toISOString() || 'N/A'},${r.age},${r.gender},${r.score}%,${r.isCompleted ? 'Vollständig' : 'Abgebrochen'}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=sustainability-quiz-export.csv');
      res.send(csvHeader + csvRows);
    } catch (error) {
      console.error("Error generating CSV export:", error);
      res.status(500).json({ message: "Failed to generate export" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
