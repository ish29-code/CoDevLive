// src/pages/Interview.jsx
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { socket } from "../utils/socket";
import VideoCall from "../components/VideoCall";
import Editor from "@monaco-editor/react";
import {
    Play,
    Lightbulb,
    Clock,
    CheckCircle,
    XCircle,
} from "lucide-react";

/* =====================================================
   INTERVIEW PAGE (ALL FEATURES IN ONE FILE)
   ===================================================== */

export default function Interview() {
    const { theme } = useTheme();
    const roomId = "interview-123";

    /* ================= STATES ================= */
    const [code, setCode] = useState("// Start coding here...");
    const [output, setOutput] = useState("");
    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(true);
    const [showEval, setShowEval] = useState(false);

    const [checklist, setChecklist] = useState({
        clarify: false,
        brute: false,
        optimize: false,
        final: false,
        analysis: false,
    });

    const [events, setEvents] = useState([]);
    const [hintsUsed, setHintsUsed] = useState(0);

    const joinedRef = useRef(false);

    /* ================= SOCKET ================= */
    useEffect(() => {
        if (!joinedRef.current) {
            socket.emit("join-room", roomId);
            joinedRef.current = true;
        }

        socket.on("code-update", (newCode) => setCode(newCode));

        return () => {
            socket.off("code-update");
        };
    }, []);

    /* ================= TIMER ================= */
    useEffect(() => {
        if (!running) return;
        const interval = setInterval(() => setTime((t) => t + 1), 1000);
        return () => clearInterval(interval);
    }, [running]);

    const formatTime = () =>
        `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(
            time % 60
        ).padStart(2, "0")}`;

    /* ================= CODE EDITOR ================= */
    const handleCodeChange = (value) => {
        setCode(value);
        socket.emit("code-change", { roomId, code: value });
    };

    /* ================= RUN CODE ================= */
    const runCode = () => {
        try {
            const result = eval(code);
            setOutput(String(result ?? "Executed successfully"));
            logEvent("Ran code");
        } catch (err) {
            setOutput(err.message);
        }
    };

    /* ================= EVENTS ================= */
    const logEvent = (label) => {
        setEvents((e) => [
            ...e,
            { time: formatTime(), label },
        ]);
    };

    /* ================= UI ================= */
    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            <div className="container-center py-4 grid grid-cols-1 lg:grid-cols-4 gap-4">

                {/* ================= LEFT: PROBLEM + CHECKLIST ================= */}
                <div className="settings-card bg-[var(--card)] p-4 space-y-4">
                    <h2 className="font-bold text-lg text-[var(--accent)]">Problem</h2>
                    <p className="text-sm opacity-80">
                        Find the longest subarray with sum K.
                    </p>

                    <div className="border-t pt-3 space-y-2">
                        <h3 className="font-semibold text-sm">Interview Flow</h3>

                        {Object.entries(checklist).map(([key, value]) => (
                            <label
                                key={key}
                                className="flex items-center gap-2 text-sm cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={() => {
                                        setChecklist({
                                            ...checklist,
                                            [key]: !value,
                                        });
                                        logEvent(`Completed ${key}`);
                                    }}
                                />
                                {key}
                            </label>
                        ))}
                    </div>
                </div>

                {/* ================= CENTER: EDITOR ================= */}
                <div className="lg:col-span-2 settings-card bg-[var(--card)] p-3">
                    <Editor
                        height="60vh"
                        language="javascript"
                        theme={theme === "dark" ? "vs-dark" : "light"}
                        value={code}
                        onChange={handleCodeChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            smoothScrolling: true,
                        }}
                    />

                    {/* RUN PANEL */}
                    <div className="mt-3 p-3 rounded-lg bg-black text-green-400 text-sm min-h-[120px]">
                        {output || "Output will appear here..."}
                    </div>

                    <button
                        onClick={runCode}
                        className="btn-outline mt-3 flex items-center gap-2"
                    >
                        <Play size={16} /> Run Code
                    </button>
                </div>

                {/* ================= RIGHT: VIDEO + TOOLS ================= */}
                <div className="space-y-4">

                    {/* TIMER */}
                    <div className="settings-card bg-[var(--card)] p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock size={18} />
                            <span className="font-semibold">{formatTime()}</span>
                        </div>
                        <button
                            className="btn-outline text-xs"
                            onClick={() => setRunning(!running)}
                        >
                            {running ? "Pause" : "Resume"}
                        </button>
                    </div>

                    {/* VIDEO */}
                    <div className="settings-card bg-[var(--card)] p-3">
                        <VideoCall roomId={roomId} />
                    </div>

                    {/* HINTS */}
                    <div className="settings-card bg-[var(--card)] p-4 space-y-2">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Lightbulb size={16} /> Hints
                        </h3>

                        <button
                            className="btn-outline text-xs"
                            onClick={() => {
                                setHintsUsed((h) => h + 1);
                                logEvent("Used hint");
                            }}
                        >
                            Use Hint ({hintsUsed})
                        </button>

                        <p className="text-sm opacity-70">
                            Try using prefix sum + hashmap.
                        </p>
                    </div>

                    {/* REPLAY */}
                    <div className="settings-card bg-[var(--card)] p-4">
                        <h3 className="font-semibold mb-2">Replay</h3>
                        <ul className="text-xs space-y-1 opacity-80">
                            {events.map((e, i) => (
                                <li key={i}>
                                    ⏱ {e.time} — {e.label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* END */}
                    <button
                        onClick={() => setShowEval(true)}
                        className="btn-primary w-full"
                    >
                        End Interview
                    </button>
                </div>
            </div>

            {/* ================= EVALUATION MODAL ================= */}
            {showEval && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[var(--card)] p-6 rounded-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Evaluation</h2>

                        {["Problem Solving", "Communication", "Code Quality", "Optimization"].map(
                            (s) => (
                                <div key={s} className="flex justify-between mb-3">
                                    <span>{s}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="5"
                                        className="w-16 border p-1 rounded"
                                    />
                                </div>
                            )
                        )}

                        <textarea
                            placeholder="Notes"
                            className="w-full border p-2 rounded mt-3"
                        />

                        <button
                            onClick={() => setShowEval(false)}
                            className="btn-primary w-full mt-4"
                        >
                            Save Evaluation
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
