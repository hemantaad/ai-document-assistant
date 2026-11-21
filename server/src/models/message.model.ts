import mongoose, { Schema, Document } from "mongoose";

export type MessageRole = "user" | "assistant";

export interface IMessageSource {
  documentId: mongoose.Types.ObjectId;
  chunkId: mongoose.Types.ObjectId;
  chunkIndex: number;
  pageNumber?: number;
  similarity: number;
}

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: MessageRole;
  content: string;
  sources: IMessageSource[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSourceSchema = new Schema<IMessageSource>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    chunkId: {
      type: Schema.Types.ObjectId,
      ref: "DocumentChunk",
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    pageNumber: {
      type: Number,
    },
    similarity: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    sources: {
      type: [messageSourceSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Retrieve messages in chronological order within a conversation.
messageSchema.index({
  conversationId: 1,
  createdAt: 1,
});

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
