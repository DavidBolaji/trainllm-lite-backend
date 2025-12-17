import { Document } from "@langchain/core/documents";
import { PineconeStore } from "@langchain/pinecone";

export interface RetrievedContext {
  contextText: string;
  sources: string[];
  documents: Document[];
}

/**
 * Retrieve top-K relevant chunks from Pinecone
 */
export async function retrieveContext(
  vectorStore: PineconeStore,
  query: string,
  topK = 4
): Promise<RetrievedContext> {
  const results = await vectorStore.similaritySearch(query, topK);

  const contextText = results
    .map((doc, index) => {
      return `Source ${index + 1} (${doc.metadata?.source ?? "unknown"}):\n${doc.pageContent}`;
    })
    .join("\n\n");

  const sources = Array.from(
    new Set(results.map((doc) => doc.metadata?.source ?? "unknown"))
  );

  return {
    contextText,
    sources,
    documents: results,
  };
}
