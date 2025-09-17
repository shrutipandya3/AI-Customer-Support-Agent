// middleware/auth.middleware.ts
import { Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import getEnv from "../utils/getEnv";
import { redisClient } from "../config/redisClient";
import { AuthRequest } from "../types/AuthRequest";

const ACCESS_SECRET = getEnv("JWT_ACCESS_SECRET");

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access token required" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2) {
      return res
        .status(401)
        .json({ message: "Invalid authorization header format" });
    }

    const accessToken = parts[1];

    if (!accessToken) {
      return res.status(401).json({ message: "Access token missing" });
    }
    // verify JWT signature
    let payload: any;
    try {
      payload = verify(accessToken, ACCESS_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid access token" });
    }

    // Optional: check Redis to see if token is still valid
    const userId = await redisClient.get(`access:${accessToken}`);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Access token expired or revoked" });
    }


    // attach userId to request for further routes
    req.userId = payload.userId;
    req.deviceId = payload.deviceId;


    next();
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
