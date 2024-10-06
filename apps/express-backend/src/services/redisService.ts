import { connectRedis } from "../config/redisConfig";

export const setCache = async (key: string, value: any) => {
  const client = await connectRedis();
  await client.set(key, value);
};

export const getCache = async (key: string) => {
  const client = await connectRedis();
  const value = await client.get(key);
  return value;
};
