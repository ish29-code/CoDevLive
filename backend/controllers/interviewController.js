
import InterviewParticipant from "../models/InterviewParticipant.js";
import InterviewFeedback from "../models/InterviewFeedback.js";
import crypto from "crypto";
import Interview from "../models/Interview.js";
import InterviewEvaluation from "../models/InterviewEvaluation.js";
import { getIO } from "../socket.js";

export const createInterview = async (req, res) => {
    const roomId = crypto.randomUUID();

    await Interview.create({
        roomId,
        createdBy: req.user.id,
    });

    res.status(201).json({ roomId });
};

export const joinInterview = async (req, res) => {
    const { roomId, role } = req.body;

    console.log("Incoming role from frontend:", role);


    // 1. Validate role
    if (!["interviewer", "student"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
    }

    // 2. Find interview
    const interview = await Interview.findOne({ roomId });
    if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
    }

    // 3. Check existing interviewer
    const existingInterviewer = await InterviewParticipant.findOne({
        interviewId: interview._id,
        role: "interviewer",
    });

    // 4. Block student if interviewer not joined
    if (role === "student" && !existingInterviewer) {
        return res.status(403).json({
            message: "Interviewer has not joined yet",
        });
    }

    // 5. Block second interviewer
    if (role === "interviewer" && existingInterviewer) {
        return res.status(403).json({
            message: "Interviewer already exists",
        });
    }

    // 6. If user already joined — return stored role
    let participant = await InterviewParticipant.findOne({
        interviewId: interview._id,
        userId: req.user.id,
    });

    if (participant) {
        return res.json({
            roomId,
            role: participant.role,
            interviewId: interview._id,
        });
    }

    // 7. Create new participant with correct role
    participant = await InterviewParticipant.create({
        interviewId: interview._id,
        userId: req.user.id,
        role, // ✅ role stored correctly
    });

    res.json({
        roomId,
        role: participant.role,
        interviewId: interview._id,
    });
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

export const getInterview = async (req, res) => {
    const { roomId } = req.params;

    const interview = await Interview.findOne({ roomId });
    if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
    }

    // 👤 current user participant
    const myParticipant = await InterviewParticipant.findOne({
        interviewId: interview._id,
        userId: req.user.id,
    });

    // 👨‍💼 check if interviewer EXISTS
    const interviewer = await InterviewParticipant.findOne({
        interviewId: interview._id,
        role: "interviewer",
    });

    res.json({
        roomId: interview.roomId,
        problemId: interview.problemId || null,
        status: interview.status,

        interviewerJoined: !!interviewer, // ✅ FIXED
        myRole: myParticipant?.role || null,
    });
};



// controllers/interviewController.js
export const assignProblem = async (req, res) => {
    const { roomId, problemId } = req.body;

    const interview = await Interview.findOne({ roomId });
    if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
    }

    interview.problemId = problemId;
    await interview.save();

    const io = getIO();
    io.to(roomId).emit("problem-assigned", { problemId });


    res.json({ success: true });
};






