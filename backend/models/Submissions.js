import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true
    },

    code: {
        type: String,
        required: true
    },

    language: {
        type: String,
        enum: ["javascript", "python", "cpp", "java", "go"],
        required: true
    },

    status: {
        type: String,
        enum: [
            "Pending",
            "Running",
            "Accepted",
            "Wrong Answer",
            "Runtime Error",
            "Compilation Error",
            "Time Limit Exceeded",
            "Memory Limit Exceeded",
            "Error"
        ],
        default: "Pending"
    },

    output: {
        type: String,
        default: ""
    },

    executionTime: {
        type: Number,
        default: 0
    },

    memoryUsed: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

export default mongoose.model("Submission", submissionSchema);