import { Response, NextFunction } from "express";
import { redisClient } from "../config/redisClient";
import { AuthRequest } from "../types/AuthRequest";

const PER_SECOND_LIMIT = 2; // 2 messages/sec
const PER_DAY_LIMIT = 10; // 10 messages/day

export async function rateLimiter(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!redisClient) {
      throw new Error("Redis client not connected");
    }

    const secondKey = `user:${userId}:second`;
    const dayKey = `user:${userId}:day`;

    // --- 1. Per-second limit ---
    const secCount = await redisClient.incr(secondKey);
    if (secCount === 1) {
      await redisClient.expire(secondKey, 1); // reset after 1 second
    }
    if (secCount > PER_SECOND_LIMIT) {
      return res.status(429).json({ error: "Too many requests per second" });
    }

    // --- 2. Per-day limit ---
    const dayCount = await redisClient.incr(dayKey);
    if (dayCount === 1) {
      await redisClient.expire(dayKey, 24 * 60 * 60); // reset after 24 hours
    }
    if (dayCount > PER_DAY_LIMIT) {
      return res.status(429).json({ error: "Daily request limit exceeded" });
    }

    // ✅ Passed both limits
    next();
  } catch (err) {
    console.error("❌ Rate limiter error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
