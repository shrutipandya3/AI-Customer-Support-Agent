import User, { IUser } from "../models/User";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import {
  createAccessToken,
  createRefreshToken,
  storeAccessTokenInRedis,
  storeRefreshToken,
  verifyRefreshToken,
} from "../utils/auth";
import { Request, Response } from "express";
import { redisClient } from "../config/redisClient";
import { verify } from "jsonwebtoken";
import getEnv from "../utils/getEnv";

const REFRESH_SECRET = getEnv("JWT_REFRESH_SECRET");

export async function register(req: Request, res: Response) {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashed,
      refreshToken: null,
    });

    await user.save();

    // login immediately
    const deviceId = uuidv4();
    const accessToken = createAccessToken({
      userId: user._id.toString(),
      deviceId,
    });
    const refreshToken = createRefreshToken({
      userId: user._id.toString(),
      deviceId,
    });

    await storeAccessTokenInRedis(accessToken, user._id.toString());
    await storeRefreshToken(
      user,
      refreshToken,
      deviceId,
      req.ip,
      req.get("user-agent") || undefined
    );

    console.log(getEnv("NODE_ENV") === "production")
    console.log(getEnv("NODE_ENV") === "production" ? "strict" : "lax")

    // Send refresh token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: getEnv("NODE_ENV") === "production",
      sameSite: getEnv("NODE_ENV") === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // match refresh token TTL
    });

    return res.status(201).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      accessToken,
      deviceId,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing credentials" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    // single-device login: revoke any previous tokens
    if (user.refreshToken?.token) {
      await redisClient.del(`refresh:${user.refreshToken.token}`);
      await redisClient.del(`access:${user.refreshToken.token}`); // optional, if storing old access token
    }

    const deviceId = uuidv4();
    const accessToken = createAccessToken({
      userId: user._id.toString(),
      deviceId,
    });
    const refreshToken = createRefreshToken({
      userId: user._id.toString(),
      deviceId,
    });

    await storeAccessTokenInRedis(accessToken, user._id.toString());
    await storeRefreshToken(
      user,
      refreshToken,
      deviceId,
      req.ip,
      req.get("user-agent") || undefined
    );

    // Send refresh token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      accessToken,
      deviceId,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function refreshAccessToken(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken)
      return res.status(400).json({ message: "Refresh token required" });

    const decoded = await verifyRefreshToken(refreshToken);
    if (!decoded)
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });

    const { userId, deviceId } = decoded;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.refreshToken?.token !== refreshToken) {
      return res.status(401).json({ message: "Refresh token revoked" });
    }

    const newAccessToken = createAccessToken({ userId, deviceId });

    await storeAccessTokenInRedis(newAccessToken, userId);
   

    return res.json({
      accessToken: newAccessToken,
      deviceId,
    });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken || !accessToken)
      return res
        .status(400)
        .json({ message: "Refresh and Access tokens required" });

    let decoded: any;
    try {
      decoded = verify(refreshToken, REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // remove refresh token from MongoDB
    user.refreshToken = null;
    await user.save();

    // remove tokens from Redis
    await redisClient.del(`refresh:${refreshToken}`);
    await redisClient.del(`access:${accessToken}`);

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
