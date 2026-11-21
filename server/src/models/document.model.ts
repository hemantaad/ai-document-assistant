import mongoose, { Schema, Document } from "mongoose";

export type DocumentStatus = "uploaded" | "processing" | "ready" | "failed";

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  originalName: string;
  storedName: string;
  fileType: "pdf" | "docx" | "txt";
  mimeType: string;
  fileSize: number;
  filePath: string;
  status: DocumentStatus;
  extractedText?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    storedName: {
      type: String,
      required: true,
      unique: true,
    },

    fileType: {
      type: String,
      enum: ["pdf", "docx", "txt"],
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["uploaded", "processing", "ready", "failed"],
      default: "uploaded",
    },

    extractedText: {
      type: String,
    },

    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const DocumentModel = mongoose.model<IDocument>("Document", documentSchema);

export default DocumentModel;
