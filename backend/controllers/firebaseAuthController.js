// backend/controllers/firebaseAuthController.js
import admin from "firebase-admin";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// initialize admin once (choose a safe place to import this)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "{}");
  if (serviceAccount && Object.keys(serviceAccount).length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // fallback: try file path if provided
    // admin.initializeApp({ credential: admin.credential.cert(require("../config/firebaseServiceAccount.json")) });
  }
}

const generateToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const firebaseLogin = async (req, res) => {
  try {
    // Accept token from Authorization header (we set it in AuthContext)
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) return res.status(401).json({ success: false, message: "No token" });

    const decoded = await admin.auth().verifyIdToken(token);
    const email = decoded.email;
    if (!email) return res.status(400).json({ success: false, message: "No email in token" });

    // find or create user in your DB
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        fullName: decoded.name || decoded.email.split("@")[0],
        email,
        password: null,
        provider: decoded.firebase.sign_in_provider || "firebase",
      });
    }

    // issue your own JWT for frontend (optional) OR return DB user and rely on Firebase token
    const appToken = generateToken(user._id);

    res.json({ success: true, user: { id: user._id, fullName: user.fullName, email: user.email }, token: appToken });
  } catch (err) {
    console.error("Firebase login error:", err);
    res.status(401).json({ success: false, message: "Invalid Firebase token", error: err.message });
  }
};
