import { createClient, RedisClientType } from "redis";
let client: RedisClientType;

export const connectRedis = async () => {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL,
    });

    client.on("error", (err) => {
      console.error("Redis client error! :", err);
    });

    await client.connect();
    console.log("Redis client connected!");
  }
  return client;
};
