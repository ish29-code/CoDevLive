import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    interviewId: mongoose.Schema.Types.ObjectId,
    studentId: mongoose.Schema.Types.ObjectId,
    interviewerId: mongoose.Schema.Types.ObjectId,
    rating: Number,
    comments: String,
}, { timestamps: true });

export default mongoose.model("InterviewFeedback", feedbackSchema);
