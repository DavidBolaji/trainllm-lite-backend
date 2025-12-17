import { openai } from "../clients/openaiClient.js";

/**
 * Translate text to target language
 *
 * @param text Text to translate
 * @param targetLanguage Language to translate into (e.g., "English", "French")
 */
export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  try {
    const prompt = `Translate the following text to ${targetLanguage}:\n\n${text}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful translator." },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_tokens: 1000,
    });

    const translated = completion.choices?.[0]?.message?.content ?? text;
    return translated;
  } catch (error) {
    console.error("Error in translateText:", error);
    // Fallback: return original text if translation fails
    return text;
  }
}
