// socket.js
/*import { Server } from "socket.io";

let io;

export const setupSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        },
    });

    io.on("connection", (socket) => {
        console.log("🔌 User connected:", socket.id);

        socket.on("join-room", (roomId) => {
            socket.join(roomId);
            console.log(`👥 ${socket.id} joined room ${roomId}`);
        });

        socket.on("code-change", ({ roomId, code }) => {
            socket.to(roomId).emit("code-update", code);
        });

        socket.on("webrtc-offer", ({ roomId, offer }) => {
            socket.to(roomId).emit("webrtc-offer", offer);
        });

        socket.on("webrtc-answer", ({ roomId, answer }) => {
            socket.to(roomId).emit("webrtc-answer", answer);
        });

        socket.on("ice-candidate", ({ roomId, candidate }) => {
            socket.to(roomId).emit("ice-candidate", candidate);
        });

        socket.on("toggle-hints", ({ roomId, show, count }) => {
            socket.to(roomId).emit("hints-visibility", { show, count });
        });


        socket.on("disconnect", () => {
            console.log("❌ User disconnected:", socket.id);
        });
    });

    return io;
};

export const getIO = () => io;*/

// backend/socket.js
import { Server } from "socket.io";

let io;
const rooms = {}; // roomId => [socketIds]

export const setupSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        },
    });

    io.on("connection", (socket) => {
        console.log("🔌 Connected:", socket.id);

        // ===== JOIN ROOM =====
        socket.on("join-room", (roomId) => {
            socket.join(roomId);

            if (!rooms[roomId]) rooms[roomId] = [];
            rooms[roomId].push(socket.id);

            // send existing users to new user
            const otherUsers = rooms[roomId].filter(id => id !== socket.id);
            socket.emit("all-users", otherUsers);

            // notify others that new user joined
            socket.to(roomId).emit("user-joined", socket.id);

            console.log(`👥 ${socket.id} joined ${roomId}`);
        });

        // ===== WEBRTC SIGNALING =====
        socket.on("webrtc-offer", ({ to, offer }) => {
            io.to(to).emit("webrtc-offer", { from: socket.id, offer });
        });

        socket.on("webrtc-answer", ({ to, answer }) => {
            io.to(to).emit("webrtc-answer", { from: socket.id, answer });
        });

        socket.on("ice-candidate", ({ to, candidate }) => {
            io.to(to).emit("ice-candidate", { from: socket.id, candidate });
        });

        // ===== CLEANUP =====
        socket.on("disconnect", () => {
            console.log("❌ Disconnected:", socket.id);

            for (const roomId in rooms) {
                rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
                socket.to(roomId).emit("user-left", socket.id);
            }
        });
    });

    return io;
};

export const getIO = () => io;

