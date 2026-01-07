// controllers/progressController.js
import DsaProgress from "../models/DsaProgress.js";

export const getMyProgress = async (req, res) => {
    const progress = await DsaProgress.findOne({
        userId: req.user.id,
    }).populate("solved", "title difficulty");

    if (!progress) {
        return res.json({
            solved: [],
            streak: { current: 0, max: 0 },
            stats: { easy: 0, medium: 0, hard: 0, total: 0 },
        });
    }

    res.json(progress);
};
