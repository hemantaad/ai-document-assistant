import type { Request, Response } from "express";
import mongoose from "mongoose";

import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const getConversations = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const conversations = await Conversation.find({
      userId: new mongoose.Types.ObjectId(req.userId),
    })
      .sort({ updatedAt: -1 })
      .select("title documentId createdAt updatedAt")
      .lean();

    return res.status(200).json({
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error("Failed to retrieve conversations:", error);

    return res.status(500).json({
      message: "Unable to retrieve conversations",
    });
  }
};

export const getConversationById = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid conversation ID",
      });
    }

    const conversation = await Conversation.findOne({
      _id: id,
      userId: new mongoose.Types.ObjectId(req.userId),
    })
      .select("title documentId createdAt updatedAt")
      .lean();

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
      userId: new mongoose.Types.ObjectId(req.userId),
    })
      .sort({ createdAt: 1 })
      .select("role content sources createdAt")
      .lean();

    return res.status(200).json({
      conversation,
      messages,
    });
  } catch (error) {
    console.error("Failed to retrieve conversation:", error);

    return res.status(500).json({
      message: "Unable to retrieve conversation",
    });
  }
};

export const deleteConversation = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid conversation ID",
      });
    }

    const userId = new mongoose.Types.ObjectId(req.userId);

    const conversation = await Conversation.findOne({
      _id: id,
      userId,
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    // Delete all messages belonging to this conversation and user.
    await Message.deleteMany({
      conversationId: conversation._id,
      userId,
    });

    await Conversation.deleteOne({
      _id: conversation._id,
      userId,
    });

    return res.status(200).json({
      message: "Conversation and associated messages deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete conversation:", error);

    return res.status(500).json({
      message: "Unable to delete conversation",
    });
  }
};
