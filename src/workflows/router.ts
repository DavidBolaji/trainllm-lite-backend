import { detectIntent, Intent } from "./detectIntent";
import { askQuestion } from "../rag/ragPipline";

interface ConversationTurn {
  question: string;
  answer: string;
}

/**
 * Example router for RAG + workflow automation
 */
export async function workflowRouter(
  userQuestion: string,
  conversation?: ConversationTurn[],
  language: string = "English"
): Promise<{ answer: string; intent: Intent; sources: string[] }> {
  const intent = await detectIntent(userQuestion);

  if (intent === "visa_eligibility") {
    // Potential follow-up questions or validation
    // Example: ask user for country, visa type, etc.
    // For demo, just run RAG pipeline
    const ragResult = await askQuestion(userQuestion, language, conversation);
    return { answer: ragResult.text, intent, sources: ragResult.sources };
  } else {
    // Normal RAG
    const ragResult = await askQuestion(userQuestion, language, conversation);
    return { answer: ragResult.text, intent, sources: ragResult.sources };
  }
}
