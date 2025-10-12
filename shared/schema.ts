import { sql, relations } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  text,
  int,
  datetime,
  boolean,
  json,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`(UUID())`), // MySQL UUID generator
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Skill categories
export const skills = mysqlTable("skills", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`(UUID())`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Questions linked to skills
export const questions = mysqlTable("questions", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`(UUID())`),
  skillId: varchar("skill_id", { length: 36 })
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  options: json("options").notNull().$type<string[]>(),
  correctAnswer: text("correct_answer").notNull(),
  difficulty: varchar("difficulty", { length: 20 })
    .notNull()
    .default("medium"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Quiz attempts
export const quizAttempts = mysqlTable("quiz_attempts", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  skillId: varchar("skill_id", { length: 36 })
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
  score: int("score").notNull(),
  totalQuestions: int("total_questions").notNull(),
  startedAt: datetime("started_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  completedAt: datetime("completed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Individual quiz answers
export const quizAnswers = mysqlTable("quiz_answers", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`(UUID())`),
  attemptId: varchar("attempt_id", { length: 36 })
    .notNull()
    .references(() => quizAttempts.id, { onDelete: "cascade" }),
  questionId: varchar("question_id", { length: 36 })
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  selectedAnswer: text("selected_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  quizAttempts: many(quizAttempts),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  questions: many(questions),
  quizAttempts: many(quizAttempts),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  skill: one(skills, {
    fields: [questions.skillId],
    references: [skills.id],
  }),
  quizAnswers: many(quizAnswers),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one, many }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [quizAttempts.skillId],
    references: [skills.id],
  }),
  answers: many(quizAnswers),
}));

export const quizAnswersRelations = relations(quizAnswers, ({ one }) => ({
  attempt: one(quizAttempts, {
    fields: [quizAnswers.attemptId],
    references: [quizAttempts.id],
  }),
  question: one(questions, {
    fields: [quizAnswers.questionId],
    references: [questions.id],
  }),
}));

// Insert schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  role: z.enum(["admin", "user"]).optional(),
}).omit({ id: true, createdAt: true });

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions, {
  options: z.array(z.string()).min(2).max(6),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
}).omit({ id: true, createdAt: true });

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertQuizAnswerSchema = createInsertSchema(quizAnswers).omit({
  id: true,
  createdAt: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;

export type QuizAnswer = typeof quizAnswers.$inferSelect;
export type InsertQuizAnswer = z.infer<typeof insertQuizAnswerSchema>;

export type LoginCredentials = z.infer<typeof loginSchema>;
