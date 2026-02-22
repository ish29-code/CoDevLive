import Redis from "ioredis";

export const queueRedis = new Redis({
    host: "localhost",
    port: 6379,
});