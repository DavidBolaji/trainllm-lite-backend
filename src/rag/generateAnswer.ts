import { RetrievedContext } from "./retrieveContext.js";
import { openai } from "../clients/openaiClient.js";

/**
 * Result returned from the LLM
 */
export interface LLMAnswer {
  text: string;
  sources: string[];
}

/**
 * Generate an answer from OpenAI LLM given a prompt and context
 *
 * @param prompt Full prompt including user query and retrieved context
 * @param retrievedContext The context retrieved from the vector store
 */
export async function generateAnswer(
  prompt: string,
  retrievedContext: RetrievedContext
): Promise<LLMAnswer> {
  try {
    // Call OpenAI's Chat API directly using centralized client
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that answers questions based on provided context. Be concise and factual.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 800,
    });

    const text = completion.choices?.[0]?.message?.content ?? "";

    return {
      text,
      sources: retrievedContext.sources,
    };
  } catch (error) {
    console.error("Error generating answer:", error);
    return {
      text: "Sorry, I could not generate an answer at this time.",
      sources: [],
    };
  }
}
