# Prompt Enhancer

## Overview

This is a full-stack web application that uses AI to analyze and enhance user prompts through an interactive workflow. The system takes an initial prompt, analyzes it for weaknesses and gaps, asks follow-up questions to gather more context, and then generates an improved version of the original prompt. Built with a React frontend, Express backend, and integrates with Google's Gemini AI API for intelligent prompt analysis and enhancement.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints for prompt analysis and enhancement
- **Data Storage**: In-memory storage using a custom MemStorage class (designed to be easily replaceable with database storage)
- **AI Integration**: Google Gemini 2.5 Pro API for prompt analysis and question generation
- **Development**: Hot module replacement with Vite integration in development mode

### Database Schema
The application uses Drizzle ORM with PostgreSQL schema definitions, though currently implemented with in-memory storage:
- **prompt_enhancements** table storing the complete enhancement workflow state
- JSON fields for storing analysis results, questions, answers, and improvement summaries
- UUID primary keys with timestamps for tracking enhancement sessions

### API Endpoints
- `POST /api/analyze` - Analyzes initial prompt and generates follow-up questions
- `POST /api/enhance` - Processes answers and generates enhanced prompt

### User Workflow
1. **Prompt Input**: User submits initial prompt for analysis
2. **AI Analysis**: System analyzes prompt for gaps, weaknesses, and clarity score
3. **Follow-up Questions**: AI generates contextual questions based on analysis
4. **Answer Collection**: User responds to questions with various input types
5. **Enhancement Generation**: AI creates improved prompt with summary of changes

### Development Features
- Hot reload with Vite development server
- TypeScript strict mode with path aliases
- Comprehensive error handling and logging
- Mobile-responsive design with dark mode support

## External Dependencies

### Core Technologies
- **Node.js Runtime**: ESM modules with TypeScript compilation
- **React**: Frontend framework with hooks and context
- **Express.js**: Backend web server framework

### Database & ORM
- **Drizzle ORM**: Type-safe database queries and schema management
- **PostgreSQL**: Primary database (configured but using in-memory storage currently)
- **@neondatabase/serverless**: Neon database driver for PostgreSQL

### AI Services
- **Google Gemini API**: AI model for prompt analysis and enhancement using @google/genai package
- **Structured Output**: JSON schema validation for AI responses

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component system

### Development Tools
- **Vite**: Build tool and development server with HMR
- **TypeScript**: Static type checking and compilation
- **ESBuild**: Fast JavaScript bundler for production builds

### Additional Libraries
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation for TypeScript
- **Wouter**: Lightweight routing library
- **Date-fns**: Date manipulation utilities