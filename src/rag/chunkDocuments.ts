import { Document } from "langchain";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

/**
 * Chunking configuration
 * These values are intentionally conservative for policy-style documents
 */
const CHUNK_SIZE = 500;      // ~500 characters per chunk
const CHUNK_OVERLAP = 100;   // ~100 characters overlap to preserve context

/**
 * Split documents into overlapping chunks while preserving metadata.
 *
 * Why this matters:
 * - Smaller chunks improve semantic retrieval accuracy
 * - Overlap prevents loss of meaning across boundaries
 */
export async function chunkDocuments(
  documents: Document[]
): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const chunkedDocuments = await splitter.splitDocuments(documents);

  /**
   * Attach chunk-level metadata for traceability and debugging
   */
  return chunkedDocuments.map((doc, index) => {
    return new Document({
      pageContent: doc.pageContent,
      metadata: {
        ...doc.metadata,
        chunkIndex: index,
      },
    });
  });
}
