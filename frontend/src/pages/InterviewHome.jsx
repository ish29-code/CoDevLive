import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import Loader from "../components/Loader";
import api from "../utils/axios";
import { Video, Link2, ArrowRight } from "lucide-react";

export default function InterviewHome() {
    const { theme } = useTheme();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [joinId, setJoinId] = useState("");

    /* ================= CREATE INTERVIEW ================= */
    const createInterview = async () => {
        setLoading(true);
        try {
            const res = await api.post("/interview/create");
            navigate(`/interview/lobby/${res.data.roomId}`);
        } catch (err) {
            console.error(err);
            alert("Failed to create interview");
        } finally {
            setLoading(false);
        }
    };

    /* ================= JOIN INTERVIEW ================= */
    const joinInterview = () => {
        if (!joinId.trim()) return alert("Enter interview ID");
        navigate(`/interview/lobby/${joinId}`);
    };

    /* ================= LOADER ================= */
    if (loading) return <Loader />;

    /* ================= UI ================= */
    return (
        <div className="min-h-screen page-bg flex items-center justify-center text-[var(--foreground)]">
            <div className="card-ui w-[420px] p-6 space-y-6">

                {/* HEADER */}
                <div>
                    <h1 className="text-xl font-semibold text-[var(--accent)]">
                        CoDevLive Interview
                    </h1>
                    <p className="text-sm opacity-70 mt-1">
                        Live coding interview with video, evaluation & analytics
                    </p>
                </div>

                {/* CREATE */}
                <button
                    onClick={createInterview}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    <Video size={18} />
                    Create Interview
                </button>

                {/* DIVIDER */}
                <div className="flex items-center gap-2 opacity-50 text-xs">
                    <span className="flex-1 h-px bg-[var(--border)]" />
                    OR
                    <span className="flex-1 h-px bg-[var(--border)]" />
                </div>

                {/* JOIN */}
                <div className="space-y-2">
                    <label className="text-xs opacity-70">
                        Join with Interview ID
                    </label>

                    <div className="flex gap-2">
                        <input
                            value={joinId}
                            onChange={(e) => setJoinId(e.target.value)}
                            placeholder="e.g. interview-123"
                            className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        />

                        <button
                            onClick={joinInterview}
                            className="btn-outline px-3"
                        >
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                {/* INFO */}
                <div className="text-xs opacity-60 leading-relaxed">
                    • Camera & mic check before joining
                    <br />
                    • Real-time coding + video
                    <br />
                    • Anti-cheat & evaluation enabled
                </div>
            </div>
        </div>
    );
}
