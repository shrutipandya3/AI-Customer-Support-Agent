import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  tokenCount?: number; // Optional: track token usage
}

export const MessageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ["user", "assistant", "system"],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  tokenCount: {
    type: Number,
    min: 0
  }
}, { _id: false }); // No separate _id for embedded messages


