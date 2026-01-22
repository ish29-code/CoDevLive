// config/socketRedis.js

import { createClient } from "redis";

export const pubClient = createClient({ url: "redis://localhost:6379" });
export const subClient = pubClient.duplicate();

await pubClient.connect();
await subClient.connect();
