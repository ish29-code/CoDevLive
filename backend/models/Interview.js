import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
        type: String,
        enum: ["scheduled", "live", "ended"],
        default: "scheduled",
    },
}, { timestamps: true });

export default mongoose.model("Interview", interviewSchema);
