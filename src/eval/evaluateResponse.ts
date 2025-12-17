import { LLMAnswer } from "../rag/generateAnswer.js";
import { openai } from "../clients/openaiClient.js";

export interface DetailedEvaluation {
  overallScore: number;
  legalAccuracy: number;
  completeness: number;
  clarity: number;
  actionability: number;
  translationQuality: number;
  reasons: string[];
  recommendations: string[];
}

/**
 * Enhanced AI-powered evaluation of response quality
 */
export async function evaluateResponse(
  answer: LLMAnswer, 
  originalQuestion: string,
  userLanguage: string = "English"
): Promise<DetailedEvaluation> {
  try {
    // Basic heuristic checks
    const basicEval = performBasicEvaluation(answer);
    
    // AI-powered detailed evaluation
    const aiEval = await performAIEvaluation(answer, originalQuestion, userLanguage);
    
    // Combine evaluations
    return combineEvaluations(basicEval, aiEval);
  } catch (error) {
    console.error("Error in evaluateResponse:", error);
    // Fallback to basic evaluation
    return performBasicEvaluation(answer);
  }
}

/**
 * Basic heuristic evaluation (fast, no API calls)
 */
function performBasicEvaluation(answer: LLMAnswer): DetailedEvaluation {
  let overallScore = 1.0;
  const reasons: string[] = [];
  const recommendations: string[] = [];

  // Length checks
  if (answer.text.length < 50) {
    overallScore -= 0.3;
    reasons.push("Response too short");
    recommendations.push("Provide more detailed explanation");
  }
  
  if (answer.text.length > 2000) {
    overallScore -= 0.2;
    reasons.push("Response too long");
    recommendations.push("Make response more concise");
  }

  // Source citation check
  let legalAccuracy = 1.0;
  if (answer.sources.length === 0) {
    legalAccuracy -= 0.5;
    overallScore -= 0.4;
    reasons.push("No sources cited");
    recommendations.push("Include source citations for credibility");
  }

  // Citation format check
  const hasCitationFormat = /\(Source:\s*[\w_.-]+\)/i.test(answer.text);
  if (answer.sources.length > 0 && !hasCitationFormat) {
    legalAccuracy -= 0.3;
    reasons.push("Improper citation format");
    recommendations.push("Use proper citation format: (Source: filename.txt)");
  }

  // Clamp scores
  overallScore = Math.max(0, Math.min(1, overallScore));
  legalAccuracy = Math.max(0, Math.min(1, legalAccuracy));

  return {
    overallScore,
    legalAccuracy,
    completeness: 0.8, // Default for basic eval
    clarity: 0.8,
    actionability: 0.7,
    translationQuality: 1.0, // Can't evaluate without AI
    reasons,
    recommendations
  };
}

/**
 * AI-powered detailed evaluation
 */
async function performAIEvaluation(
  answer: LLMAnswer,
  originalQuestion: string,
  userLanguage: string
): Promise<Partial<DetailedEvaluation>> {
  const evaluationPrompt = `
Evaluate this immigration assistant response on a scale of 0.0 to 1.0 for each criterion:

ORIGINAL QUESTION: "${originalQuestion}"
USER LANGUAGE: ${userLanguage}
RESPONSE: "${answer.text}"
SOURCES: ${answer.sources.join(", ")}

Rate each aspect (0.0 = poor, 1.0 = excellent):

1. LEGAL ACCURACY (0.0-1.0):
   - Are citations properly formatted?
   - Is immigration terminology used correctly?
   - Are legal requirements accurately stated?

2. COMPLETENESS (0.0-1.0):
   - Does it address all parts of the question?
   - Are key requirements/steps covered?
   - Is important context provided?

3. CLARITY (0.0-1.0):
   - Is language clear and understandable?
   - Is it appropriate for the user's context?
   - Are complex terms explained?

4. ACTIONABILITY (0.0-1.0):
   - Does it provide specific next steps?
   - Are concrete actions suggested?
   - Is guidance practical and implementable?

5. TRANSLATION QUALITY (0.0-1.0):
   - If not English: Is the language natural and accurate?
   - Are technical terms properly translated?
   - Is the tone appropriate for the target language?

Respond in this exact JSON format:
{
  "legalAccuracy": 0.0,
  "completeness": 0.0,
  "clarity": 0.0,
  "actionability": 0.0,
  "translationQuality": 0.0,
  "reasons": ["reason1", "reason2"],
  "recommendations": ["rec1", "rec2"]
}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are an expert evaluator of immigration assistance responses. Provide objective, detailed evaluations in the requested JSON format."
      },
      {
        role: "user",
        content: evaluationPrompt
      }
    ],
    temperature: 0.1,
    max_tokens: 500
  });

  try {
    const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
    return {
      legalAccuracy: result.legalAccuracy || 0.5,
      completeness: result.completeness || 0.5,
      clarity: result.clarity || 0.5,
      actionability: result.actionability || 0.5,
      translationQuality: result.translationQuality || 1.0,
      reasons: result.reasons || [],
      recommendations: result.recommendations || []
    };
  } catch (parseError) {
    console.error("Failed to parse AI evaluation:", parseError);
    return {};
  }
}

/**
 * Combine basic and AI evaluations
 */
function combineEvaluations(
  basic: DetailedEvaluation,
  ai: Partial<DetailedEvaluation>
): DetailedEvaluation {
  return {
    overallScore: calculateOverallScore({
      legalAccuracy: ai.legalAccuracy || basic.legalAccuracy,
      completeness: ai.completeness || basic.completeness,
      clarity: ai.clarity || basic.clarity,
      actionability: ai.actionability || basic.actionability,
      translationQuality: ai.translationQuality || basic.translationQuality
    }),
    legalAccuracy: ai.legalAccuracy || basic.legalAccuracy,
    completeness: ai.completeness || basic.completeness,
    clarity: ai.clarity || basic.clarity,
    actionability: ai.actionability || basic.actionability,
    translationQuality: ai.translationQuality || basic.translationQuality,
    reasons: [...basic.reasons, ...(ai.reasons || [])],
    recommendations: [...basic.recommendations, ...(ai.recommendations || [])]
  };
}

/**
 * Calculate weighted overall score
 */
function calculateOverallScore(scores: {
  legalAccuracy: number;
  completeness: number;
  clarity: number;
  actionability: number;
  translationQuality: number;
}): number {
  // Weighted average - legal accuracy and completeness are most important
  const weights = {
    legalAccuracy: 0.3,
    completeness: 0.25,
    clarity: 0.2,
    actionability: 0.15,
    translationQuality: 0.1
  };

  return (
    scores.legalAccuracy * weights.legalAccuracy +
    scores.completeness * weights.completeness +
    scores.clarity * weights.clarity +
    scores.actionability * weights.actionability +
    scores.translationQuality * weights.translationQuality
  );
}
