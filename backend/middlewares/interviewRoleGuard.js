import Interview from "../models/Interview.js";
import InterviewParticipant from "../models/InterviewParticipant.js";

const interviewRoleGuard = (requiredRole) => {
    return async (req, res, next) => {
        try {
            const { roomId } = req.body || req.params;

            if (!roomId) {
                return res.status(400).json({ message: "roomId required" });
            }

            const interview = await Interview.findOne({ roomId });
            if (!interview) {
                return res.status(404).json({ message: "Interview not found" });
            }

            const participant = await InterviewParticipant.findOne({
                interviewId: interview._id,
                userId: req.user.id,
            });

            if (!participant) {
                return res.status(403).json({ message: "Not a participant" });
            }

            if (participant.role !== requiredRole) {
                return res.status(403).json({
                    message: `Only ${requiredRole} can perform this action`,
                });
            }

            next();
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    };
};

export default interviewRoleGuard;
