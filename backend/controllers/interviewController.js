
import InterviewParticipant from "../models/InterviewParticipant.js";
import InterviewFeedback from "../models/InterviewFeedback.js";
import crypto from "crypto";
import Interview from "../models/Interview.js";
import InterviewEvaluation from "../models/InterviewEvaluation.js";

export const createInterview = async (req, res) => {
    const roomId = crypto.randomUUID();

    const interview = await Interview.create({
        roomId,
        createdBy: req.user.id,
    });

    await InterviewParticipant.create({
        interviewId: interview._id,
        userId: req.user.id,
        role: "interviewer",
    });

    res.status(201).json({ roomId });
};

export const joinInterview = async (req, res) => {
    const { roomId } = req.body;

    const interview = await Interview.findOne({ roomId });
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    let participant = await InterviewParticipant.findOne({
        interviewId: interview._id,
        userId: req.user.id,
    });

    if (!participant) {
        const role =
            interview.createdBy.toString() === req.user.id
                ? "interviewer"
                : "student";

        participant = await InterviewParticipant.create({
            interviewId: interview._id,
            userId: req.user.id,
            role,
        });
    }

    res.json({ roomId, role: participant.role, interviewId: interview._id });
};

export const submitFeedback = async (req, res) => {
    const { interviewId, studentId, rating, comments } = req.body;

    await InterviewFeedback.create({
        interviewId,
        studentId,
        interviewerId: req.user.id,
        rating,
        comments,
    });

    res.json({ message: "Feedback submitted" });
};
export const saveEvaluation = async (req, res) => {
    await InterviewEvaluation.create(req.body);
    res.json({ success: true });
};

