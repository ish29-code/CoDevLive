import Profile from "../models/Profile.js";
import cloudinary from "../Utils/cloudinary.js";

export const upsertProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const {
            name,
            school,
            college,
            location,
            bio,
            linkedin,
            github,
            twitter,
        } = req.body || {};

        let skills = [];
        if (req.body?.skills) {
            try {
                skills = Array.isArray(req.body.skills)
                    ? req.body.skills
                    : JSON.parse(req.body.skills);
            } catch {
                skills = [];
            }
        }

        let photoUrl;
        let resumeUrl;

        // 🔹 Upload photo if exists
        if (req.files?.photo) {
            const upload = await cloudinary.uploader.upload(
                req.files.photo.tempFilePath,
                { folder: "profiles/photos" }
            );
            photoUrl = upload.secure_url;
        }

        // 🔹 Upload resume if exists
        if (req.files?.resume) {
            const upload = await cloudinary.uploader.upload(
                req.files.resume.tempFilePath,
                {
                    folder: "profiles/resumes",
                    resource_type: "raw",
                }
            );
            resumeUrl = upload.secure_url;
        }

        // ✅ ATOMIC UPSERT (THIS FIXES DUPLICATE KEY)
        const profile = await Profile.findOneAndUpdate(
            { user: userId },
            {
                $set: {
                    name,
                    school,
                    college,
                    location,
                    bio,
                    skills,
                    linkedin,
                    github,
                    twitter,
                    ...(photoUrl && { photo: photoUrl }),
                    ...(resumeUrl && { resume: resumeUrl }),
                },
            },
            {
                new: true,
                upsert: true, // 🔥 CREATE OR UPDATE
                setDefaultsOnInsert: true,
            }
        );

        res.status(200).json(profile);
    } catch (err) {
        console.error("❌ PROFILE ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};


/* ================= GET PROFILE ================= */
export const getMyProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user._id });

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.status(200).json(profile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
