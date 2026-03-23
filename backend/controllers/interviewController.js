
import InterviewParticipant from "../models/InterviewParticipant.js";
import InterviewFeedback from "../models/InterviewFeedback.js";
import crypto from "crypto";
import Interview from "../models/Interview.js";
import InterviewEvaluation from "../models/InterviewEvaluation.js";
import { getIO, userSockets } from "../socket.js";

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
    const userId = req.user.id;

    const interview = await Interview.findOne({ roomId });
    if (!interview)
        return res.status(404).json({ message: "Interview not found" });

    // ✅ 1. HOST ALWAYS DIRECT
    if (userId.toString() === interview.createdBy.toString()) {
        await InterviewParticipant.findOneAndUpdate(
            { interviewId: interview._id, userId },
            { role: "interviewer", status: "approved" },
            { upsert: true, new: true }
        );

        interview.interviewerJoined = true;
        await interview.save();

        return res.json({ role: "interviewer", status: "approved", direct: true });
    }

    // ✅ 2. Already joined user
    // 2. Already joined user
    /*const existing = await InterviewParticipant.findOne({
        interviewId: interview._id,
        userId
    });

    if (existing) {
        // 🔥 Re-fetch fresh copy from DB to avoid stale status
        const participant = await InterviewParticipant
            .findOne({ interviewId: interview._id, userId })
            .lean();

        return res.json({
            role: participant.role,
            status: participant.status,   // ✅ now latest (approved if host approved)
            direct: false
        });
    }*/

    // ✅ 3. New participant → pending
    await InterviewParticipant.create({
        interviewId: interview._id,
        userId,
        role,
        status: "pending"
    });
    console.log("HOST CHECK", interview.createdBy.toString(), userId);

    // notify host DIRECTLY (IMPORTANT FIX)
    console.log("🧠 userSockets map:", [...userSockets.entries()]);
    console.log("EMITTING JOIN REQUEST TO HOST");



    const io = getIO();

    io.to(roomId).emit("join-request", {
        userId,
        name: req.user.fullName || req.user.email,
        role
    });
    console.log("✅ Join request emitted to room:", roomId);

    /*let hostSocket = getUserSocket(interview.createdBy.toString());

    let retries = 6;

    while (!hostSocket && retries > 0) {
        console.log("⏳ Waiting for host socket...");
        await new Promise(res => setTimeout(res, 500));
        hostSocket = getUserSocket(interview.createdBy.toString());
        retries--;
    }

    if (hostSocket) {
        io.to(hostSocket).emit("join-request", {
            userId,
            name: req.user.fullName || req.user.email,
            role
        });
        console.log("✅ Join request sent to host");
    } else {
        console.log("❌ Host socket STILL NOT FOUND after retries");
    }*/




    return res.json({
        role,
        status: "pending",
        direct: false
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

/*export const getInterview = async (req, res) => {
    const { roomId } = req.params;

    const interview = await Interview.findOne({ roomId });
    if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
    }

    const isCreator = interview.createdBy.toString() === req.user.id;


    let myParticipant = await InterviewParticipant.findOne({
        interviewId: interview._id,
        userId: req.user.id,
    });

    // 🔥 If creator but participant not yet created → treat as interviewer
    if (!myParticipant && interview.createdBy.toString() === req.user.id) {
        myParticipant = await InterviewParticipant.create({
            interviewId: interview._id,
            userId: req.user.id,
            role: "interviewer",
            status: "approved"
        });
    }


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

};*/

// controllers/interviewController.js

export const getInterview = async (req, res) => {
    const { roomId } = req.params;
    const interview = await Interview.findOne({ roomId });
    if (!interview)
        return res.status(404).json({ message: "Interview not found" });

    const userId = req.user.id;

    let myParticipant = await InterviewParticipant.findOne({
        interviewId: interview._id,
        userId: req.user.id
    }).lean();

    const approved = myParticipant ? myParticipant.status === "approved" : false;



    // 🔥 auto-create host participant
    if (!myParticipant && interview.createdBy.toString() === userId.toString()) {
        myParticipant = await InterviewParticipant.create({
            interviewId: interview._id,
            userId,
            role: "interviewer",
            status: "approved"
        });
    }

    const interviewer = await InterviewParticipant.findOne({
        interviewId: interview._id,
        role: "interviewer",
        status: "approved"
    });

    /*console.log("GET INTERVIEW:", {
        user: req.user.id,
        participant: myParticipant
    });*/



    res.json({
        roomId: interview.roomId,
        problemId: interview.problemId || null,
        interviewerJoined: !!interviewer,
        myRole: myParticipant?.role || null,
        approved,
        isCreator: interview.createdBy.toString() === userId,
    });
};





/*export const assignProblem = async (req, res) => {
    const { roomId, problemId } = req.body;
    const userId = req.user.id;

    const interview = await Interview.findOne({ roomId });
    if (!interview)
        return res.status(404).json({ message: "Interview not found" });

    const participant = await InterviewParticipant.findOne({
        interviewId: interview._id,
        userId,
        role: "interviewer",
        status: "approved"
    });

    if (!participant)
        return res.status(403).json({ message: "Not a participant" });

    interview.problemId = problemId;
    await interview.save();

    const io = getIO();
    io.to(roomId).emit("problem-assigned", { problemId });

    res.json({ success: true });
};*/
export const assignProblem = async (req, res) => {
    const { roomId, problemId } = req.body;
    const userId = req.user.id;

    // Find interview
    const interview = await Interview.findOne({ roomId });
    if (!interview)
        return res.status(404).json({ message: "Interview not found" });

    // 🔥 Ensure host is recognized as interviewer participant
    let participant = await InterviewParticipant.findOne({
        interviewId: interview._id,
        userId
    });

    // If host exists but participant doc not created yet → create it
    if (!participant && interview.createdBy.toString() === userId.toString()) {
        participant = await InterviewParticipant.create({
            interviewId: interview._id,
            userId,
            role: "interviewer",
            status: "approved"
        });
    }

    // ❌ Block if still not interviewer
    if (!participant || participant.role !== "interviewer" || participant.status !== "approved") {
        return res.status(403).json({ message: "Not a participant" });
    }

    // ✅ Assign problem
    interview.problemId = problemId;
    await interview.save();

    // 🔔 Notify students
    const io = getIO();
    io.to(roomId).emit("problem-assigned", { problemId });

    res.json({ success: true });
};


export const approveParticipant = async (req, res) => {
    const { roomId, userId } = req.body;

    const interview = await Interview.findOne({ roomId });
    if (!interview)
        return res.status(404).json({ message: "Interview not found" });

    // 🔍 DEBUG LOGS — always print first
    /*console.log("REQ.USER.ID:", req.user?.id?.toString());
    console.log("INTERVIEW.CREATEDBY:", interview.createdBy.toString());*/

    // ❌ Only host can approve
    if (req.user.id.toString() !== interview.createdBy.toString()) {
        return res.status(403).json({ message: "Only host can approve" });
    }

    // ✅ Approve participant
    const participant = await InterviewParticipant.findOneAndUpdate(
        { interviewId: interview._id, userId },
        { status: "approved" },
        { new: true }   // 🔥 must be present
    );

    //console.log("PARTICIPANT FOUND:", participant);

    // 🔔 Notify via socket
    /* const io = getIO();
     io.to(roomId).emit("participant-approved", {
         userId: userId,
         role: participant.role
     });*/
    // ✅ FIXED SOCKET EMIT
    const io = getIO();

    io.to(roomId).emit("participant-approved", {
        userId,
        role: participant.role
    });
    /*const participantSocket = getUserSocket(userId.toString());

    console.log("🔍 Looking for participant:", userId.toString());
    console.log("🎯 Found participant socket:", participantSocket);

    if (participantSocket) {
        getIO().to(participantSocket).emit("participant-approved", {
            userId,
            role: participant.role
        });
    } else {
        console.log("❌ Participant socket NOT FOUND");
    }*/

    res.json({ success: true });
};



export const getPending = async (req, res) => {
    try {
        const interview = await Interview.findOne({ roomId: req.params.roomId });
        if (!interview) return res.status(404).json({ message: "Interview not found" });

        const pending = await InterviewParticipant.find({
            interviewId: interview._id,
            status: "pending"
        }).populate("userId", "fullName email");

        // 🔥 Send clean frontend-friendly data
        const result = pending.map(p => ({
            _id: p._id,
            userId: p.userId._id,
            name: p.userId.fullName || p.userId.email,
            role: p.role,
            status: p.status
        }));

        res.json(result);
    } catch (err) {
        console.error("Get pending error:", err);
        res.status(500).json({ message: "Failed to load pending list" });
    }
};

export const rejectParticipant = async (req, res) => {
    const { roomId, userId } = req.body;

    const interview = await Interview.findOne({ roomId });
    if (!interview)
        return res.status(404).json({ message: "Interview not found" });

    //console.log("REQ.USER.ID:", req.user?.id?.toString());
    //console.log("INTERVIEW.CREATEDBY:", interview.createdBy.toString());

    if (req.user.id.toString() !== interview.createdBy.toString()) {
        return res.status(403).json({ message: "Only host can reject" });
    }

    await InterviewParticipant.deleteOne({
        interviewId: interview._id,
        userId: userId,
        status: "pending"
    });

    const io = getIO();

    io.to(roomId).emit("participant-rejected", {
        userId,
        role: participant.role
    });
    /*const participantSocket = getUserSocket(userId.toString());

    console.log("🔍 Looking for student:", userId.toString());
    console.log("🎯 Found student socket:", participantSocket);

    if (participantSocket) {
        getIO().to(participantSocket).emit("participant-rejected", {
            userId,
            role: participant.role
        });
    } else {
        console.log("❌ Student socket NOT FOUND");
    }*/

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





