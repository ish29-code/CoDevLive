import Redis from "ioredis";
import { executeCode } from "./dockerExecutor.js";

const redis = new Redis();

async function startWorker() {
    console.log("Run Worker Started");

    while (true) {
        const job = await redis.brpop("codeExecutionQueue", 0);
        const data = JSON.parse(job[1]);

        await executeCode(data);
    }
}

startWorker();