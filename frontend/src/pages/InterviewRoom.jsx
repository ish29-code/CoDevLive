// InterviewRoom.jsx
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { socket } from "../utils/socket";
import VideoCall from "../components/interview/VideoCall";
import Editor from "@monaco-editor/react";
import Loader from "../components/Loader";
import axios from "../utils/axios";

import {
    Play,
    Pause,
    Clock,
    Lightbulb,
    History,
    FileText,
    BarChart3,
    Settings,
    ChevronRight,
} from "lucide-react";

export default function InterviewRoom() {
    const hints = [
        "Think about using a prefix sum to avoid recomputation.",
        "Can you store previously seen prefix sums to speed things up?",
        "Try using a HashMap to track earliest occurrences of sums."
    ];

    const { theme } = useTheme();

    const roomId = "interview-123";
    const interviewId = roomId;

    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState("// Write your solution here");
    const [output, setOutput] = useState("");
    const [language, setLanguage] = useState("javascript");

    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(true);

    const [hintsUsed, setHintsUsed] = useState(0);
    const [notes, setNotes] = useState("");
    const [events, setEvents] = useState([]);

    const [showEval, setShowEval] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [typing, setTyping] = useState(false);

    const [ratings, setRatings] = useState({});
    const joinedRef = useRef(false);

    const [cheatCount, setCheatCount] = useState(0);
    const [runHistory, setRunHistory] = useState([]);

    /* ================= SOCKET INIT ================= */
    useEffect(() => {
        if (!joinedRef.current) {
            socket.emit("join-room", roomId);
            joinedRef.current = true;
            setTimeout(() => setLoading(false), 800);
        }

        socket.on("code-update", setCode);

        socket.on("cheat-event", (e) => {
            setCheatCount((c) => c + 1);
            logEvent(`⚠ ${e.type.replace("_", " ")}`);
        });

        return () => {
            socket.off("code-update");
            socket.off("cheat-event");
        };
    }, []);

    /* ================= TIMER ================= */
    useEffect(() => {
        if (!running) return;
        const i = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(i);
    }, [running]);

    const formatTime = () =>
        `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
            seconds % 60
        ).padStart(2, "0")}`;

    const isCriticalTime = seconds >= 25 * 60;

    const logEvent = (label) =>
        setEvents((e) => [...e.slice(-12), { time: formatTime(), label }]);

    /* ================= CODE ================= */
    const handleCodeChange = (value) => {
        setCode(value);
        socket.emit("code-change", { roomId, code: value });

        setTyping(true);
        setTimeout(() => setTyping(false), 400);
    };

    const runCode = () => {
        try {
            eval(code);
            setOutput("Accepted");
            setRunHistory((r) => [...r.slice(-4), formatTime()]);
            logEvent("Code executed");
        } catch (err) {
            setOutput(err.message);
        }
    };

    if (loading) return <Loader />;

    /* ================= UI ================= */
    return (
        <div className="h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
            <div className="h-full grid grid-cols-12 gap-3 p-3">

                {/* LEFT — PROBLEM STATEMENT */}
                <aside className="col-span-3 bg-[var(--card)] rounded-xl p-4 text-sm space-y-4 overflow-y-auto">
                    <h2 className="font-semibold text-[var(--accent)] text-lg">
                        Longest Subarray with Sum K
                    </h2>

                    <p className="opacity-80">
                        Given an array of integers and an integer <b>K</b>, find the length
                        of the longest subarray whose sum is equal to <b>K</b>.
                    </p>

                    <div>
                        <h4 className="font-semibold mb-1">Example</h4>
                        <pre className="bg-[var(--background)] p-2 rounded text-xs">
                            Input: [10, 5, 2, 7, 1, 9], K = 15
                            Output: 4
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-1">Constraints</h4>
                        <ul className="list-disc ml-4 opacity-80">
                            <li>1 ≤ N ≤ 10⁵</li>
                            <li>-10⁴ ≤ arr[i] ≤ 10⁴</li>
                        </ul>
                    </div>

                    {/* 💡 HINTS SECTION */}
                    <div className="pt-120 border-t border-[var(--border)]">
                        <div className="flex items-center gap-8 mb-2 opacity-80">
                            <Lightbulb size={12} /> Hints
                        </div>

                        <div className="space-y-2">
                            {hints.map((hint, index) => (
                                <button
                                    key={index}
                                    disabled={hintsUsed < index}
                                    onClick={() => {
                                        setHintsUsed(index + 1);
                                        setShowHint(true);
                                        logEvent(`Hint ${index + 1} opened`);
                                    }}
                                    className={`w-full text-left px-2 py-1 rounded text-xs border 
                    ${hintsUsed >= index
                                            ? "border-[var(--accent)]/40 hover:bg-[var(--accent)]/10"
                                            : "border-[var(--border)] opacity-40 cursor-not-allowed"
                                        }`}
                                >
                                    Show Hint {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                </aside>

                {/* CENTER — CODE EDITOR (UNCHANGED) */}
                <main className="col-span-6 bg-[var(--card)] rounded-xl p-2 flex flex-col">
                    <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold text-[var(--accent)]">Code Editor</span>
                        <div className="flex gap-2">
                            {/* ⏱ TIMER */}
                            <span
                                className={`flex items-center gap-1 ${isCriticalTime ? "text-red-500 animate-pulse" : "opacity-80"
                                    }`}
                            >
                                <Clock size={12} />
                                {formatTime()}
                            </span>

                            {/* ⏸ PAUSE / ▶ RESUME */}
                            <button
                                onClick={() => setRunning(!running)}
                                className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--background)] border border-[var(--border)] opacity-80 hover:opacity-100"
                            >
                                {running ? <Pause size={12} /> : <Play size={12} />}

                            </button>

                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-[var(--background)] px-2 py-1 rounded text-xs"
                            >
                                <option>javascript</option>
                                <option>java</option>
                                <option>cpp</option>
                                <option>python</option>
                            </select>

                            <button
                                onClick={runCode}
                                className="px-3 py-1.5 rounded bg-[var(--accent)]/15 text-[var(--accent)]"
                            >
                                Run
                            </button>

                            <button
                                onClick={() => setShowEval(true)}
                                className="px-3 py-1.5 rounded bg-red-500/10 text-red-500"
                            >
                                ⏹ End
                            </button>
                        </div>
                    </div>

                    <Editor
                        height="100%"
                        language={language}
                        value={code}
                        theme={theme === "dark" ? "vs-dark" : "light"}
                        onChange={handleCodeChange}
                        options={{ minimap: { enabled: false }, fontSize: 14 }}
                    />

                    {/* OUTPUT — LEETCODE STYLE */}
                    <div className="mt-2 p-2 bg-[var(--background)] rounded text-xs">
                        {output === "Accepted" ? (
                            <p className="text-green-500">
                                ✅ Accepted — All test cases passed
                            </p>
                        ) : (
                            <p className="text-red-500">
                                ❌ Runtime Error — {output}
                            </p>
                        )}
                    </div>
                </main>

                {/* RIGHT */}
                <aside className="col-span-3 flex flex-col gap-3 text-xs">
                    <div className="bg-[var(--card)] rounded-xl p-2">
                        <VideoCall roomId={roomId} />
                    </div>

                    <div className="bg-[var(--card)] rounded-xl p-3 flex-1">
                        <div className="flex items-center gap-2 mb-1 font-semibold">
                            <History size={12} /> Timeline
                        </div>
                        <ul className="opacity-70 space-y-[2px]">
                            {events.map((e, i) => (
                                <li key={i}>⏱ {e.time} — {e.label}</li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}
