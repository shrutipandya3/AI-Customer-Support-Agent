import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import connectDB from "./config/mongoose";
import { connectRedis } from "./config/redisClient";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import messageRoutes from "./routes/message.routes";
import conversationRoutes from "./routes/conversation.routes";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true, // allow sending cookies
}));

// Start DB + Redis connections
(async () => {
  await connectDB();
  await connectRedis();
})();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
