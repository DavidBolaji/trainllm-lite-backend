import { loadDocuments } from "./loadDocuments";
import { chunkDocuments } from "./chunkDocuments";
import { getVectorStore } from "./vectorStore"; // Pinecone-backed
import { retrieveContext, RetrievedContext } from "./retrieveContext";
import { buildPrompt } from "./buildPrompt";
import { generateAnswer, LLMAnswer } from "./generateAnswer";

interface ConversationTurn {
  question: string;
  answer: string;
}

export async function askQuestion(
  query: string,
  language: string = "English",
  conversation?: ConversationTurn[]
): Promise<LLMAnswer> {
  try {
    // 1️⃣ Load documents
    const docs = await loadDocuments();

    // 2️⃣ Chunk documents
    const chunks = await chunkDocuments(docs);

    // 3️⃣ Create vector store
    const vectorStore = await getVectorStore(chunks);

    // 4️⃣ Retrieve context from Pinecone
    const retrievedContext: RetrievedContext = await retrieveContext(vectorStore, query);

    // 5️⃣ Build prompt
    const prompt = buildPrompt(query, retrievedContext, language, conversation);

    // 6️⃣ Generate answer using centralized OpenAI client
    const answer: LLMAnswer = await generateAnswer(prompt, retrievedContext);

    return answer;
  } catch (error) {
    console.error("Error in RAG pipeline:", error);
    return {
      text: "Sorry, something went wrong while processing your request.",
      sources: [],
    };
  }
}
