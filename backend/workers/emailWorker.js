import { Worker } from "bullmq";
import { sendEmail } from "../Utils/sendEmail.js";
import { redisConnection } from "../config/redis.js";
const emailWorker = new Worker(
    "emailQueue",
    async (job) => {
        try {
            console.log("🔥 Worker received job:", job.data.to);

            await sendEmail(job.data);

            console.log("✅ Email sent to:", job.data.to);
        } catch (err) {
            console.error("❌ Nodemailer error:", err.message);
        }
    },
    { connection: redisConnection }
);

emailWorker.on("completed", (job) => {
    console.log(`🎉 Job ${job.id} has been completed`);
});

emailWorker.on("failed", (job, err) => {
    console.log(`❌ Job ${job.id} has failed with error: ${err.message}`);
});

export default emailWorker; 