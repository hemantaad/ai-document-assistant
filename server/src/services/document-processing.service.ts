import mongoose from "mongoose";

import DocumentChunk from "../models/document-chunk.model.js";

import { extractDocumentText } from "./document-extraction.service.js";
import { splitTextIntoChunks } from "./text-chunking.service.js";
import { generateEmbedding, EMBEDDING_MODEL } from "./embedding.service.js";

interface DocumentSection {
  text: string;
  pageNumber?: number;
}

interface ProcessDocumentOptions {
  documentId: string;
  userId: string;
  filePath: string;
}

export const processDocument = async ({
  documentId,
  userId,
  filePath,
}: ProcessDocumentOptions): Promise<number> => {
  const extractedContent = await extractDocumentText(filePath);

  // Normalize the extraction result into sections.
  // PDF documents retain their individual page numbers.
  const sections: DocumentSection[] =
    typeof extractedContent === "string"
      ? [{ text: extractedContent }]
      : extractedContent.pages.map((page) => ({
          text: page.text,
          pageNumber: page.pageNumber,
        }));

  const chunkRecords = [];

  let chunkIndex = 0;

  for (const section of sections) {
    const chunks = splitTextIntoChunks(section.text);

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content);

      chunkRecords.push({
        userId: new mongoose.Types.ObjectId(userId),
        documentId: new mongoose.Types.ObjectId(documentId),
        chunkIndex,
        content: chunk.content,
        embedding,
        embeddingModel: EMBEDDING_MODEL,
        startChar: chunk.startChar,
        endChar: chunk.endChar,
        ...(section.pageNumber !== undefined && {
          pageNumber: section.pageNumber,
        }),
      });

      chunkIndex++;
    }
  }

  if (chunkRecords.length === 0) {
    throw new Error("The document contains no extractable text");
  }

  await DocumentChunk.insertMany(chunkRecords);

  return chunkRecords.length;
};
