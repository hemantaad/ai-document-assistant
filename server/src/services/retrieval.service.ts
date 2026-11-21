import DocumentChunk from "../models/document-chunk.model.js";
import { generateEmbedding } from "./embedding.service.js";

interface RetrievalOptions {
  userId: string;
  question: string;
  limit?: number;
  documentId?: string;
}

interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  similarity: number;
  pageNumber?: number;
}

const MIN_SIMILARITY_SCORE = 0.6;

/**
 * Calculates cosine similarity between two vectors.
 *
 * Returns a score between -1 and 1.
 * Higher scores indicate greater similarity.
 */
export const calculateCosineSimilarity = (
  vectorA: number[],
  vectorB: number[],
): number => {
  if (vectorA.length !== vectorB.length || vectorA.length === 0) {
    throw new Error("Vectors must have the same non-zero dimensions");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] ** 2;
    magnitudeB += vectorB[i] ** 2;
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
};

/**
 * Retrieves the most relevant document chunks for a question.
 */
export const retrieveRelevantChunks = async ({
  userId,
  question,
  limit = 5,
  documentId,
}: RetrievalOptions): Promise<RetrievedChunk[]> => {
  const normalizedQuestion = question.trim();

  if (!normalizedQuestion) {
    throw new Error("Question cannot be empty");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
    throw new Error("Retrieval limit must be between 1 and 20");
  }

  // Generate an embedding for the user's question.
  const questionEmbedding = await generateEmbedding(normalizedQuestion);

  // Restrict retrieval to the authenticated user's documents.
  const filter: {
    userId: string;
    documentId?: string;
  } = { userId };

  if (documentId) {
    filter.documentId = documentId;
  }

  // Fetch stored document chunks.
  const chunks = await DocumentChunk.find(filter)
    .select("documentId chunkIndex content embedding pageNumber")
    .lean();

  // Calculate similarity for every matching chunk.
  const rankedChunks: RetrievedChunk[] = chunks.map((chunk) => ({
    chunkId: chunk._id.toString(),
    documentId: chunk.documentId.toString(),
    chunkIndex: chunk.chunkIndex,
    content: chunk.content,
    similarity: calculateCosineSimilarity(questionEmbedding, chunk.embedding),
    ...(chunk.pageNumber !== undefined && {
      pageNumber: chunk.pageNumber,
    }),
  }));

  // Remove results below the minimum similarity threshold.
  return rankedChunks
    .filter((chunk) => chunk.similarity >= MIN_SIMILARITY_SCORE)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
};
