import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { setupSocket } from "./socket.js";

/* ================= ENV ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, ".env");

const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error("❌ dotenv error:", result.error);
} else {
  console.log("✅ dotenv loaded");
}

/* ================= DB ================= */
await connectDB();

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

/* ================= SOCKET ================= */
setupSocket(server);

/* ================= START ================= */
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
