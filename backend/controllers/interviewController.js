
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

    // 1. Validate role
    if (!["interviewer", "student"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
    }

    // 2. Find interview
    const interview = await Interview.findOne({ roomId });
    if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
    }

    // 3. Only creator can be interviewer
    if (
        role === "interviewer" &&
        interview.createdBy.toString() !== req.user._id.toString()
    ) {
        return res.status(403).json({
            message: "Only interview creator can join as interviewer",
        });
    }

    // 4. Prevent second interviewer
    const existingInterviewer = await InterviewParticipant.findOne({
        interviewId: interview._id,
        role: "interviewer",
    });

    if (role === "interviewer" && existingInterviewer) {
        return res.status(403).json({
            message: "Interviewer already exists",
        });
    }

    if (role === "student") {
        const io = getIO();
        io.to(roomId).emit("student-join-request", {
            _id: participant._id,
            userId: {
                _id: req.user._id,
                email: req.user.email
            }
        });
    }


    // 5. If user already joined
    let participant = await InterviewParticipant.findOne({
        interviewId: interview._id,
        userId: req.user.id,
    });

    if (participant) {
        return res.json({
            roomId,
            role: participant.role,
            status: participant.status,
        });
    }

    // 6. Create participant
    participant = await InterviewParticipant.create({
        interviewId: interview._id,
        userId: req.user.id,
        role,
        status: role === "student" ? "pending" : "approved",
    });

    // 7. 🔥 If student → notify interviewer in real-time
    if (role === "student") {
        const io = getIO();
        io.to(roomId).emit("student-join-request", {
            _id: participant._id,
            userId: {
                _id: req.user.id,
                name: req.user.name || req.user.email,
                email: req.user.email,
            },
        });
    }

    // 8. Response
    res.json({
        roomId,
        role: participant.role,
        status: participant.status,
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

    const approved =
        myParticipant?.role === "student"
            ? myParticipant.status === "approved"
            : true;


    res.json({
        roomId: interview.roomId,
        problemId: interview.problemId || null,
        status: interview.status,
        interviewerJoined: !!interviewer, // ✅ FIXED
        myRole: myParticipant?.role || null,
        approved,
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

export const approveStudent = async (req, res) => {
    const { roomId, studentId } = req.body;

    const interview = await Interview.findOne({ roomId });
    if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
    }

    const participant = await InterviewParticipant.findOneAndUpdate(
        { interviewId: interview._id, userId: studentId, role: "student" },
        { status: "approved" },
        { new: true }
    );

    if (!participant) {
        return res.status(404).json({ message: "Student not found" });
    }

    const io = getIO();
    io.to(roomId).emit("student-approved", { studentId });

    res.json({ success: true });
};

export const getPendingStudents = async (req, res) => {
    const interview = await Interview.findOne({ roomId: req.params.roomId });

    const pending = await InterviewParticipant.find({
        interviewId: interview._id,
        role: "student",
        status: "pending"
    }).populate("userId", "name email");

    res.json(pending);
};

export const rejectStudent = async (req, res) => {
    const { roomId, studentId } = req.body;

    const interview = await Interview.findOne({ roomId });
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    await InterviewParticipant.findOneAndDelete({
        interviewId: interview._id,
        userId: studentId,
        role: "student",
        status: "pending"
    });

    const io = getIO();
    io.to(roomId).emit("student-rejected", { studentId });

    res.json({ success: true });
};






