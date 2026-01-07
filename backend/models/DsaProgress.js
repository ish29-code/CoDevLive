// models/DsaProgress.js
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true,
        },

        status: {
            type: String,
            enum: ["Accepted", "Wrong Answer", "TLE", "Runtime Error"],
            required: true,
        },

        language: {
            type: String, // javascript, cpp, java, python
            required: true,
        },

        runtime: Number, // ms
        memory: Number, // MB

        submittedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const dsaProgressSchema = new mongoose.Schema(
    {
        /* ================= USER ================= */
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        /* ================= PROBLEM ================= */
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true,
            index: true,
        },

        /* ================= STATUS ================= */
        solved: {
            type: Boolean,
            default: false,
            index: true,
        },

        attempts: {
            type: Number,
            default: 0,
        },

        lastStatus: {
            type: String,
            enum: ["Accepted", "Wrong Answer", "TLE", "Runtime Error"],
        },

        /* ================= CODE ================= */
        lastSubmittedCode: {
            type: String,
        },

        lastLanguage: {
            type: String,
        },

        /* ================= HISTORY ================= */
        submissions: {
            type: [submissionSchema],
            default: [],
        },

        /* ================= TIME ================= */
        firstAttemptAt: {
            type: Date,
        },

        solvedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

/* ================= UNIQUE CONSTRAINT ================= */
dsaProgressSchema.index(
    { userId: 1, problemId: 1 },
    { unique: true }
);

export default mongoose.model("DsaProgress", dsaProgressSchema);
