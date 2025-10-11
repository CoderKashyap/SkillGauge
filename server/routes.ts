import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { 
  insertUserSchema, 
  loginSchema, 
  insertSkillSchema, 
  insertQuestionSchema,
  type User 
} from "@shared/schema";
import { generateToken, authenticate, requireAdmin, type AuthRequest } from "./middleware/auth";

// Simple in-memory cache for reports
const reportCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedData(key: string): any | null {
  const cached = reportCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  reportCache.delete(key);
  return null;
}

function setCachedData(key: string, data: any): void {
  reportCache.set(key, { data, timestamp: Date.now() });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      const token = generateToken(user);
      const { password, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(data.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user);
      const { password, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // Skills Routes
  app.get("/api/skills", async (req, res) => {
    try {
      const skills = await storage.getAllSkills();
      res.json(skills);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/skills/:id", async (req, res) => {
    try {
      const skill = await storage.getSkill(req.params.id);
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      res.json(skill);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/skills", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const data = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(data);
      res.json(skill);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/skills/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const data = insertSkillSchema.parse(req.body);
      const skill = await storage.updateSkill(req.params.id, data);
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      res.json(skill);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/skills/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      await storage.deleteSkill(req.params.id);
      res.json({ message: "Skill deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Questions Routes
  app.get("/api/questions", authenticate, async (req: AuthRequest, res) => {
    try {
      const questions = await storage.getAllQuestions();
      
      // Include skill data for each question
      const questionsWithSkills = await Promise.all(
        questions.map(async (question) => {
          const skill = await storage.getSkill(question.skillId);
          return { ...question, skill };
        })
      );
      
      res.json(questionsWithSkills);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/questions/by-skill/:skillId", authenticate, async (req: AuthRequest, res) => {
    try {
      const questions = await storage.getQuestionsBySkill(req.params.skillId);
      res.json(questions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/questions", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const data = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(data);
      res.json(question);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/questions/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const data = insertQuestionSchema.parse(req.body);
      const question = await storage.updateQuestion(req.params.id, data);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.json(question);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/questions/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      await storage.deleteQuestion(req.params.id);
      res.json({ message: "Question deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Users Routes
  app.get("/api/users", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Quiz Attempts Routes
  app.post("/api/quiz-attempts", authenticate, async (req: AuthRequest, res) => {
    try {
      const { skillId, answers } = req.body;
      
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get all questions for the skill
      const questions = await storage.getQuestionsBySkill(skillId);
      
      if (questions.length === 0) {
        return res.status(400).json({ message: "No questions available for this skill" });
      }

      // Calculate score
      let score = 0;
      const quizAnswersData = [];

      for (const answer of answers) {
        const question = questions.find(q => q.id === answer.questionId);
        if (question) {
          const isCorrect = answer.selectedAnswer === question.correctAnswer;
          if (isCorrect) score++;
          
          quizAnswersData.push({
            questionId: answer.questionId,
            selectedAnswer: answer.selectedAnswer,
            isCorrect,
          });
        }
      }

      // Create quiz attempt
      const attempt = await storage.createQuizAttempt({
        userId: req.user.id,
        skillId,
        score,
        totalQuestions: questions.length,
      });

      // Save individual answers
      for (const answerData of quizAnswersData) {
        await storage.createQuizAnswer({
          attemptId: attempt.id,
          ...answerData,
        });
      }

      // Invalidate cache
      reportCache.clear();

      res.json(attempt);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/quiz-attempts/my-attempts", authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const cacheKey = `user-attempts-${req.user.id}`;
      const cached = getCachedData(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const attempts = await storage.getUserAttempts(req.user.id);
      
      // Include skill data
      const attemptsWithSkills = await Promise.all(
        attempts.map(async (attempt) => {
          const skill = await storage.getSkill(attempt.skillId);
          return { ...attempt, skill };
        })
      );

      setCachedData(cacheKey, attemptsWithSkills);
      res.json(attemptsWithSkills);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/quiz-attempts/all", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const cacheKey = "all-attempts";
      const cached = getCachedData(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const attempts = await storage.getAllAttempts();
      
      // Include user and skill data
      const attemptsWithRelations = await Promise.all(
        attempts.map(async (attempt) => {
          const user = await storage.getUser(attempt.userId);
          const skill = await storage.getSkill(attempt.skillId);
          return { ...attempt, user, skill };
        })
      );

      setCachedData(cacheKey, attemptsWithRelations);
      res.json(attemptsWithRelations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
