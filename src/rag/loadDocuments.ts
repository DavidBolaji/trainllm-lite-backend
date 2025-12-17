import fs from 'fs';
import path from 'path'
import { Document } from '@langchain/core/documents'

/**
 * Directory where raw text documents are stored
 */
const DOCUMENTS = path.join(process.cwd(), "data", "documents");

/**
 * Infer country or domain from filename
 * This metadata is critical for:
 * - Filtering
 * - Source attribution
 * - Debugging retrieval quality
 */
function inferMetadataFromFilename(filename: string) {
  const lower = filename.toLowerCase();

  if (lower.includes("uk")) {
    return { country: "UK", domain: "immigration" };
  }

  if (lower.includes("canada")) {
    return { country: "Canada", domain: "immigration" };
  }

  if (lower.includes("diaspora")) {
    return { country: "Global", domain: "diaspora_services" };
  }

  return { country: "Unknown", domain: "general" };
}

/**
 * Load all .txt files from data/documents
 * and convert them into LangChain Documents
 */
export async function loadDocuments(): Promise<Document[]> {
  const documents: Document[] = [];

  const files = fs.readdirSync(DOCUMENTS);

  for (const file of files) {
    if (!file.endsWith(".txt")) continue;

    const filePath = path.join(DOCUMENTS, file);
    const content = fs.readFileSync(filePath, "utf-8");

    const inferred = inferMetadataFromFilename(file);

    const doc = new Document({
      pageContent: content,
      metadata: {
        source: file,
        ...inferred,
        ingestedAt: new Date().toISOString(),
      },
    });

    documents.push(doc);
  }

  return documents;
}