import fs from "fs";
import path from "path";
import { LLMAnswer } from "../rag/generateAnswer";

const FEEDBACK_FILE = path.join(process.cwd(), "data", "feedback.json");

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface FeedbackEntry {
  question: string;
  answer: string;
  sources: string[];
  ai_score: number; // AI evaluation score (0-1)
  ai_reason: string; // AI evaluation reason
  user_rating?: number; // Optional user rating (1–5 scale)
  timestamp: string;
  language?: string;
}

/**
 * Store automatic AI feedback for every response
 */
export function captureAIFeedback(
  answer: LLMAnswer, 
  question: string, 
  aiScore: number, 
  aiReason: string,
  language?: string
) {
  const entry: FeedbackEntry = {
    question,
    answer: answer.text,
    sources: answer.sources,
    ai_score: aiScore,
    ai_reason: aiReason,
    timestamp: new Date().toISOString(),
    language,
  };

  let existing: FeedbackEntry[] = [];
  if (fs.existsSync(FEEDBACK_FILE)) {
    existing = JSON.parse(fs.readFileSync(FEEDBACK_FILE, "utf-8"));
  }

  existing.push(entry);
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(existing, null, 2));

  console.log(`[feedback] AI evaluation stored - Score: ${aiScore}, Question: ${question.substring(0, 50)}...`);
}

/**
 * Store user feedback (optional - for manual ratings)
 */
export function captureUserFeedback(answer: LLMAnswer, question: string, user_rating: number) {
  // Find the most recent entry for this question and update it
  let existing: FeedbackEntry[] = [];
  if (fs.existsSync(FEEDBACK_FILE)) {
    existing = JSON.parse(fs.readFileSync(FEEDBACK_FILE, "utf-8"));
  }

  // Find the matching entry (most recent with same question)
  const matchingIndex = existing.findIndex(entry => 
    entry.question === question && entry.answer === answer.text
  );

  if (matchingIndex !== -1) {
    existing[matchingIndex].user_rating = user_rating;
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(existing, null, 2));
    console.log("[feedback] User rating added to existing entry");
  } else {
    console.log("[feedback] No matching entry found for user rating");
  }
}
