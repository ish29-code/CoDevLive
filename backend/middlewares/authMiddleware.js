/*import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (err) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });
};
*/

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import admin from "../config/firebaseAdmin.js"; // firebase-admin SDK

export const protect = async (req, res, next) => {
  let token;

  // Read Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // ===== 1) Try Backend JWT =====
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) throw new Error("User not found");

      return next();
    } catch (err) {
      // If JWT fails → Try Firebase
    }

    // ===== 2) Try Firebase ID Token =====
    const decodedFirebase = await admin.auth().verifyIdToken(token);

    // Find or auto-create user in MongoDB
    let user = await User.findOne({ email: decodedFirebase.email });

    if (!user) {
      user = await User.create({
        name: decodedFirebase.name || decodedFirebase.email.split("@")[0],
        email: decodedFirebase.email,
        avatar: decodedFirebase.picture,
        firebaseUid: decodedFirebase.uid,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Not authorized" });
  }
};
