import { IUser } from "../models/User";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import getEnv from "./getEnv";
import { redisClient } from "../config/redisClient";

const ACCESS_SECRET = getEnv("JWT_ACCESS_SECRET");
const REFRESH_SECRET = getEnv("JWT_REFRESH_SECRET");
const ACCESS_EXPIRES = getEnv("ACCESS_TOKEN_EXPIRES_IN");
const REFRESH_EXPIRES = getEnv("REFRESH_TOKEN_EXPIRES_IN");

function parseExpires(expires: string): number {
  if (expires.endsWith("m")) return parseInt(expires) * 60;
  if (expires.endsWith("h")) return parseInt(expires) * 3600;
  if (expires.endsWith("d")) return parseInt(expires) * 24 * 3600;
  return parseInt(expires); // assume seconds
}

async function storeRefreshToken(
  user: IUser,
  refreshToken: string,
  deviceId: string,
  ip?: string,
  userAgent?: string
) {
  /**
   * Single-device login:
   * 1. Remove any existing refresh token from Redis.
   * 2. Overwrite refreshToken in MongoDB.
   * 3. Save user doc.
   * 4. Store the new refresh token in Redis.
   */
  if (user.refreshToken?.token) {
    try {
      await redisClient.del(`refresh:${user.refreshToken.token}`);
    } catch (err) {
      console.error("Error removing old refresh from redis:", err);
    }
  }

  // overwrite with new refresh token
  user.refreshToken = {
    token: refreshToken,
    deviceId,
    ip,
    userAgent,
    createdAt: new Date(),
  } as any;

  await user.save();

  // store new refresh token in Redis with TTL
  const refreshTTL = parseExpires(REFRESH_EXPIRES);
  await redisClient.set(`refresh:${refreshToken}`, user._id.toString(), {
    EX: refreshTTL,
  });
}

function createAccessToken(payload: { userId: string; deviceId: string }) {
  return sign(payload, ACCESS_SECRET, {
    expiresIn: parseExpires(ACCESS_EXPIRES),
  });
}

function createRefreshToken(payload: { userId: string; deviceId: string }) {
  return sign(payload, REFRESH_SECRET, {
    expiresIn: parseExpires(REFRESH_EXPIRES),
  });
}

async function storeAccessTokenInRedis(accessToken: string, userId: string) {
  // first remove any old access tokens for this user
  // (optional: you could store `access:userId` instead of `access:token` if you want strict 1:1)
  // For simplicity, we directly set with token as key.
  const ttlSeconds = parseExpires(ACCESS_EXPIRES);

  await redisClient.set(`access:${accessToken}`, userId, { EX: ttlSeconds });
}

async function verifyRefreshToken(token: string): Promise<JwtPayload | null> {
  try {
    const decoded = verify(token, REFRESH_SECRET) as JwtPayload;

    // ensure still in Redis (not revoked)
    const userId = await redisClient.get(`refresh:${token}`);
    if (!userId) {
      return null; // token revoked or expired in Redis
    }

    return decoded;
  } catch (err) {
    console.error("verifyRefreshToken error:", err);
    return null;
  }
}

export {
  storeRefreshToken,
  createAccessToken,
  createRefreshToken,
  storeAccessTokenInRedis,
  verifyRefreshToken,
};
