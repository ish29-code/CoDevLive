import express from "express";
import { register, login, logout, getMe } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// 🔹 Normal auth routes
router.post("/signup", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

// -----------------------------
// 🔹 OAuth with Google & GitHub
// -----------------------------

// Google Login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "http://localhost:5173/authpage" }),
  (req, res) => {
    // ✅ Issue JWT for frontend
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // send token to frontend (redirect with token in query param)
    res.redirect(`http://localhost:5173/authpage?token=${token}`);
  }
);

// GitHub Login
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "http://localhost:5173/authpage" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`http://localhost:5173/authpage?token=${token}`);
  }
);

export default router;
