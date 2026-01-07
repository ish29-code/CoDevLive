// models/Problem.js
import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
    {
        input: {
            type: String, // raw input string (judge-ready)
            required: true,
        },
        output: {
            type: String, // expected output
            required: true,
        },
    },
    { _id: false }
);

const problemSchema = new mongoose.Schema(
    {
        /* ================= BASIC INFO ================= */
        title: {
            type: String,
            required: true,
            index: true,
        },

        slug: {
            type: String, // e.g. "two-sum"
            required: true,
            unique: true,
        },

        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            required: true,
            index: true,
        },

        pattern: {
            type: String, // Arrays, DP, Graphs, etc.
            required: true,
            index: true,
        },

        /* ================= CONTENT ================= */
        description: {
            type: String, // HTML / Markdown supported
            required: true,
        },

        constraints: {
            type: String,
        },

        examples: [
            {
                input: String,
                output: String,
                explanation: String,
            },
        ],

        /* ================= JUDGE ================= */
        testCases: {
            type: [testCaseSchema],
            required: true,
        },

        timeLimit: {
            type: Number, // in ms
            default: 2000,
        },

        memoryLimit: {
            type: Number, // in MB
            default: 256,
        },

        /* ================= METADATA ================= */
        tags: {
            type: [String], // ["array", "hashmap"]
            index: true,
        },

        companies: {
            type: [String], // Amazon, Google, etc.
            index: true,
        },

        /* ================= STATS ================= */
        stats: {
            totalSubmissions: { type: Number, default: 0 },
            acceptedSubmissions: { type: Number, default: 0 },
        },

        /* ================= STATUS ================= */
        isPublished: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

/* ================= INDEXES FOR SCALE ================= */
problemSchema.index({ pattern: 1, difficulty: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ companies: 1 });

export default mongoose.model("Problem", problemSchema);

