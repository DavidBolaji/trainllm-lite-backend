import { RetrievedContext } from "./retrieveContext";

/**
 * Build a prompt for the LLM using retrieved context
 * 
 * Instructions included:
 * - Only use provided context
 * - Cite sources explicitly
 * - Indicate if answer cannot be found
 * 
 * @param query User question
 * @param retrievedContext Result from RAG retrieval
 * @param language Language of user input (optional)
 * @returns Full prompt text
 */
interface ConversationTurn {
    question: string;
    answer: string;
}

export function buildPrompt(
    query: string,
    retrievedContext: RetrievedContext,
    language: string = "English",
    conversation?: ConversationTurn[]
): string {
    const { contextText } = retrievedContext;

    // Build conversation history if provided
    let conversationHistory = "";
    if (conversation && conversation.length > 0) {
        conversationHistory = "\nCONVERSATION HISTORY:\n";
        conversation.forEach((turn, index) => {
            conversationHistory += `${index + 1}. User: ${turn.question}\n`;
            conversationHistory += `   Assistant: ${turn.answer}\n\n`;
        });
    }

    return `
You are an AI assistant specialized in providing accurate information
about immigration and diaspora services. Answer the user question ONLY using
the context provided below. Do NOT make up information.

If the context doesn't contain enough information to provide a complete answer,
instead of saying "I do not have enough information", ask 2-3 specific follow-up 
questions that would help you provide a better answer. For example:
- What is your current nationality?
- What type of visa are you applying for?
- What is your current immigration status?
- Do you have a job offer?
- What is your educational background?
- How long do you plan to stay?

CONTEXT:
${contextText}
${conversationHistory}
CURRENT USER QUESTION:
${query}

INSTRUCTIONS:
- Respond in clear, natural English
- Consider the conversation history when answering
- If you can answer with the available context, cite source files explicitly, e.g., (Source: uk_visa_faq.txt)
- If context is insufficient, ask 2-3 relevant follow-up questions to gather more details
- Keep responses concise, factual, and helpful
- Avoid hallucinations or assumptions
- Be helpful and guide the user to provide the information needed for a complete answer
- Use information from previous conversation turns to provide more personalized answers
`;
}
