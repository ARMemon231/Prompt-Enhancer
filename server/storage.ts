import { promptEnhancements, type PromptEnhancement, type InsertPromptEnhancement } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createEnhancement(enhancement: InsertPromptEnhancement): Promise<PromptEnhancement>;
  getEnhancement(id: string): Promise<PromptEnhancement | undefined>;
  updateEnhancement(id: string, updates: Partial<PromptEnhancement>): Promise<PromptEnhancement | undefined>;
  getRecentEnhancements(limit?: number): Promise<PromptEnhancement[]>;
  getSavedEnhancements(): Promise<PromptEnhancement[]>;
  saveEnhancement(id: string, title?: string | null): Promise<PromptEnhancement | undefined>;
  unsaveEnhancement(id: string): Promise<PromptEnhancement | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createEnhancement(insertEnhancement: InsertPromptEnhancement): Promise<PromptEnhancement> {
    const [enhancement] = await db
      .insert(promptEnhancements)
      .values(insertEnhancement)
      .returning();
    return enhancement;
  }

  async getEnhancement(id: string): Promise<PromptEnhancement | undefined> {
    const [enhancement] = await db
      .select()
      .from(promptEnhancements)
      .where(eq(promptEnhancements.id, id));
    return enhancement || undefined;
  }

  async updateEnhancement(id: string, updates: Partial<PromptEnhancement>): Promise<PromptEnhancement | undefined> {
    const [enhancement] = await db
      .update(promptEnhancements)
      .set(updates)
      .where(eq(promptEnhancements.id, id))
      .returning();
    return enhancement || undefined;
  }

  async getRecentEnhancements(limit = 10): Promise<PromptEnhancement[]> {
    return db
      .select()
      .from(promptEnhancements)
      .where(eq(promptEnhancements.completed, true))
      .orderBy(desc(promptEnhancements.createdAt))
      .limit(limit);
  }

  async getSavedEnhancements(): Promise<PromptEnhancement[]> {
    return db
      .select()
      .from(promptEnhancements)
      .where(eq(promptEnhancements.saved, true))
      .orderBy(desc(promptEnhancements.createdAt));
  }

  async saveEnhancement(id: string, title?: string | null): Promise<PromptEnhancement | undefined> {
    const [enhancement] = await db
      .update(promptEnhancements)
      .set({ saved: true, title })
      .where(eq(promptEnhancements.id, id))
      .returning();
    return enhancement || undefined;
  }

  async unsaveEnhancement(id: string): Promise<PromptEnhancement | undefined> {
    const [enhancement] = await db
      .update(promptEnhancements)
      .set({ saved: false, title: null })
      .where(eq(promptEnhancements.id, id))
      .returning();
    return enhancement || undefined;
  }
}

export const storage = new DatabaseStorage();
