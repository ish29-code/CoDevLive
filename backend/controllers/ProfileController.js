import Profile from "../models/Profile.js";
import cloudinary from "../Utils/cloudinary.js";

/* ================= CREATE / UPDATE PROFILE ================= */
export const upsertProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const {
            name,
            school,
            college,
            location,
            bio,
            skills,
            linkedin,
            github,
            twitter,
        } = req.body;

        let profile = await Profile.findOne({ user: userId });

        // Uploads
        let photoUrl = profile?.photo || "";
        let resumeUrl = profile?.resume || "";

        if (req.files?.photo) {
            const upload = await cloudinary.uploader.upload(
                req.files.photo.tempFilePath,
                { folder: "profiles/photos" }
            );
            photoUrl = upload.secure_url;
        }

        if (req.files?.resume) {
            const upload = await cloudinary.uploader.upload(
                req.files.resume.tempFilePath,
                { folder: "profiles/resumes", resource_type: "raw" }
            );
            resumeUrl = upload.secure_url;
        }

        if (!profile) {
            profile = await Profile.create({
                user: userId,
                name,
                school,
                college,
                location,
                bio,
                skills,
                linkedin,
                github,
                twitter,
                photo: photoUrl,
                resume: resumeUrl,
            });
        } else {
            Object.assign(profile, {
                name,
                school,
                college,
                location,
                bio,
                skills,
                linkedin,
                github,
                twitter,
                photo: photoUrl,
                resume: resumeUrl,
            });

            await profile.save();
        }

        res.status(200).json(profile);
    } catch (err) {
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

        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
