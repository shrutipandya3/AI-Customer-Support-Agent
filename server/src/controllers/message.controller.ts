import { Request, Response } from "express";
import Conversation, { IConversation } from "../models/Conversation";
import { AuthRequest } from "../types/AuthRequest";
import { IMessage } from "../models/Message";

interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, message } = req.body as {
      conversationId?: string;
      message: string;
    };

    if (!message?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message cannot be empty" });
    }

    let conversation: IConversation | null;

    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        userId: req.userId,
      });

      if (!conversation) {
        return res
          .status(404)
          .json({ success: false, message: "Conversation not found" });
      }
    } else {
      // Create new conversation
      conversation = new Conversation({
        userId: req.userId,
        title: "New Conversation",
        messages: [],
        isActive: true,
      });
    }

    // Add user message
    const userMessage: IMessage = {
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    };

    conversation.messages.push(userMessage);

    // Prepare messages for AI
    const aiMessages: AIMessage[] = [
      {
        role: "system",
        content:
          "You are a helpful customer support agent. Be friendly, professional, and concise.",
      },
      ...conversation.messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Call OpenRouter AI
    const aiResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: aiMessages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      }
    );

    if (!aiResponse.ok) {
      throw new Error("AI service unavailable");
    }

    const aiData: any = await aiResponse.json();

    const aiReply: string =
      aiData.choices?.[0]?.message?.content ??
      "Sorry, I couldn't process your request.";

    // Add AI response
    const assistantMessage: IMessage = {
      role: "assistant",
      content: aiReply,
      timestamp: new Date(),
    };

    conversation.messages.push(assistantMessage);
    await conversation.save();

    res.json({
      success: true,
      conversationId: conversation._id,
      userMessage,
      aiMessage: assistantMessage,
      title: conversation.title,
    });
  } catch (error: any) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};
