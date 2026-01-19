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

// backend/middlewares/authMiddleware.js
import admin from "../config/firebaseAdmin.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "No token" });

    const token = authHeader.split(" ")[1];
    const authType = req.headers["x-auth-type"];

    // ===== Firebase Login =====
    if (authType === "firebase") {
      const decoded = await admin.auth().verifyIdToken(token);
      let user = await User.findOne({ email: decoded.email });

      if (!user) {
        user = await User.create({
          fullName: decoded.name || decoded.email,
          email: decoded.email,
          provider: "google",
        });
      }

      req.user = { id: user._id, name: user.fullName, email: user.email };
      return next();
    }

    // ===== Local JWT Login =====
    if (authType === "jwt") {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return res.status(401).json({ message: "User not found" });

      req.user = { id: user._id, name: user.fullName, email: user.email };
      return next();
    }

    return res.status(401).json({ message: "Invalid auth type" });

  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Not authorized" });
  }
};
