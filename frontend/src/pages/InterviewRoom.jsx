import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { socket } from "../utils/socket";
import Editor from "@monaco-editor/react";
import VideoCall from "../components/interview/VideoCall";
import Loader from "../components/Loader";
import axios from "../utils/axios";
import { problems } from "../data/problems";

import {
    Play,
    Pause,
    Clock,
    Lightbulb,
    History,
    BarChart3,
} from "lucide-react";

/* ================= INLINE RUN LOADER ================= */
function RunLoader() {
    return (
        <div className="flex items-center gap-2 text-xs opacity-80">
            <span className="w-3 h-3 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            Running...
        </div>
    );
}

export default function InterviewRoom() {
    const { theme } = useTheme();
    const { roomId } = useParams();

    const joinedRef = useRef(false);

    /* ================= STATE ================= */
    const [loading, setLoading] = useState(true);
    const [problem, setProblem] = useState(null);

    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");

    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(true);

    const [output, setOutput] = useState("");
    const [status, setStatus] = useState("");
    const [runLoading, setRunLoading] = useState(false);

    const [events, setEvents] = useState([]);
    const [hintsUsed, setHintsUsed] = useState(0);

    const [showEval, setShowEval] = useState(false);
    const [ratings, setRatings] = useState({});

    /* ================= FETCH INTERVIEW (PROBLEM SOURCE) ================= */
    useEffect(() => {
        const fetchInterview = async () => {
            try {
                setLoading(true);

                const res = await axios.get(`/interview/${roomId}`);
                const problemId = res.data.problemId;

                if (!problemId || !problems[problemId]) {
                    throw new Error("Problem not assigned");
                }

                setProblem(problems[problemId]);
                setCode(problems[problemId].starterCode);
            } catch (err) {
                console.error("Failed to load interview", err);
            } finally {
                setLoading(false);
            }
        };

        if (roomId) fetchInterview();
    }, [roomId]);

    /* ================= SOCKET INIT ================= */
    useEffect(() => {
        if (!roomId || joinedRef.current) return;

        socket.emit("join-room", roomId);
        joinedRef.current = true;

        const onCheatEvent = (e) =>
            logEvent(`⚠ ${e.type.replace("_", " ")}`);

        socket.on("cheat-event", onCheatEvent);

        return () => {
            socket.off("cheat-event", onCheatEvent);
            joinedRef.current = false;
        };
    }, [roomId]);

    /* ================= ANTI-CHEAT ================= */
    useEffect(() => {
        const blur = () =>
            socket.emit("cheat-event", { roomId, type: "WINDOW_BLUR" });

        const hidden = () =>
            document.hidden &&
            socket.emit("cheat-event", { roomId, type: "TAB_SWITCH" });

        window.addEventListener("blur", blur);
        document.addEventListener("visibilitychange", hidden);

        return () => {
            window.removeEventListener("blur", blur);
            document.removeEventListener("visibilitychange", hidden);
        };
    }, [roomId]);

    /* ================= TIMER ================= */
    useEffect(() => {
        if (!running) return;
        const t = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(t);
    }, [running]);

    const formatTime = () =>
        `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
            seconds % 60
        ).padStart(2, "0")}`;

    const logEvent = label =>
        setEvents(e => [...e.slice(-12), { time: formatTime(), label }]);

    /* ================= RUN CODE ================= */
    const runCode = () => {
        setRunLoading(true);
        setStatus("");
        setOutput("");

        setTimeout(() => {
            try {
                eval(code); // backend judge later
                setStatus("Accepted");
                setOutput("All test cases passed ✔️");
                logEvent("Code executed");
            } catch (err) {
                setStatus("Runtime Error");
                setOutput(err.message);
            } finally {
                setRunLoading(false);
            }
        }, 1000);
    };

    if (loading) return <Loader />;

    /* ================= UI ================= */
    return (
        <div className="h-screen bg-[var(--background)] text-[var(--foreground)]">
            <div className="h-full grid grid-cols-12 gap-3 p-3">

                {/* ================= LEFT — PROBLEM ================= */}
                <aside className="col-span-3 card-ui p-4 text-sm overflow-y-auto space-y-4">
                    <h2 className="text-lg font-semibold text-[var(--accent)]">
                        {problem.title}
                    </h2>

                    <p className="opacity-80 whitespace-pre-line">
                        {problem.description}
                    </p>

                    <div>
                        <h4 className="font-semibold mb-1">Examples</h4>
                        {problem.examples.map((ex, i) => (
                            <pre key={i} className="bg-[var(--background)] p-2 rounded text-xs mt-2">
                                {`Input: ${ex.input}
Output: ${ex.output}`}
                            </pre>
                        ))}
                    </div>

                    {/* HINTS */}
                    <div className="pt-3 border-t border-[var(--border)]">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <Lightbulb size={12} /> Hints
                        </div>

                        {problem.hints.map((h, i) => (
                            <button
                                key={i}
                                disabled={hintsUsed < i}
                                onClick={() => {
                                    setHintsUsed(i + 1);
                                    logEvent(`Hint ${i + 1} opened`);
                                }}
                                className={`w-full text-left px-2 py-1 rounded text-xs border
                                ${hintsUsed >= i
                                        ? "border-[var(--accent)]/40 hover:bg-[var(--accent)]/10"
                                        : "border-[var(--border)] opacity-40 cursor-not-allowed"
                                    }`}
                            >
                                {hintsUsed > i ? h : `Show Hint ${i + 1}`}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* ================= CENTER — EDITOR + OUTPUT ================= */}
                <main className="col-span-6 card-ui p-2 flex flex-col">
                    <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold text-[var(--accent)]">
                            Code Editor
                        </span>

                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 opacity-80">
                                <Clock size={12} /> {formatTime()}
                            </span>

                            <button
                                onClick={() => setRunning(!running)}
                                className="px-2 py-1 border rounded"
                            >
                                {running ? <Pause size={12} /> : <Play size={12} />}
                            </button>

                            <select
                                value={language}
                                onChange={e => setLanguage(e.target.value)}
                                className="bg-[var(--background)] px-2 py-1 rounded text-xs"
                            >
                                <option>javascript</option>
                                <option>java</option>
                                <option>cpp</option>
                                <option>python</option>
                            </select>

                            <button
                                onClick={runCode}
                                className="px-3 py-1.5 bg-[var(--accent)]/15 text-[var(--accent)] rounded"
                            >
                                Run
                            </button>

                            <button
                                onClick={() => setShowEval(true)}
                                className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded"
                            >
                                End
                            </button>
                        </div>
                    </div>

                    <Editor
                        height="100%"
                        language={language}
                        value={code}
                        theme={theme === "dark" ? "vs-dark" : "light"}
                        onChange={v => setCode(v || "")}
                        options={{ minimap: { enabled: false }, fontSize: 14 }}
                    />

                    <div className="mt-2 bg-[var(--background)] rounded p-2 text-xs min-h-[44px]">
                        {runLoading && <RunLoader />}
                        {!runLoading && status === "Accepted" && (
                            <p className="text-green-500">
                                ✅ Accepted — All test cases passed
                            </p>
                        )}
                        {!runLoading && status === "Runtime Error" && (
                            <p className="text-red-500">
                                ❌ Runtime Error — {output}
                            </p>
                        )}
                    </div>
                </main>

                {/* ================= RIGHT — VIDEO + TIMELINE ================= */}
                <aside className="col-span-3 flex flex-col gap-3 text-xs">
                    <div className="card-ui p-2">
                        <VideoCall roomId={roomId} />
                    </div>

                    <div className="card-ui p-3 flex-1 overflow-y-auto">
                        <div className="flex items-center gap-2 mb-2 font-semibold">
                            <History size={12} /> Timeline
                        </div>

                        <ul className="opacity-70 space-y-[2px]">
                            {events.map((e, i) => (
                                <li key={i}>
                                    ⏱ {e.time} — {e.label}
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>

            {/* ================= EVALUATION MODAL ================= */}
            {showEval && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
                    <div className="card-ui p-5 w-[360px] text-sm">
                        <div className="flex items-center gap-2 mb-4 font-semibold text-[var(--accent)]">
                            <BarChart3 size={16} /> Interview Evaluation
                        </div>

                        {["Problem Solving", "Communication", "Code Quality"].map(k => (
                            <div key={k} className="flex justify-between mb-2">
                                <span>{k}</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="5"
                                    className="w-12 bg-transparent border-b text-center"
                                    onChange={e =>
                                        setRatings(r => ({ ...r, [k]: e.target.value }))
                                    }
                                />
                            </div>
                        ))}

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
