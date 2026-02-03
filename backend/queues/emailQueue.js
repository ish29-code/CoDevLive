import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";


export const emailQueue = new Queue("emailQueue", {
    connection: redisConnection,
});

