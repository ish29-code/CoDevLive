import { Queue } from "bullmq";
//import { redisConnection } from "../config/redis.js";
export const redisConnection = {
    url: process.env.REDIS_URL,
};


export const emailQueue = new Queue("emailQueue", {
    connection: redisConnection,
});

