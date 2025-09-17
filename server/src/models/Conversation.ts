import mongoose, { Schema, Document } from "mongoose";
import { IMessage, MessageSchema } from "./Message";

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  isActive: boolean;
  lastMessageAt: Date;
  totalMessages: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    messages: [MessageSchema], // reuse schema
    isActive: {
      type: Boolean,
      default: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    totalMessages: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

ConversationSchema.pre<IConversation>("save", function (next) {
  if (this.messages && this.messages.length > 0) {
    this.totalMessages = this.messages.length;
    const lastMessage = this.messages[this.messages.length - 1];

    if (lastMessage) {
      this.lastMessageAt = lastMessage.timestamp;
    }

    if (!this.title || this.title === "New Conversation") {
      const firstUserMessage = this.messages.find((msg) => msg.role === "user");
      if (firstUserMessage) {
        this.title =
          firstUserMessage.content.length > 50
            ? firstUserMessage.content.substring(0, 50) + "..."
            : firstUserMessage.content;
      }
    }
  }
  next();
});

const Conversation = mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);

export default Conversation;
