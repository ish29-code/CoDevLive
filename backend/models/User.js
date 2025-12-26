import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // 🔐 Only LOCAL users have password
    password: {
      type: String,
      select: false,
    },

    // 🔑 Auth provider
    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },

    // 🔁 Password reset (LOCAL only)
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

/* ================= HASH PASSWORD ================= */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* ================= COMPARE PASSWORD ================= */
// ✅ REQUIRED for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
