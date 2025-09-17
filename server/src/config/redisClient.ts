import { createClient } from "redis";

let redisClient: ReturnType<typeof createClient>;

export async function connectRedis() {
  redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  });

  // Event listeners
  redisClient.on("connect", () => {
    console.log("✅ Redis client connected");
  });

  redisClient.on("error", (err) => {
    console.error("❌ Redis Client Error", err);
  });

  await redisClient.connect();

  // 🔹 Test connection: simple set + get
  try {
    await redisClient.set("test-key", "hello", { EX: 10 }); // expires in 10s
    const value = await redisClient.get("test-key");
    console.log("🔎 Redis test value:", value); // should print "hello"
  } catch (err) {
    console.error("❌ Redis test failed:", err);
  }

  return redisClient;
}

export { redisClient };
