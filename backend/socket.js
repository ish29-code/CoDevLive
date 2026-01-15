import { Server } from "socket.io";

let io;

export const setupSocket = (server) => {
    io = new Server(server, {
        cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
        console.log("🔌 User connected:", socket.id);

        // Join interview room
        socket.on("join-room", (roomId) => {
            socket.join(roomId);
            console.log(`👥 ${socket.id} joined room ${roomId}`);
        });

        // Code sync
        socket.on("code-change", ({ roomId, code }) => {
            socket.to(roomId).emit("code-update", code);
        });

        // WebRTC
        socket.on("webrtc-offer", ({ roomId, offer }) => {
            socket.to(roomId).emit("webrtc-offer", offer);
        });

        socket.on("webrtc-answer", ({ roomId, answer }) => {
            socket.to(roomId).emit("webrtc-answer", answer);
        });

        socket.on("ice-candidate", ({ roomId, candidate }) => {
            socket.to(roomId).emit("ice-candidate", candidate);
        });

        // Hint toggle
        socket.on("toggle-hints", ({ roomId, show }) => {
            socket.to(roomId).emit("hints-visibility", show);
        });

        socket.on("disconnect", () => {
            console.log("❌ User disconnected:", socket.id);
        });
    });

    return io;
};

// Getter
export const getIO = () => {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
};
