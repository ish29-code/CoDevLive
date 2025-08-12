const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

const app = express();

// Middlewares (add if needed)
app.use(cors());
app.use(express.json());

// Create HTTP server & Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Change this to your frontend URL in production
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  // Add your socket event handlers here
});

server.listen(PORT, () => {
  console.log(`Socket.IO server running on port http://localhost:${PORT}`);
});
