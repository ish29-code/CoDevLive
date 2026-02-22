import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

import { Worker } from "bullmq";
import { sendEmail } from "../backend/Utils/sendEmail.js";
import { redisConnection } from "../backend/config/redis.js";;


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
