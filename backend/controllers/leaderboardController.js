// controllers/leaderboardController.js
import DsaProgress from "../models/DsaProgress.js";

export const getLeaderboard = async (req, res) => {
    const leaderboard = await DsaProgress.find()
        .sort({ "stats.total": -1 })
        .limit(50)
        .populate("userId", "name");

    res.json(leaderboard);
};
