// config/socketRedis.js

/*import { createClient } from "redis";


//export const pubClient = createClient({ url: process.env.REDIS_URL });
export const subClient = pubClient.duplicate();

await pubClient.connect();
await subClient.connect();
*/

import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

/* ✅ EXPORT HERE */
export const pubClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        reconnectStrategy: retries => Math.min(retries * 50, 500)
    }
});


export const subClient = pubClient.duplicate();

/* connect */
await pubClient.connect();
await subClient.connect();
