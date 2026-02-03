// config/socketRedis.js

import { createClient } from "redis";

export const pubClient = createClient({ url: process.env.REDIS_URL });
export const subClient = pubClient.duplicate();

await pubClient.connect();
await subClient.connect();
