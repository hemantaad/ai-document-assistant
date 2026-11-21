import gemini from "../config/gemini.js";

export const EMBEDDING_MODEL = "gemini-embedding-2";
export const EMBEDDING_DIMENSIONS = 768;

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const normalizedText = text.trim();

  if (!normalizedText) {
    throw new Error("Cannot generate an embedding for empty text");
  }

  const response = await gemini.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: normalizedText,
    config: {
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  const embedding = response.embeddings?.[0]?.values;

  if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error("Gemini returned an invalid embedding");
  }

  if (!embedding.every(Number.isFinite)) {
    throw new Error("Gemini returned invalid numerical values");
  }

  return embedding;
};
