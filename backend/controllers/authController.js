import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Settings from "../models/Settings.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../Utils/sendEmail.js";


/* ================= HELPER ================= */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/* ================= REGISTER (LOCAL USERS) ================= */
export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      fullName,
      email,
      password,
      provider: "local", // 🔥 important
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        provider: user.provider,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //console.log("🔐 LOGIN REQUEST:", { email });

    const user = await User.findOne({ email }).select("+password");

    //console.log("👤 USER FOUND:", !!user);

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔥 CRITICAL FIX
    if (user.provider !== "local") {
      return res.status(400).json({
        message: "This account uses Google/GitHub login",
      });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Password not set" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    //console.log("🔑 PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        provider: user.provider,
      },
      token,
    });
  } catch (err) {
    console.error("🔥 LOGIN CRASH:", err);
    res.status(500).json({ message: "Server error" });
  }
};




/* ================= LOGOUT ================= */
export const logout = async (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};

/* ================= GET CURRENT USER ================= */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE ACCOUNT ================= */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Delete user settings
    await Settings.deleteOne({ userId });

    // 2️⃣ Delete user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ message: "Failed to delete account" });
  }
};

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email,
      provider: "local",
    });

    if (!user) {
      return res.status(404).json({
        message: "No local account found with this email",
      });
    }

    // 🔐 Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    // 🔗 Reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // 📧 Send email
    await sendEmail({
      to: user.email,
      subject: "Reset your CoDevLive password",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    res.json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({
      message: "Failed to send reset email",
    });
  }
};


export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
    provider: "local", // 🔥 MUST BE LOCAL
  }).select("+password");

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.password = newPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;

  await user.save(); // triggers bcrypt hash

  res.json({ success: true });
};
