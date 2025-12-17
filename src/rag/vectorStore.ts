import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

/**
 * Initialize Pinecone client
 */
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

/**
 * Create Pinecone vector store from documents
 */
export async function getVectorStore(documents: Document[]) {
  // Centralized OpenAI embeddings
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    openAIApiKey: process.env.OPENAI_API_KEY, // explicit
  });

  const vectorStore = await PineconeStore.fromDocuments(documents, embeddings, {
    pineconeIndex,
    textKey: "pageContent",
    namespace: process.env.PINECONE_INDEX, // optional
  });

  return vectorStore;
}
