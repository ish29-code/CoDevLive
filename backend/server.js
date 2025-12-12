/*import dotenv from "dotenv";
dotenv.config(); // ✅ must be first
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";


const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Init Socket.io
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));*/

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";

// ✅ Resolve the path to backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, ".env");

// ✅ Load .env before everything else
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error("❌ dotenv error:", result.error);
} else {
  console.log("✅ dotenv loaded");
  console.log("🔍 MONGO_URI:", process.env.MONGO_URI);
}

// ✅ Now connect to MongoDB
await connectDB();

// ✅ Create HTTP + Socket.io server
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);
  socket.on("disconnect", () => console.log("❌ Client disconnected:", socket.id));
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
