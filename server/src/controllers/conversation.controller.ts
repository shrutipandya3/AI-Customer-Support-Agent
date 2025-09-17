import { Response } from "express";
import Conversation from "../models/Conversation";
import { AuthRequest } from "../types/AuthRequest";

export const getAllConversations = async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await Conversation.find(
      { userId: req.userId },
      { title: 1 } // only select title
    ).sort({ lastMessageAt: -1 }); // optional: sort by last activity

    // map to include id instead of _id
    const formattedConversations = conversations.map((conv) => ({
      id: conv._id,
      title: conv.title,
    }));

    res.json({
      success: true,
      conversations: formattedConversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch conversations" });
  }
};

export const getConversationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Conversation ID is required" });
    }

    const conversation = await Conversation.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    res.json({
      success: true,
      conversation: {
        id: conversation._id,
        title: conversation.title,
        messages: conversation.messages, // all messages included
        totalMessages: conversation.totalMessages,
        lastMessageAt: conversation.lastMessageAt,
        isActive: conversation.isActive,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get conversation by ID error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch conversation" });
  }
};

