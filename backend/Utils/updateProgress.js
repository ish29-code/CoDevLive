import DsaProgress from "../models/DsaProgress.js";

export const updateProgress = async (userId, problem) => {

    let progress = await DsaProgress.findOne({ userId });

    if (!progress) {
        progress = await DsaProgress.create({
            userId,
            solved: [],
            streak: { current: 0, max: 0 },
            stats: { easy: 0, medium: 0, hard: 0, total: 0 }
        });
    }

    if (!progress.solved.includes(problem._id)) {

        progress.solved.push(problem._id);
        progress.stats.total++;

        progress.stats[problem.difficulty.toLowerCase()]++;

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
};