import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["interviewer", "student"] },
    status: { type: String, enum: ["pending", "approved"], default: "approved" },
    joinedAt: { type: Date, default: Date.now },
});

export default mongoose.model("InterviewParticipant", participantSchema);
