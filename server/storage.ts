import { 
  users, 
  skills, 
  questions, 
  quizAttempts, 
  quizAnswers,
  type User, 
  type InsertUser,
  type Skill,
  type InsertSkill,
  type Question,
  type InsertQuestion,
  type QuizAttempt,
  type InsertQuizAttempt,
  type QuizAnswer,
  type InsertQuizAnswer,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Skills
  getAllSkills(): Promise<Skill[]>;
  getSkill(id: string): Promise<Skill | undefined>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: string, skill: InsertSkill): Promise<Skill | undefined>;
  deleteSkill(id: string): Promise<void>;

  // Questions
  getAllQuestions(): Promise<Question[]>;
  getQuestionsBySkill(skillId: string): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: string, question: InsertQuestion): Promise<Question | undefined>;
  deleteQuestion(id: string): Promise<void>;

  // Quiz Attempts
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getUserAttempts(userId: string): Promise<QuizAttempt[]>;
  getAllAttempts(): Promise<QuizAttempt[]>;

  // Quiz Answers
  createQuizAnswer(answer: InsertQuizAnswer): Promise<QuizAnswer>;
  getAttemptAnswers(attemptId: string): Promise<QuizAnswer[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Skills
  async getAllSkills(): Promise<Skill[]> {
    return db.select().from(skills).orderBy(skills.name);
  }

  async getSkill(id: string): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill || undefined;
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const [skill] = await db
      .insert(skills)
      .values(insertSkill)
      .returning();
    return skill;
  }

  async updateSkill(id: string, insertSkill: InsertSkill): Promise<Skill | undefined> {
    const [skill] = await db
      .update(skills)
      .set(insertSkill)
      .where(eq(skills.id, id))
      .returning();
    return skill || undefined;
  }

  async deleteSkill(id: string): Promise<void> {
    await db.delete(skills).where(eq(skills.id, id));
  }

  // Questions
  async getAllQuestions(): Promise<Question[]> {
    return db.select().from(questions).orderBy(desc(questions.createdAt));
  }

  async getQuestionsBySkill(skillId: string): Promise<Question[]> {
    return db.select().from(questions).where(eq(questions.skillId, skillId));
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question || undefined;
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db
      .insert(questions)
      .values(insertQuestion)
      .returning();
    return question;
  }

  async updateQuestion(id: string, insertQuestion: InsertQuestion): Promise<Question | undefined> {
    const [question] = await db
      .update(questions)
      .set(insertQuestion)
      .where(eq(questions.id, id))
      .returning();
    return question || undefined;
  }

  async deleteQuestion(id: string): Promise<void> {
    await db.delete(questions).where(eq(questions.id, id));
  }

  // Quiz Attempts
  async createQuizAttempt(insertAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [attempt] = await db
      .insert(quizAttempts)
      .values(insertAttempt)
      .returning();
    return attempt;
  }

  async getUserAttempts(userId: string): Promise<QuizAttempt[]> {
    return db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .orderBy(desc(quizAttempts.completedAt));
  }

  async getAllAttempts(): Promise<QuizAttempt[]> {
    return db
      .select()
      .from(quizAttempts)
      .orderBy(desc(quizAttempts.completedAt));
  }

  // Quiz Answers
  async createQuizAnswer(insertAnswer: InsertQuizAnswer): Promise<QuizAnswer> {
    const [answer] = await db
      .insert(quizAnswers)
      .values(insertAnswer)
      .returning();
    return answer;
  }

  async getAttemptAnswers(attemptId: string): Promise<QuizAnswer[]> {
    return db
      .select()
      .from(quizAnswers)
      .where(eq(quizAnswers.attemptId, attemptId));
  }
}

export const storage = new DatabaseStorage();
