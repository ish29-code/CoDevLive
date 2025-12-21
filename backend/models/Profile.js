import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    // 🔗 Relation with User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one profile per user
    },

    // 🧑 Basic Info
    name: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    school: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    college: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    location: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // 🧠 Skills (from SKILLS asset)
    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    // 🌐 Social Links
    linkedin: {
      type: String,
      trim: true,
    },

    github: {
      type: String,
      trim: true,
    },

    twitter: {
      type: String,
      trim: true,
    },

    // 🖼️ Media
    photo: {
      type: String, // URL
      default: "",
    },

    resume: {
      type: String, // URL
      default: "",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
