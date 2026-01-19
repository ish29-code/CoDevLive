
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

// controllers/interviewController.js
export const joinInterview = async (req, res) => {
    const { roomId, role } = req.body;
    const interview = await Interview.findOne({ roomId });
    if (!interview) return res.status(404).json({ message: "Not found" });

    // Host always auto interviewer
    if (req.user.id === interview.createdBy.toString()) {
        await InterviewParticipant.findOneAndUpdate(
            { interviewId: interview._id, userId: req.user.id },
            { role: "interviewer", status: "approved" },
            { upsert: true, new: true }
        );
        return res.json({ role: "interviewer", status: "approved" });
    }

    // Everyone else pending
    const participant = await InterviewParticipant.create({
        interviewId: interview._id,
        userId: req.user.id,
        role,
        status: "pending",
    });

    req.io.to(roomId).emit("join-request", {
        userId: req.user.id,
        name: req.user.name,
        requestedRole: role,
    });

    res.json({ role, status: "pending" });
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

    const isCreator = interview.createdBy.toString() === req.user.id;


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

    let approved = false;

    if (myParticipant) {
        if (myParticipant.role === "student") {
            approved = myParticipant.status === "approved";
        } else {
            approved = true; // interviewer always approved
        }
    }



    res.json({
        roomId: interview.roomId,
        problemId: interview.problemId || null,
        interviewerJoined: !!interviewer,
        myRole: myParticipant?.role || null,
        approved,
        isCreator,
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

export const approveParticipant = async (req, res) => {
    const { roomId, userId } = req.body;
    const interview = await Interview.findOne({ roomId });

    if (interview.createdBy.toString() !== req.user.id)
        return res.status(403).json({ message: "Only host can approve" });

    const participant = await InterviewParticipant.findOneAndUpdate(
        { interviewId: interview._id, userId },
        { status: "approved" },
        { new: true }
    );

    req.io.to(roomId).emit("participant-approved", {
        userId,
        role: participant.role,
    });

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

export const addInterviewer = async (req, res) => {
    const { roomId, newInterviewerId } = req.body;

    const interview = await Interview.findOne({ roomId });

    if (interview.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Only host can add interviewers" });
    }

    if (!interview.interviewers.includes(newInterviewerId)) {
        interview.interviewers.push(newInterviewerId);
        await interview.save();
    }

    res.json({ success: true });
};





