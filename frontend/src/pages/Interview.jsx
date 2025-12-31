// src/pages/Interview.jsx
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { socket } from "../utils/socket";
import VideoCall from "../components/interview/VideoCall";
import Editor from "@monaco-editor/react";
import {
    Play,
    Pause,
    Clock,
    Lightbulb,
    ListChecks,
    History,
    FileText,
    BarChart3,
    Settings,
    ChevronRight,
} from "lucide-react";


export default function Interview() {
    const { theme } = useTheme();
    const roomId = "interview-123";

    /* ================= STATE ================= */
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

    const joinedRef = useRef(false);

    const checklistKeys = [
        "clarification",
        "bruteForce",
        "optimization",
        "finalCode",
        "complexity",
    ];

    const [checklist, setChecklist] = useState(
        checklistKeys.reduce((a, c) => ({ ...a, [c]: false }), {})
    );

    /* ================= SOCKET ================= */
    useEffect(() => {
        if (!joinedRef.current) {
            socket.emit("join-room", roomId);
            joinedRef.current = true;
        }
        socket.on("code-update", setCode);
        return () => socket.off("code-update");
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

    /* ================= KEYBOARD SHORTCUTS ================= */
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === "Enter") {
                e.preventDefault();
                runCode();
            }
            if (e.key === "Escape") {
                setShowEval(false);
                setShowHint(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    /* ================= CODE ================= */
    const handleCodeChange = (value) => {
        setCode(value);
        socket.emit("code-change", { roomId, code: value });

        setTyping(true);
        setTimeout(() => setTyping(false), 400);
    };

    const runCode = () => {
        try {
            const result = eval(code);
            setOutput(String(result ?? "Executed"));
            logEvent("Code executed");
        } catch (err) {
            setOutput(err.message);
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
            <div className="h-full grid grid-cols-12 gap-3 p-3">

                {/* ========== LEFT ========== */}
                <aside className="col-span-2 bg-[var(--card)] rounded-xl p-3 text-xs space-y-4">
                    <div className="flex items-center gap-2 text-[var(--accent)] font-semibold">
                        <Settings size={14} /> Tools
                    </div>

                    {/* Timer */}
                    <div className="flex justify-between items-center">
                        <span
                            className={`flex items-center gap-2 ${isCriticalTime ? "text-red-500 animate-pulse" : "opacity-80"
                                }`}
                        >
                            <Clock size={12} /> {formatTime()}
                        </span>
                        <button onClick={() => setRunning(!running)}>
                            {running ? <Pause size={12} /> : <Play size={12} />}
                        </button>
                    </div>

                    {/* Flow */}
                    <div>
                        <div className="flex items-center gap-2 mb-1 opacity-80">
                            <ListChecks size={12} /> Flow
                        </div>
                        {Object.entries(checklist).map(([k, v]) => (
                            <label key={k} className="flex gap-2 items-center opacity-70">
                                <input
                                    type="checkbox"
                                    checked={v}
                                    onChange={() => {
                                        setChecklist({ ...checklist, [k]: !v });
                                        logEvent(`Completed ${k}`);
                                    }}
                                />
                                {k}
                            </label>
                        ))}
                    </div>

                    {/* Hint */}
                    <div>
                        <div className="flex items-center gap-2 mb-1 opacity-80">
                            <Lightbulb size={12} /> Hint
                        </div>
                        <button
                            className="underline opacity-70"
                            onClick={() => {
                                setHintsUsed((h) => h + 1);
                                setShowHint(true);
                                logEvent("Hint opened");
                            }}
                        >
                            Use hint ({hintsUsed})
                        </button>
                    </div>

                    {/* Notes */}
                    <div>
                        <div className="flex items-center gap-2 mb-1 opacity-80">
                            <FileText size={12} /> Notes
                        </div>
                        <textarea
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-transparent resize-none opacity-70"
                        />
                    </div>
                </aside>

                {/* ========== CENTER ========== */}
                <main className="col-span-7 bg-[var(--card)] rounded-xl p-2 flex flex-col">
                    <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold text-[var(--accent)]">Code Editor</span>

                        <div className="flex gap-2">
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
                                className="px-3 py-1.5 rounded bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition text-xs"
                            >
                                Run
                            </button>

                            <button
                                onClick={() => setShowEval(true)}
                                className="px-3 py-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition text-xs"
                            >
                                ⏹ End
                            </button>
                        </div>
                    </div>

                    <div
                        className={`flex-1 overflow-hidden rounded-lg transition-all ${typing ? "ring-2 ring-[var(--accent)]/60" : ""
                            }`}
                    >
                        <Editor
                            height="100%"
                            language={language}
                            value={code}
                            theme={theme === "dark" ? "vs-dark" : "light"}
                            onChange={handleCodeChange}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                wordWrap: "on",
                                padding: { top: 10, bottom: 10 },
                            }}
                        />
                    </div>

                    <div className="mt-1 text-xs text-green-500 min-h-[40px]">
                        {output || "Output"}
                    </div>
                </main>

                {/* ========== RIGHT ========== */}
                <aside className="col-span-3 flex flex-col gap-3 text-xs">
                    <div className="bg-[var(--card)] rounded-xl p-2">
                        <VideoCall roomId={roomId} />
                    </div>

                    <div className="bg-[var(--card)] rounded-xl p-3 space-y-1">
                        <div className="flex items-center gap-1 font-semibold">
                            Problem <ChevronRight size={12} />
                        </div>
                        <p className="opacity-80">Longest Subarray with Sum K</p>
                        <div className="flex gap-2">
                            <span className="px-2 py-[2px] rounded bg-green-500/20 text-green-500">
                                Easy
                            </span>
                            <span className="px-2 py-[2px] rounded bg-blue-500/20 text-blue-500">
                                Amazon
                            </span>
                        </div>
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

            {/* ========== HINT DRAWER ========== */}
            <div
                className={`fixed top-0 right-0 h-full w-[300px] bg-[var(--card)] shadow-xl transition-transform duration-300 ${showHint ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="p-4 text-sm space-y-3">
                    <div className="flex justify-between">
                        <h3 className="font-semibold text-[var(--accent)]">Hint</h3>
                        <button onClick={() => setShowHint(false)}>✕</button>
                    </div>
                    <p>
                        Use <b>prefix sum</b> + <b>hashmap</b> to track previous sums.
                    </p>
                    <p className="text-xs opacity-50">Hint penalty applied</p>
                </div>
            </div>

            {/* ========== EVALUATION MODAL ========== */}
            {showEval && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[var(--card)] rounded-xl p-5 w-[360px] text-sm">
                        <div className="flex items-center gap-2 mb-4 font-semibold text-[var(--accent)]">
                            <BarChart3 size={16} />
                            Interview Evaluation
                        </div>

                        {["Problem Solving", "Communication", "Code Quality", "Optimization"].map(
                            (item) => (
                                <div key={item} className="flex justify-between items-center mb-2">
                                    <span className="opacity-80">{item}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="5"
                                        className="w-12 bg-transparent border-b outline-none text-center"
                                    />
                                </div>
                            )
                        )}

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
