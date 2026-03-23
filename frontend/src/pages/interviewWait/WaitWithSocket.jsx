import { getSocket } from "../../utils/socket";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import { useAuth } from "@/context/AuthContext";

import api from "../../utils/axios";
import { toast } from "sonner";

export default function InterviewWait() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { socketReady } = useAuth();

    const [isHost, setIsHost] = useState(false);
    const [checked, setChecked] = useState(false);

    // ---- Check role once ----
    useEffect(() => {
        if (!roomId || !user?._id) return;

        api.get(`/interview/${roomId}`).then(res => {
            if (res.data.isCreator) setIsHost(true);
            setChecked(true);
        });
    }, [roomId, user]);

    // ---- Redirect host immediately ----
    useEffect(() => {
        if (checked && isHost) {
            navigate(`/interview/${roomId}`);
        }
    }, [checked, isHost, navigate, roomId]);

    useEffect(() => {
        if (!socketReady) {
            return;
        }
        const socket = getSocket();

        // 🔥 IMPORTANT FIX
        if (!socket) {
            console.log("⏳ Socket not ready (Wait page)");
            return;
        }

        const join = () => {
            socket.emit("join-room", roomId);
        };

        if (socket.connected) {
            join();
        } else {
            socket.once("connect", join);
        }

        const handleApproved = ({ userId }) => {
            if (userId !== user._id) return;
            navigate(`/interview/${roomId}`);
        };

        const handleRejected = () => {
            toast.error("Your interviewer rejected your request.");
            navigate(`/interview/lobby/${roomId}`);
        };

        socket.on("participant-approved", handleApproved);
        socket.on("participant-rejected", handleRejected);

        return () => {
            socket.off("participant-approved", handleApproved);
            socket.off("participant-rejected", handleRejected);
        };

    }, [socketReady, roomId, navigate]);



    // ---- While checking role ----
    if (!checked) return <Loader />;

    // ---- Host never sees wait ----
    if (isHost) return null;

    // ---- Waiting UI ----
    return (
        <div className="relative">
            <Loader />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--foreground)] pt-45">
                <h2 className="text-lg font-semibold text-[var(--accent)]">
                    ⏳ Waiting for interviewer approval...
                </h2>

                <p className="text-xs opacity-60 mt-2">
                    Please wait… Do not refresh this page.
                </p>
            </div>
        </div>
    );
}
