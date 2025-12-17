import fs from "fs";
import { openai } from "../clients/openaiClient.js";

/**
 * Options for speech-to-text
 */
export interface SpeechOptions {
  language?: string;
}

/**
 * Convert audio file to text using Whisper API
 * Fallback to mock if API unavailable
 *
 * @param filePath Local path to audio file
 * @param options Optional settings (e.g., language)
 */
export async function speechToText(
  filePath: string,
  options?: SpeechOptions
): Promise<string> {
  try {
    // ====== Whisper Integration via centralized OpenAI client ======
    
    // Check if file exists and has content
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      throw new Error("Audio file is empty");
    }
    
    console.log(`Processing audio file: ${filePath}, size: ${stats.size} bytes`);
    
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
      language: options?.language || "en",
    });

    // Clean up the temporary file after processing
    try {
      fs.unlinkSync(filePath);
    } catch (cleanupError) {
      console.warn("Could not clean up temporary file:", cleanupError);
    }

    return transcription.text;
  } catch (error) {
    console.error("Error in speechToText, falling back to mock:", error);
    
    // Clean up the temporary file even on error
    try {
      fs.unlinkSync(filePath);
    } catch (cleanupError) {
      console.warn("Could not clean up temporary file on error:", cleanupError);
    }

    // ====== Mock fallback ======
    // In real integration, remove this mock
    return "[Mock transcription] Audio could not be processed.";
  }
}
