import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis();

export const codeExecutionQueue = new Queue("codeExecutionQueue", {
    connection,
});