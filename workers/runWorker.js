import { Worker } from "bullmq";
import IORedis from "ioredis";

import Submission from "../backend/models/Submissions.js";
import Problem from "../backend/models/Problem.js";
import { executeCode } from "./dockerExecutor.js";

const connection = new IORedis({
    maxRetriesPerRequest: null
});

console.log("Run Worker Started");

const worker = new Worker(
    "codeExecutionQueue",

    async (job) => {

        const { submissionId, problemId, code, language } = job.data;

        try {

            // 🔥 Update status → Running
            await Submission.findByIdAndUpdate(submissionId, {
                status: "Running"
            });

            const problem = await Problem.findById(problemId);

            if (!problem) {

                await Submission.findByIdAndUpdate(submissionId, {
                    status: "Error",
                    output: "Problem not found"
                });

                return;
            }

            const testCases = problem.testCases;

            let verdict = "Accepted";
            let finalOutput = "";

            for (const testCase of testCases) {

                const result = await executeCode({
                    code,
                    language,
                    input: testCase.input
                });

                if (result.error) {

                    verdict = "Runtime Error";
                    finalOutput = result.error;
                    break;

                }

                if (result.output.trim() !== testCase.output.trim()) {

                    verdict = "Wrong Answer";
                    finalOutput = result.output;
                    break;

                }

                finalOutput = result.output;
            }

            // 🔥 Update submission result
            await Submission.findByIdAndUpdate(submissionId, {
                status: verdict,
                output: finalOutput
            });

        } catch (error) {

            console.error(error);

            await Submission.findByIdAndUpdate(submissionId, {
                status: "Error",
                output: error.message
            });

        }

    },

    { connection }
);

worker.on("completed", (job) => {
    console.log("Submission processed:", job.id);
});

worker.on("failed", (job, err) => {
    console.error("Worker error:", err);
});