import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import { sendEmail } from "../Utils/sendEmail.js";
import { redisConnection } from "../config/redis.js";;


console.log("📨 Email Worker started...");

const emailWorker = new Worker(
    "emailQueue",
    async (job) => {
        console.log("🔥 Worker received job:", job.data.to);

        const { to, subject, html } = job.data;

        await sendEmail({ to, subject, html });

        console.log("✅ Email sent to:", to);
    },
    {
        connection: redisConnection,
    }
);


emailWorker.on("failed", (job, err) => {
    console.error("❌ Email job failed:", err.message);
});
