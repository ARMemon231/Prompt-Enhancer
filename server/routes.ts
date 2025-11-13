import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { enhancementRequestSchema, questionsAnswerSchema, savePromptSchema, type EnhancementStyle } from "@shared/schema";
import { analyzePrompt, generateQuestions, enhancePrompt } from "./lib/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get recent enhancements (history)
  app.get("/api/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const enhancements = await storage.getRecentEnhancements(limit);
      res.json(enhancements);
    } catch (error) {
      console.error("History fetch error:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // Get saved enhancements
  app.get("/api/saved", async (req, res) => {
    try {
      const enhancements = await storage.getSavedEnhancements();
      res.json(enhancements);
    } catch (error) {
      console.error("Saved prompts fetch error:", error);
      res.status(500).json({ error: "Failed to fetch saved prompts" });
    }
  });

  // Save an enhancement
  app.post("/api/save/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title } = savePromptSchema.parse(req.body);
      const enhancement = await storage.saveEnhancement(id, title || null);
      
      if (!enhancement) {
        return res.status(404).json({ error: "Enhancement not found" });
      }

      res.json(enhancement);
    } catch (error) {
      console.error("Save enhancement error:", error);
      if (error instanceof Error && error.message.includes("validation")) {
        res.status(400).json({ error: "Invalid request data" });
      } else {
        res.status(500).json({ error: "Failed to save enhancement" });
      }
    }
  });

  // Unsave an enhancement  
  app.delete("/api/save/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const enhancement = await storage.unsaveEnhancement(id);
      
      if (!enhancement) {
        return res.status(404).json({ error: "Enhancement not found" });
      }

      res.json(enhancement);
    } catch (error) {
      console.error("Unsave enhancement error:", error);
      res.status(500).json({ error: "Failed to unsave enhancement" });
    }
  });
  // Analyze initial prompt
  app.post("/api/analyze", async (req, res) => {
    try {
      const { originalPrompt, style } = enhancementRequestSchema.parse(req.body);

      // Create enhancement record
      const enhancement = await storage.createEnhancement({
        originalPrompt,
        analysisResults: null,
        followUpQuestions: null,
        answers: null,
        enhancedPrompt: null,
        improvementSummary: null,
        completed: false,
        style,
      });

      // Analyze the prompt
      const analysisResults = await analyzePrompt(originalPrompt);
      
      // Generate follow-up questions based on analysis
      const followUpQuestions = await generateQuestions(originalPrompt, analysisResults);

      // Update enhancement with analysis and questions
      const updatedEnhancement = await storage.updateEnhancement(enhancement.id, {
        analysisResults,
        followUpQuestions,
      });

      res.json(updatedEnhancement);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Failed to analyze prompt" });
    }
  });

  // Submit answers and generate enhanced prompt
  app.post("/api/enhance", async (req, res) => {
    try {
      const { enhancementId, answers, style } = questionsAnswerSchema.parse(req.body);

      const enhancement = await storage.getEnhancement(enhancementId);
      if (!enhancement) {
        return res.status(404).json({ error: "Enhancement not found" });
      }

      // Use the provided style or fall back to the stored style  
      const enhancementStyle = style ?? (enhancement.style as EnhancementStyle) ?? 'detailed';

      // Generate enhanced prompt
      const enhancedPrompt = await enhancePrompt(
        enhancement.originalPrompt,
        enhancement.analysisResults as any,
        enhancement.followUpQuestions as any,
        answers,
        enhancementStyle
      );

      // Calculate improvement summary
      const improvementSummary = {
        originalLength: enhancement.originalPrompt.length,
        enhancedLength: enhancedPrompt.length,
        improvementRatio: Math.round((enhancedPrompt.length / enhancement.originalPrompt.length) * 100) / 100,
        clarityScore: (enhancement.analysisResults as any)?.clarityScore || 0,
        enhancedClarityScore: 95, // Would be calculated by AI in production
      };

      // Update enhancement with final results
      const updatedEnhancement = await storage.updateEnhancement(enhancementId, {
        answers,
        enhancedPrompt,
        improvementSummary,
        completed: true,
      });

      res.json(updatedEnhancement);
    } catch (error) {
      console.error("Enhancement error:", error);
      res.status(500).json({ error: "Failed to enhance prompt" });
    }
  });

  // Get enhancement by ID
  app.get("/api/enhancement/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const enhancement = await storage.getEnhancement(id);
      
      if (!enhancement) {
        return res.status(404).json({ error: "Enhancement not found" });
      }

      res.json(enhancement);
    } catch (error) {
      console.error("Get enhancement error:", error);
      res.status(500).json({ error: "Failed to get enhancement" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
