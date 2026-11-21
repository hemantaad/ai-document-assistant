import mongoose, { Schema, Document } from "mongoose";

export interface IDocumentChunk extends Document {
  userId: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
  chunkIndex: number;
  content: string;
  embedding: number[];
  embeddingModel: string;
  startChar: number;
  endChar: number;
  pageNumber?: number;
  createdAt: Date;
  updatedAt: Date;
}

const documentChunkSchema = new Schema<IDocumentChunk>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    embeddingModel: {
      type: String,
      required: true,
    },
    startChar: {
      type: Number,
      required: true,
    },
    endChar: {
      type: Number,
      required: true,
    },
    pageNumber: {
      type: Number,
    },
  },
  { timestamps: true },
);

documentChunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });

const DocumentChunk = mongoose.model<IDocumentChunk>(
  "DocumentChunk",
  documentChunkSchema,
);

export default DocumentChunk;
