import express from "express";
import type { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import { workflowRouter } from "../workflows/router";
import { speechToText } from "../services/speechToText";
import { translateText } from "../services/translate";
import { captureAIFeedback, captureUserFeedback } from "../eval/feedback";
import { evaluateResponse } from "../eval/evaluateResponse";

const router = express.Router();
const upload = multer({ 
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      // Generate unique filename with proper extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      let extension = '.webm'; // default
      
      if (file.originalname.endsWith('.mp4')) {
        extension = '.mp4';
      } else if (file.originalname.endsWith('.ogg')) {
        extension = '.ogg';
      } else if (file.originalname.endsWith('.wav')) {
        extension = '.wav';
      } else if (file.originalname.endsWith('.webm')) {
        extension = '.webm';
      }
      
      cb(null, 'audio-' + uniqueSuffix + extension);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      const error = new Error('Only audio files are allowed') as any;
      error.code = 'INVALID_FILE_TYPE';
      cb(error, false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
}); // temp storage for audio files

// Text question route
router.post("/question", async (req: Request, res:Response) => {
  try {
    const { question, language, conversation } = req.body;
    
    // 1. Translate question to English if not already English
    let englishQuestion = question;
    if (language && language !== 'en' && language !== 'English') {
      englishQuestion = await translateText(question, "English");
    }
    
    // 2. Translate conversation history to English if exists
    let englishConversation = conversation;
    if (conversation && language && language !== 'en' && language !== 'English') {
      englishConversation = await Promise.all(
        conversation.map(async (turn: any) => ({
          question: await translateText(turn.question, "English"),
          answer: await translateText(turn.answer, "English")
        }))
      );
    }
    
    // 3. Run RAG pipeline in English
    const answer = await workflowRouter(englishQuestion, englishConversation, "English");
    
    // 4. Translate response back to user language if not English
    let finalAnswer = answer.answer;
    if (language && language !== 'en' && language !== 'English') {
      const languageMap: { [key: string]: string } = {
        'fr': 'French',
        'yo': 'Yoruba', 
        'ar': 'Arabic',
        'sw': 'Swahili',
        'am': 'Amharic'
      };
      const targetLanguage = languageMap[language] || language;
      finalAnswer = await translateText(answer.answer, targetLanguage);
    }
    
    // 5. Evaluate response quality and store feedback
    const evaluation = await evaluateResponse(
      { text: answer.answer, sources: answer.sources }, 
      question, 
      language || "English"
    );
    captureAIFeedback(
      { text: finalAnswer, sources: answer.sources },
      question,
      evaluation.overallScore,
      evaluation.reasons.join("; "),
      language
    );
    
    res.json({ answer: finalAnswer, intent: answer.intent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Audio question route
router.post("/audio", upload.single("audio"), async (req:Request, res:Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No audio uploaded" });

    console.log("Audio file received:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    // Get language from request body (sent as form data)
    const userLanguage = req.body.language || "en";

    // 1. Speech → Text (in original language)
    let text = await speechToText(req.file.path, { language: userLanguage });

    console.log("Transcribed text:", text);

    // 2. Translate to English for RAG processing
    const englishText = await translateText(text, "English");

    // 3. Run RAG workflow in English
    const answer = await workflowRouter(englishText, undefined, "English");

    // 4. Translate response back to user language if not English
    let finalAnswer = answer.answer;
    if (userLanguage && userLanguage !== 'en' && userLanguage !== 'English') {
      const languageMap: { [key: string]: string } = {
        'fr': 'French',
        'yo': 'Yoruba',
        'ar': 'Arabic', 
        'sw': 'Swahili',
        'am': 'Amharic'
      };
      const targetLanguage = languageMap[userLanguage] || userLanguage;
      finalAnswer = await translateText(answer.answer, targetLanguage);
    }

    // 5. Evaluate response quality and store feedback
    const evaluation = await evaluateResponse(
      { text: answer.answer, sources: answer.sources }, 
      text, // Original transcribed question
      userLanguage || "English"
    );
    captureAIFeedback(
      { text: finalAnswer, sources: answer.sources },
      text, // Original transcribed question
      evaluation.overallScore,
      evaluation.reasons.join("; "),
      userLanguage
    );

    res.json({ answer: finalAnswer, intent: answer.intent });
  } catch (err) {
    console.error("Audio processing error:", err);
    
    // Clean up file if it still exists
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn("Could not clean up file on error:", cleanupError);
      }
    }
    
    res.status(500).json({ error: "Internal server error" });
  }
});

// Feedback route (for optional user ratings)
router.post("/feedback", (req: Request, res: Response) => {
  try {
    const { question, answer, sources, rating } = req.body;
    captureUserFeedback({ text: answer, sources }, question, rating);
    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
