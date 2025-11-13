CREATE TABLE "prompt_enhancements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_prompt" text NOT NULL,
	"analysis_results" jsonb,
	"follow_up_questions" jsonb,
	"answers" jsonb,
	"enhanced_prompt" text,
	"improvement_summary" jsonb,
	"created_at" timestamp DEFAULT now(),
	"completed" boolean DEFAULT false,
	"saved" boolean DEFAULT false,
	"title" text,
	"style" varchar(20) DEFAULT 'detailed'
);
