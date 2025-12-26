import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Settings from "../models/Settings.js";

// Helper: generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc Register
export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ fullName, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.json({
      success: true,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Logout
export const logout = async (req, res) => {
  // On frontend, just remove token from storage.
  res.json({ success: true, message: "Logged out successfully" });
};

// @desc Get current user
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

