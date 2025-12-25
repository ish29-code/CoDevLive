import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        emailNotifications: {
            type: Boolean,
            default: true,
        },

        productUpdates: {
            type: Boolean,
            default: false,
        },

        twoFA: {
            enabled: {
                type: Boolean,
                default: false,
            },
            secret: {
                type: String,
            },
        },

        reduceMotion: {
            type: Boolean,
            default: false,
        },

        publicProfile: {
            type: Boolean,
            default: true,
        },

        language: {
            type: String,
            default: "English (US)",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
