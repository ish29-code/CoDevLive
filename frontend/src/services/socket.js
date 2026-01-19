import { io } from "socket.io-client";

// Always read MongoDB user stored after login
const mongoUser = JSON.parse(localStorage.getItem("user"));

export const socket = io("http://localhost:5000", {
    transports: ["websocket"],
    auth: {
        userId: mongoUser?._id   // ✅ ONLY MongoDB id
    }
});
