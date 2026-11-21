import type { Request, Response } from "express";
import mongoose from "mongoose";

import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import DocumentModel from "../models/document.model.js";

import { chatSchema } from "../validators/chat.validator.js";
import { askDocumentQuestion } from "../services/rag.service.js";

export const chat = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  let userMessageId: mongoose.Types.ObjectId | undefined;
  let conversationId: mongoose.Types.ObjectId | undefined;

  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const validation = chatSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const {
      question,
      conversationId: requestedConversationId,
      documentId,
    } = validation.data;

    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    // Verify ownership of the requested document, if provided.
    if (documentId) {
      const document = await DocumentModel.findOne({
        _id: documentId,
        userId: userObjectId,
        status: "ready",
      }).select("_id");

      if (!document) {
        return res.status(404).json({
          message: "Document not found or not available",
        });
      }
    }

    let conversation;

    if (requestedConversationId) {
      // An existing conversation must belong to the authenticated user.
      conversation = await Conversation.findOne({
        _id: requestedConversationId,
        userId: userObjectId,
      });

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found",
        });
      }

      // Prevent changing the document scope of an existing conversation.
      if (documentId && conversation.documentId?.toString() !== documentId) {
        return res.status(400).json({
          message: "The document does not match this conversation",
        });
      }

      if (!documentId && conversation.documentId) {
        // Existing document-specific conversations retain their document scope.
      }
    } else {
      conversation = await Conversation.create({
        userId: userObjectId,
        ...(documentId && {
          documentId: new mongoose.Types.ObjectId(documentId),
        }),
        title: question.length > 60 ? `${question.slice(0, 57)}...` : question,
      });
    }

    conversationId = conversation._id;

    // Load the most recent six messages to provide follow-up context.
    const previousMessages = await Message.find({
      conversationId,
      userId: userObjectId,
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("role content")
      .lean();

    const conversationHistory = previousMessages.reverse().map((message) => ({
      role: message.role,
      content: message.content,
    }));

    // Save the user's question.
    const userMessage = await Message.create({
      conversationId,
      userId: userObjectId,
      role: "user",
      content: question,
    });

    userMessageId = userMessage._id;

    // Use the conversation's document scope when continuing an existing chat.
    const effectiveDocumentId =
      conversation.documentId?.toString() || documentId;

    const result = await askDocumentQuestion({
      userId: req.userId,
      question,
      documentId: effectiveDocumentId,
      conversationHistory,
    });

    // Save the assistant's answer and its source references.
    const assistantMessage = await Message.create({
      conversationId,
      userId: userObjectId,
      role: "assistant",
      content: result.answer,
      sources: result.sources.map((source) => ({
        documentId: new mongoose.Types.ObjectId(source.documentId),
        chunkId: new mongoose.Types.ObjectId(source.chunkId),
        chunkIndex: source.chunkIndex,
        ...(source.pageNumber !== undefined && {
          pageNumber: source.pageNumber,
        }),
        similarity: source.similarity,
      })),
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    return res.status(200).json({
      message: "Answer generated successfully",
      conversationId: conversation._id,
      conversationTitle: conversation.title,
      question: {
        id: userMessage._id,
        role: userMessage.role,
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      },
      answer: {
        id: assistantMessage._id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        sources: assistantMessage.sources,
        createdAt: assistantMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("Chat request failed:", error);

    // Remove the saved question if answer generation or persistence failed.
    if (userMessageId) {
      await Message.deleteOne({ _id: userMessageId }).catch(() => undefined);
    }

    // Remove a newly created conversation if this request failed.
    if (conversationId) {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        userId: req.userId,
      }).catch(() => null);

      if (conversation) {
        const messageCount = await Message.countDocuments({
          conversationId,
        }).catch(() => 1);

        if (messageCount === 0) {
          await Conversation.deleteOne({
            _id: conversationId,
          }).catch(() => undefined);
        }
      }
    }

    return res.status(500).json({
      message: "Unable to process your question. Please try again.",
    });
  }
};
