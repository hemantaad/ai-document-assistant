import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  documentId?: mongoose.Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
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
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      default: "New conversation",
    },
  },
  {
    timestamps: true,
  },
);

// Optimize retrieving a user's conversations by most recently updated.
conversationSchema.index({
  userId: 1,
  updatedAt: -1,
});

const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema,
);

export default Conversation;
