import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../utils/socket";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axios";

export default function InterviewWait() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [isHost, setIsHost] = useState(false);
    const [checked, setChecked] = useState(false);

    // ---- Check role once ----
    useEffect(() => {
        if (!roomId || !user?._id) return;

        api.get(`/interview/${roomId}`).then(res => {
            if (res.data.isCreator) {
                setIsHost(true);
            }
            setChecked(true);
        });
    }, [roomId, user]);

    // ---- Redirect host immediately ----
    useEffect(() => {
        if (checked && isHost) {
            navigate(`/interview/${roomId}`);
        }
    }, [checked, isHost, navigate, roomId]);

    // ---- Join socket + listeners ----
    useEffect(() => {
        if (!roomId || !user?._id) return;

        socket.emit("join-room", roomId);

        const onParticipantApproved = ({ userId }) => {
            if (userId === user._id) {
                navigate(`/interview/${roomId}`);
            }
        };

        const onParticipantRejected = ({ userId }) => {
            if (userId === user._id) {
                alert("Host rejected your request");
                navigate(`/interview/lobby/${roomId}`);
            }
        };

        socket.on("participant-approved", onParticipantApproved);
        socket.on("participant-rejected", onParticipantRejected);

        return () => {
            socket.off("participant-approved", onParticipantApproved);
            socket.off("participant-rejected", onParticipantRejected);
        };
    }, [roomId, user, navigate]);

    // ---- 🔥 FALLBACK DB POLLING (guaranteed redirect) ----
    useEffect(() => {
        if (!roomId || !user?._id) return;

        const interval = setInterval(async () => {
            const res = await api.get(`/interview/${roomId}`);

            // If approved in DB → redirect
            if (res.data.approved) {
                navigate(`/interview/${roomId}`);
            }
        }, 1500); // check every 1.5 seconds

        return () => clearInterval(interval);
    }, [roomId, user, navigate]);

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
