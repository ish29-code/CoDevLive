import mongoose from "mongoose";

/* ================= TEST CASE SCHEMA ================= */
const testCaseSchema = new mongoose.Schema(
    {
        input: {
            type: String,
            required: true
        },

        output: {
            type: String,
            required: true
        }
    },
    { _id: false }
);

/* ================= PROBLEM SCHEMA ================= */

const problemSchema = new mongoose.Schema(
    {
        /* ===== BASIC INFO ===== */

        title: {
            type: String,
            required: true
        },

        slug: {
            type: String,
            required: true,
            unique: true
        },

        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            required: true
        },

        pattern: {
            type: String, // e.g. Two Pointer, Sliding Window, Graph
            required: true
        },

        /* ===== CONTENT ===== */

        description: {
            type: String,
            required: true
        },

        constraints: {
            type: String
        },

        examples: [
            {
                input: String,
                output: String,
                explanation: String
            }
        ],

        /* ===== JUDGE SYSTEM ===== */

        testCases: {
            type: [testCaseSchema],
            required: true
        },

        timeLimit: {
            type: Number, // milliseconds
            default: 2000
        },

        memoryLimit: {
            type: Number, // MB
            default: 256
        },

        /* ===== METADATA ===== */

        tags: [
            String // ["array", "two-pointer", "hashmap"]
        ],

        companies: [
            String // ["Amazon", "Google", "Microsoft"]
        ],

        /* ===== STATS ===== */

        stats: {
            totalSubmissions: {
                type: Number,
                default: 0
            },

            acceptedSubmissions: {
                type: Number,
                default: 0
            }
        },

        /* ===== STATUS ===== */

        isPublished: {
            type: Boolean,
            default: true
        }
    },

    { timestamps: true }
);

/* ================= INDEXES FOR PERFORMANCE ================= */

problemSchema.index({ slug: 1 });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ pattern: 1 });
problemSchema.index({ pattern: 1, difficulty: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ companies: 1 });

export default mongoose.model("Problem", problemSchema);
