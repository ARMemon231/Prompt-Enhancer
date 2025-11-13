import { GoogleGenAI } from "@google/genai";
import { type AnalysisResult, type Question, type Answer, type EnhancementStyle } from "@shared/schema";

// Using Gemini 2.5 Pro - the newest Gemini model series
const genai = new GoogleGenAI({ 
  apiKey: process.env.GOOGLE_API_KEY
});

console.log("🔍 AI Configuration:");
console.log(`   Google API Key: ${process.env.GOOGLE_API_KEY ? "✓ Configured" : "✗ Missing"}`);
console.log(`   Using: Real Gemini API Only (No Mock)\n`);

export async function analyzePrompt(prompt: string): Promise<AnalysisResult> {
  try {
    console.log("🤖 Calling Gemini API for analysis...");

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            gaps: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            clarityScore: { type: "number" }
          },
          required: ["summary", "gaps", "weaknesses", "clarityScore"]
        }
      },
      contents: `You are a prompt analysis expert. Analyze the given prompt and identify its weaknesses, ambiguities, and missing elements.

Analyze this prompt: "${prompt}"

Respond with JSON containing:
- summary: Brief analysis summary
- gaps: Array of identified gaps
- weaknesses: Array of weaknesses  
- clarityScore: Number between 0 and 100`
    });

    const result = JSON.parse(response.text || "{}");
    
    console.log("✅ Analysis complete");
    
    return {
      summary: result.summary || "Unable to analyze prompt",
      gaps: result.gaps || [],
      weaknesses: result.weaknesses || [],
      clarityScore: Math.max(0, Math.min(100, result.clarityScore || 0)),
    };
  } catch (error) {
    console.error("❌ Gemini analysis error:", error);
    throw new Error("Failed to analyze prompt with AI");
  }
}

export async function generateQuestions(originalPrompt: string, analysis: AnalysisResult): Promise<Question[]> {
  try {
    console.log("🤖 Calling Gemini API for questions...");

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  question: { type: "string" },
                  type: { type: "string" },
                  options: { type: "array", items: { type: "string" } }
                },
                required: ["id", "question", "type"]
              }
            }
          },
          required: ["questions"]
        }
      },
      contents: `You are an expert at generating clarifying questions to improve prompts. Based on the original prompt and analysis, generate 3-5 targeted questions that will help gather missing information.

Original prompt: "${originalPrompt}"

Analysis summary: ${analysis.summary}
Identified gaps: ${analysis.gaps.join(", ")}
Weaknesses: ${analysis.weaknesses.join(", ")}

Generate targeted clarifying questions to address these issues. Each question should have:
- id: unique identifier 
- question: the question text
- type: one of "text", "choice", "scale", "checkbox"
- options: array of options (only for choice/checkbox types)

Respond with JSON containing a "questions" array.`
    });

    const result = JSON.parse(response.text || "{}");
    
    console.log("✅ Questions generated");
    
    return (result.questions || []).map((q: any, index: number) => ({
      id: q.id || `q${index + 1}`,
      question: q.question || "What additional information can you provide?",
      type: q.type || "text",
      options: q.options || undefined,
      required: true,
    }));
  } catch (error) {
    console.error("❌ Gemini questions error:", error);
    throw new Error("Failed to generate questions with AI");
  }
}

const styleInstructions = {
  detailed: `The enhanced prompt should be:
- Extremely detailed and comprehensive
- Include all necessary context and background information
- Define clear success criteria and specifications
- Specify all constraints, requirements, and edge cases
- Provide step-by-step guidance when applicable
- Be thorough and leave nothing to interpretation`,

  creative: `The enhanced prompt should be:
- Inspiring and imaginative
- Encourage creative thinking and innovative solutions  
- Use vivid, engaging language
- Focus on possibilities and artistic expression
- Allow for multiple interpretations and approaches
- Emphasize originality and unique perspectives`,

  technical: `The enhanced prompt should be:
- Precise and technical in nature
- Include specific technical requirements and constraints
- Use industry-standard terminology and specifications
- Define clear metrics and measurable outcomes
- Focus on implementation details and best practices
- Be structured logically for technical execution`,

  conversational: `The enhanced prompt should be:
- Written in a natural, conversational tone
- Easy to understand and approachable
- Use everyday language while being clear
- Feel like guidance from a helpful colleague
- Be engaging and personable
- Balance clarity with warmth and accessibility`
};

export async function enhancePrompt(
  originalPrompt: string,
  analysis: AnalysisResult | null,
  questions: Question[] | null,
  answers: Answer[],
  style: EnhancementStyle = 'detailed'
): Promise<string> {
  try {
    console.log("🤖 Calling Gemini API for enhancement...");

    const answersText = answers.map(a => 
      `Q: ${questions?.find(q => q.id === a.questionId)?.question || "Unknown"}
       A: ${Array.isArray(a.answer) ? a.answer.join(", ") : a.answer}`
    ).join("\n\n");

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a prompt enhancement expert. Take the original prompt and the user's answers to clarifying questions, then create a comprehensive, well-structured prompt that addresses all the identified gaps and weaknesses.

Style: ${style}
${styleInstructions[style]}

Original prompt: "${originalPrompt}"

Analysis issues identified: ${analysis?.gaps.join(", ") || "None"}

User's answers to clarifying questions:
${answersText}

Create an enhanced version of this prompt that incorporates all the additional information, addresses the identified issues, and follows the specified style guidelines. The enhanced prompt should be engaging and effective for the chosen style. Return only the enhanced prompt text, no additional formatting or explanation.`
    });

    console.log("✅ Enhancement complete");
    
    return response.text || originalPrompt;
  } catch (error) {
    console.error("❌ Gemini enhancement error:", error);
    throw new Error("Failed to enhance prompt with AI");
  }
}
