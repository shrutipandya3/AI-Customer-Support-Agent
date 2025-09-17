import mongoose from "mongoose";

export default async function connectDB() {
  try {
    const uri =
      `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}` +
      `@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}` +
      `?authSource=admin`;
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
