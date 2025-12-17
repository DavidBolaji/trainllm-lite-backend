import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
