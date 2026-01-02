import mongoose from "mongoose";

const schema = new mongoose.Schema({
    interviewId: String,
    ratings: Object,
    comments: String,
    events: Array,
    hintsUsed: Number,
    duration: Number,
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("InterviewEvaluation", schema);
