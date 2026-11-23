import mongoose, { Schema, InferSchemaType } from "mongoose";

export type DocumentStatus = "uploaded" | "processing" | "ready" | "failed";

const documentSchema = new Schema(
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

    fileId: {
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

export type IDocument = InferSchemaType<typeof documentSchema>;

const DocumentModel = mongoose.model("Document", documentSchema);

export default DocumentModel;
