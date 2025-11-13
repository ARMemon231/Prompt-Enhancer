import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const promptEnhancements = pgTable("prompt_enhancements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalPrompt: text("original_prompt").notNull(),
  analysisResults: jsonb("analysis_results"),
  followUpQuestions: jsonb("follow_up_questions"),
  answers: jsonb("answers"),
  enhancedPrompt: text("enhanced_prompt"),
  improvementSummary: jsonb("improvement_summary"),
  createdAt: timestamp("created_at").defaultNow(),
  completed: boolean("completed").default(false),
  saved: boolean("saved").default(false),
  title: text("title"), // Optional title for saved prompts
  style: varchar("style", { length: 20 }).default("detailed"), // Enhancement style
});

export const insertPromptEnhancementSchema = createInsertSchema(promptEnhancements).omit({
  id: true,
  createdAt: true,
});

export const analysisSchema = z.object({
  summary: z.string(),
  gaps: z.array(z.string()),
  weaknesses: z.array(z.string()),
  clarityScore: z.number().min(0).max(100),
});

export const questionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(['text', 'choice', 'scale', 'checkbox']),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(true),
});

export const answerSchema = z.object({
  questionId: z.string(),
  answer: z.union([z.string(), z.array(z.string()), z.number()]),
});

export const enhancementStyleSchema = z.enum(['detailed', 'creative', 'technical', 'conversational']);

export const enhancementRequestSchema = z.object({
  originalPrompt: z.string().min(1, "Prompt is required"),
  style: enhancementStyleSchema.optional().default('detailed'),
});

export const questionsAnswerSchema = z.object({
  enhancementId: z.string(),
  answers: z.array(answerSchema),
  style: enhancementStyleSchema.optional(),
});

export type InsertPromptEnhancement = z.infer<typeof insertPromptEnhancementSchema>;
export type PromptEnhancement = typeof promptEnhancements.$inferSelect;
export type AnalysisResult = z.infer<typeof analysisSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Answer = z.infer<typeof answerSchema>;
export type EnhancementRequest = z.infer<typeof enhancementRequestSchema>;
export const savePromptSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title too long").optional(),
});

export type QuestionsAnswer = z.infer<typeof questionsAnswerSchema>;
export type SavePromptRequest = z.infer<typeof savePromptSchema>;
export type EnhancementStyle = z.infer<typeof enhancementStyleSchema>;
