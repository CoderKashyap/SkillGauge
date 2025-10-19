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
import { eq, desc } from "drizzle-orm";

import { v4 as uuidv4 } from "uuid";

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
  // ===== USERS =====
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

  // async createUser(insertUser: InsertUser): Promise<User> {
  //   // ✅ Insert the user
  //   const result = await db.insert(users).values(insertUser);

  //   // ✅ Get the inserted ID from MySQL driver (drizzle-mysql returns an object like { insertId })
  //   const insertedId = (result as any).insertId;

  //   // ✅ Fetch the newly created user
  //   const [newUser] = await db.select().from(users).where(eq(users.id, insertedId));

  //   // ✅ Return the user for token generation
  //   return newUser;
  // }


  async createUser(insertUser: InsertUser): Promise<User> {
    const id = uuidv4();

    await db.insert(users).values({ id, ...insertUser });

    const [newUser] = await db.select().from(users).where(eq(users.id, id));

    return newUser;
  }


  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.id));
  }

  // ===== SKILLS =====
  async getAllSkills(): Promise<Skill[]> {
    return db.select().from(skills).orderBy(skills.name);
  }

  async getSkill(id: string): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill || undefined;
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const result = await db.insert(skills).values(insertSkill);
    const insertedId = (result as any).insertId;

    const [skill] = await db.select().from(skills).where(eq(skills.id, insertedId));
    return skill;
  }

  async updateSkill(id: string, insertSkill: InsertSkill): Promise<Skill | undefined> {
    await db.update(skills).set(insertSkill).where(eq(skills.id, id));
    const [updatedSkill] = await db.select().from(skills).where(eq(skills.id, id));
    return updatedSkill || undefined;
  }

  async deleteSkill(id: string): Promise<void> {
    await db.delete(skills).where(eq(skills.id, id));
  }

  // ===== QUESTIONS =====
  async getAllQuestions(): Promise<Question[]> {
    return db.select().from(questions).orderBy(desc(questions.id));
  }

  async getQuestionsBySkill(skillId: string): Promise<Question[]> {
    return db.select().from(questions).where(eq(questions.skillId, skillId));
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question || undefined;
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const result = await db.insert(questions).values(insertQuestion);
    const insertedId = (result as any).insertId;

    const [question] = await db.select().from(questions).where(eq(questions.id, insertedId));
    return question;
  }

  async updateQuestion(id: string, insertQuestion: InsertQuestion): Promise<Question | undefined> {
    await db.update(questions).set(insertQuestion).where(eq(questions.id, id));
    const [updatedQuestion] = await db.select().from(questions).where(eq(questions.id, id));
    return updatedQuestion || undefined;
  }

  async deleteQuestion(id: string): Promise<void> {
    await db.delete(questions).where(eq(questions.id, id));
  }

  // ===== QUIZ ATTEMPTS =====
  // async createQuizAttempt(insertAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
  //   const result = await db.insert(quizAttempts).values(insertAttempt);
  //   const insertedId = (result as any).insertId;

  //   const [attempt] = await db.select().from(quizAttempts).where(eq(quizAttempts.id, insertedId));

  //   console.log(attempt, "attemptSto");

  //   return attempt;
  // }


  // async createQuizAttempt(insertAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
  //   // 1. Insert row
  //   const result: any = await db.insert(quizAttempts).values(insertAttempt);

  //   // 2. Get insertId from first element
  //   const insertedId = result?.[0]?.insertId;
  //   if (!insertedId) throw new Error("Failed to get inserted quiz attempt ID");

  //   // 3. Fetch the inserted row
  //   const [attempt] = await db.select().from(quizAttempts).where(eq(quizAttempts.id, insertedId));
  //   if (!attempt) throw new Error("Inserted quiz attempt not found");

  //   console.log("Attempt fetched:", attempt);
  //   return attempt;
  // }

  async createQuizAttempt(insertAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
    // Generate UUID if not provided
    const id = uuidv4();

    // Insert row with the generated ID
    await db.insert(quizAttempts).values({ ...insertAttempt, id });

    // Fetch the inserted row
    const [attempt] = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.id, id));

    if (!attempt) throw new Error("Inserted quiz attempt not found");

    console.log("Attempt fetched:", attempt);
    return attempt;
  }

  async createQuizAnswer(insertAnswer: InsertQuizAnswer): Promise<QuizAnswer> {
    const id = uuidv4();

    await db.insert(quizAnswers).values({ ...insertAnswer, id });

    const [answer] = await db
      .select()
      .from(quizAnswers)
      .where(eq(quizAnswers.id, id));

    if (!answer) throw new Error("Inserted quiz answer not found");

    return answer;
  }

  // async createQuizAttempt(insertAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
  //   // 1. Insert row
  //   const result: any = await db.insert(quizAttempts).values(insertAttempt);

  //   // 2. Extract insertId correctly (Drizzle returns { insertId })
  //   const insertedId = result?.insertId;
  //   if (!insertedId) throw new Error("Failed to get inserted quiz attempt ID");

  //   // 3. Fetch the inserted row
  //   const [attempt] = await db
  //     .select()
  //     .from(quizAttempts)
  //     .where(eq(quizAttempts.id, insertedId));

  //   if (!attempt) throw new Error("Inserted quiz attempt not found");

  //   console.log("Attempt fetched:", attempt);
  //   return attempt;
  // }


  // async createQuizAnswer(insertAnswer: InsertQuizAnswer): Promise<QuizAnswer> {
  //   const result: any = await db.insert(quizAnswers).values(insertAnswer);

  //   const insertedId = result?.[0]?.insertId;
  //   if (!insertedId) throw new Error("Failed to get inserted quiz answer ID");

  //   const [answer] = await db.select().from(quizAnswers).where(eq(quizAnswers.id, insertedId));
  //   if (!answer) throw new Error("Inserted quiz answer not found");

  //   return answer;
  // }


  async getUserAttempts(userId: string): Promise<QuizAttempt[]> {
    return db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .orderBy(desc(quizAttempts.id));
  }

  async getAllAttempts(): Promise<QuizAttempt[]> {
    return db.select().from(quizAttempts).orderBy(desc(quizAttempts.id));
  }






  async getAttemptAnswers(attemptId: string): Promise<QuizAnswer[]> {
    return db.select().from(quizAnswers).where(eq(quizAnswers.attemptId, attemptId));
  }
}

export const storage = new DatabaseStorage();
