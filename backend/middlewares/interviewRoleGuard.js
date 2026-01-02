import InterviewParticipant from "../models/InterviewParticipant.js";

const interviewRoleGuard = (role) => async (req, res, next) => {
    const participant = await InterviewParticipant.findOne({
        interviewId: req.body.interviewId || req.params.interviewId,
        userId: req.user.id,
    });

    if (!participant || participant.role !== role) {
        return res.status(403).json({ message: "Access denied" });
    }
    next();
};

export default interviewRoleGuard;
