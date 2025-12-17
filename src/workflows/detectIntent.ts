import { openai } from "../clients/openaiClient";

export type Intent =
  | "visa_eligibility"
  | "document_requirements"
  | "general_info";

/**
 * Detect intent of a user question
 */
export async function detectIntent(question: string): Promise<Intent> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You classify user questions into predefined intents. Respond with ONLY one intent value.",
        },
        {
          role: "user",
          content: `
Classify the intent of the following question into ONE of:
- visa_eligibility
- document_requirements
- general_info

Question: "${question}"

Respond with ONLY the intent name.
          `,
        },
      ],
      temperature: 0,
      max_tokens: 10,
    });

    const intent =
      completion.choices?.[0]?.message?.content
        ?.trim()
        .toLowerCase() as Intent;

    // Safety fallback if LLM outputs something unexpected
    if (
      intent !== "visa_eligibility" &&
      intent !== "document_requirements" &&
      intent !== "general_info"
    ) {
      return "general_info";
    }

    return intent;
  } catch (error) {
    console.error("Error in detectIntent:", error);
    return "general_info";
  }
}
