import Submission from "../models/Submissions.js";
import Problem from "../models/Problem.js";
import DsaProgress from "../models/DsaProgress.js";
import { codeExecutionQueue } from "../queues/codeExecutionQueue.js";

export const submitCode = async (req, res) => {

    try {

        const { problemId, code, language } = req.body;
        const userId = req.user.id;

        const problem = await Problem.findById(problemId);

        if (!problem) {
            return res.status(404).json({
                message: "Problem not found"
            });
        }

        // 🔥 Create submission
        const submission = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: "Pending"
        });

        // 🔥 Push job to queue
        await codeExecutionQueue.add("submitCode", {
            submissionId: submission._id,
            problemId,
            code,
            language
        });

        res.status(200).json({
            message: "Submission received",
            submissionId: submission._id,
            status: "Pending"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Submission failed"
        });

    }
};
/* ---------------- HELPERS ---------------- */

/*const updateProgress = async (userId, problem) => {
    let progress = await DsaProgress.findOne({ userId });

    if (!progress) {
        progress = await DsaProgress.create({
            userId,
            solved: [],
            streak: { current: 0, max: 0 },
            stats: { easy: 0, medium: 0, hard: 0, total: 0 },
        });
    }

    if (!progress.solved.includes(problem._id)) {
        progress.solved.push(problem._id);
        progress.stats.total++;

        progress.stats[problem.difficulty.toLowerCase()]++;

        // 🔥 Streak logic
        const today = new Date().toDateString();
        const last = progress.streak.lastSolved?.toDateString();

        progress.streak.current =
            last === today
                ? progress.streak.current
                : progress.streak.current + 1;

        progress.streak.max = Math.max(
            progress.streak.max,
            progress.streak.current
        );

        progress.streak.lastSolved = new Date();

        await progress.save();
    }
};*/


