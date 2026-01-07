// models/Submission.js
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },

    language: String,
    code: String,

    verdict: {
        type: String,
        enum: ["Accepted", "Wrong Answer", "TLE", "Runtime Error"],
    },

    runtime: String,
    memory: String,

}, { timestamps: true });

export default mongoose.model("Submission", submissionSchema);
